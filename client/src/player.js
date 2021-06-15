import { Engine, Runner, World, Events, Bodies, Body, Composite, use as useMatterPlugin } from 'matter-js'
import { choose } from 'matter-js/src/core/Common'
import { MatterCollisionEvents } from './lib/matterjs-plugins/matter-collision-events'
import { MatterSparseUpdateEvents } from './lib/matterjs-plugins/matter-sparse-update-events'
import { Axes, jump, horizontalMovement, stop } from './lib/physics'
import { Input, BigBen } from './lib/stateControllers'
import { sprite } from './lib/sprites'
import { BetterBody } from './lib/matterjs-plugins/matter-better-body'


// Iain read this.
// https://github.com/liabru/matter-js/wiki/Creating-plugins
// Loads in a plugin that allows the bodies to execute collision callbacks.
useMatterPlugin(MatterCollisionEvents)
useMatterPlugin(MatterSparseUpdateEvents)
useMatterPlugin(BetterBody);

var ax = null;
// setInterval( () => console.log('ignoreme', ax.shift()), 4000);
export function newPlayer() {
    const p = add(copy(bluePrint), jumpComponent())
}


export class Player {


    constructor(spawn) {
        this.name = undefined;
        const { x, y } = spawn;
        this.spawn = { x, y };
        this.skin = 'bella';
        this.isGrounded = false;
        this.orientation = 1; // Bird looking right.
        this.rotationSpeed = 0;
        this.rotationIntegral = 0;
        this.chunk = false;
        this.onDiedCallback = null;
        const options = {
            render: {
                sprite: {
                    texture: sprite(this.skin, true),
                    xScale: 1 / 3,
                    yScale: 1 / 3,
                    xOffset: 0.2,
                    yOffset: 0.06,
                }
            },
            friction: 0,
            frictionStatic: 0,
            frictionAir: 0,
            inertia: Infinity,
            angle: 0,
            mass: 1,
        };
        // Makes a 16-gon for the player collider.
        this.body = Bodies.polygon(x, y, 16, 50, options);
        this.body.label = 'gamer';
        this.body['highest'] = 0;
        Body.set(this.body, 'highest', this.body.position.y)
    }


    setup() {
        const onCollisionBegin = (col) => {
            const cases = {
                'ground': () => { this.isGrounded = true },
                'boing': () => {
                    const bounciness = 16
                    this.isGrounded = false
                    jump(this.body, bounciness)
                }
            };
            const other = col.other;
            cases[other.label]?.call();
        }

        const onCollisionEnd = (col) => {
            const cases = {
                'ground': () => { this.isGrounded = false },
                'boing': () => { this.isGrounded = false }
            };
            const other = col.other;
            cases[other.label]?.call();
            this.orient();
        }

        const onSparseUpdate = () => {
            const y = this.body.position.y
            const highest = this.body['highest']
            if (y - highest > 500) { this.died(); }
            this.orient()
        }

        Events.on(this.body, 'onCollide', onCollisionBegin)
        Events.on(this.body, 'onCollideEnd', onCollisionEnd)

        const sparseTime = 1000 / 3 // 15 fps.
        this.body.sparseUpdateEvery(sparseTime)
        Events.on(this.body, 'sparseUpdate', onSparseUpdate)
    }


    update() {
        const dt = BigBen.deltaTime
        const body = this.body

        // Jump!
        if (Input.upArrow) {
            if (this.isGrounded) {
                this.isGrounded = false
                const hops = 200
                jump(body, hops)
                this.rotationSpeed = 20
            }
        }

        if (Input.leftArrow) {
            if (this.orientation > 0) {
                this.flip();
            }
        } else if (Input.rightArrow) {
            if (this.orientation < 0) {
                this.flip();
            }
        }

        if (Input.get('KeyV')) {
            console.log(body.velocity, {...body.force}, body.speed, body.mass);
        }
        if (Input.get('KeyG')) {
            this.isGrounded = true;
        }
        // const a = [... new Array(100000)].map(e => 1);
        // ax = [...a].reverse();

        if (Input.leftArrow || Input.rightArrow) {
            const speed = 200
            const groundSpeedBoost = 20 // This is because of friction.
            const zoom = speed + (this.isGrounded ? groundSpeedBoost : 0)
            horizontalMovement(body, zoom * this.orientation)
        } else if (this.isGrounded) {
            stop(body);
        }

        if (this.rotationSpeed > 0) {
            const rotation = this.rotationSpeed * dt
            this.rotationIntegral += rotation
            Body.setAngle(body, rotation + body.angle)

            if (this.rotationIntegral >= 2 * Math.PI) {
                this.rotationSpeed = 0;
                this.rotationIntegral = 0;
                Body.setAngle(this.body, 0);
            }
        }

        if (this.body['highest'] > this.body.position.y) {
            this.body['highest'] = this.body.position.y;
        }

        const x = this.body.position.x
        const y = this.body.position.y + 50 // even skim the bottom, you die
        const w = window.innerWidth / 2

        if      (x < -w) { Body.setPosition(body, { x:  w, y: y }) }
        else if (x >  w) { Body.setPosition(body, { x: -w, y: y }) }
    }


    died() {
        if (this.onDiedCallback != null) {
            Events.trigger(this.body, 'destroy', {self: this.body});
            this.onDiedCallback()
        }
    }


    flip() {
        this.orientation *= -1
        Body.setAngle(this.body, 0)
        Body.scale(this.body, this.orientation, 1)
        this.updateSprite()
        this.body.render.sprite.xOffset += 0.2 * this.orientation
    }


    updateSprite() {
        this.body.render.sprite.texture = sprite(this.skin, this.orientation > 0)
    }


    orient() {
        if (this.rotationSpeed <= 0) { Body.setAngle(this.body, 0) }
        Body.setAngularVelocity(this.body, 0)
        Body.setInertia(this.body, Infinity)
    }


}

