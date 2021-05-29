import { Engine, Runner, World, Events, Bodies, Body, Composite, use as useMatterPlugin } from 'matter-js';
import { choose } from 'matter-js/src/core/Common';
import { MatterCollisionEvents } from './lib/matterjs-plugins/matter-collision-events';
import { MatterSparseUpdateEvents } from './lib/matterjs-plugins/matter-sparse-update-events';
import { generateTerrain } from './lib/levelGeneration';
import { Axes, jump, horizontalMovement } from './lib/physics';
import { Input, BigBen } from './lib/stateControllers';
import * as _ from 'lodash';
import { awakenRickAstley } from './lib/LMAOGOTTEM';
import { sprite, randomBird } from './lib/sprites';
const chungus = 'https://purepng.com/public/uploads/large/big-chungus-jkg.png';

// Loads in a plugin that allows the bodies to execute collision callbacks.
useMatterPlugin(MatterCollisionEvents);
useMatterPlugin(MatterSparseUpdateEvents);

// Iain read this
// https://github.com/liabru/matter-js/wiki/Creating-plugins

export function newPlayer() {
    const p = add(copy(bluePrint), jumpComponent());
}


export class Player {

    constructor(spawn) {
        const { x, y } = spawn;
        this.spawn = { x, y };
        this.skin = randomBird();
        this.isGrounded = false;
        this.orientation = 1; // Bird looking right
        this.rotationSpeed = 0;
        this.rotationIntegral = 0;
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

        // Makes an octagon for the player collider.
        // this.body = Bodies.trapezoid(x, y, 100, 100, 1/3, options);
        this.body = Bodies.polygon(x, y, 16, 50, options);

        this.body.label = 'gamer';
    }

    setup() {
        const onCollisionBegin = (col) => {
            const cases = {
                'ground': () => { this.isGrounded = true; },
                'boing': () => {
                    const bounciness = 16;
                    this.isGrounded = false;
                    jump(this.body, bounciness);
                }
            };
            const other = col.other;
            cases[other.label]?.call();
        };
        const onCollisionEnd = (col) => {
            const cases = {
                'ground': () => { this.isGrounded = false; },
                'boing': () => { this.isGrounded = false; }
            };
            const other = col.other;
            cases[other.label]?.call();
            this.orient();
        };
        const onSparseUpdate = () => {
            let hasFallen = this.body.position.y > 1000;
            if (hasFallen) {
                this.died();
            }
            this.orient();
            // console.log('sparse');
        };

        Events.on(this.body, 'onCollide', onCollisionBegin);
        Events.on(this.body, 'onCollideEnd', onCollisionEnd);

        const sparseTime = 1000/15; // 15 fps
        this.body.sparseUpdateEvery(sparseTime);
        Events.on(this.body, 'sparseUpdate', onSparseUpdate);
    }

    update() {
        const dt = BigBen.deltaTime;
        const body = this.body;

        // Jump
        if (Input.upArrow | Input.spaceBar) {
            if (this.isGrounded) {
                this.isGrounded = false;
                const hops = 20;
                jump(body, hops);
                if (Math.random() > 0.2) {
                    this.rotationSpeed = 20;
                }
            }
        }

        if (Input.leftArrow) {
            if (this.orientation > 0) this.flip();
        } else if (Input.rightArrow) {
            if (this.orientation < 0) this.flip();
        }

        if (Input.leftArrow || Input.rightArrow) {
            const speed = 200;
            const groundSpeedBoost = 50; // This is because of friction
            const zoom = speed + (this.isGrounded ? groundSpeedBoost : 0);
            horizontalMovement(body, zoom * dt * this.orientation);
        } else if (this.isGrounded) {
            Body.setVelocity(body, { x: 0, y: 0 });
        }

        if (this.rotationSpeed > 0) {
            const rotation = this.rotationSpeed * dt;
            this.rotationIntegral += rotation;
            Body.setAngle(body, rotation + body.angle);

            if (this.rotationIntegral >= 2 * Math.PI) {
                this.rotationSpeed = 0;
                this.rotationIntegral = 0;
                Body.setAngle(this.body, 0);
            }
        }
    }

    died() {
        Body.setPosition(this.body, this.spawn);
        this.skin = randomBird();
        this.updateSprite();
        awakenRickAstley();
    }

    flip() {
        this.orientation *= -1;
        Body.setAngle(this.body, 0);
        Body.scale(this.body, this.orientation, 1);
        this.updateSprite();
        this.body.render.sprite.xOffset += 0.2 * this.orientation;
    }

    updateSprite() {
        this.body.render.sprite.texture = Math.random() * 100 < 2 ? chungus : sprite(this.skin, this.orientation > 0);
    }

    orient() {
        if (this.rotationSpeed <= 0) { Body.setAngle(this.body, 0); }
        Body.setAngularVelocity(this.body, 0);
        Body.setInertia(this.body, Infinity);
    }
}