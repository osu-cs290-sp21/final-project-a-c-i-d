import Thread from 'async-threading';
import { Engine, Runner, World, Events, Bodies, Body, Composite, use as useMatterPlugin } from 'matter-js';
import { choose } from 'matter-js/src/core/Common';
import { MatterCollisionEvents } from './lib/matter-collision-events';
import { collision } from './lib/collisionController';
import { generateTerrain } from './lib/levelGeneration';
import { Axes, jump, horizontalMovement, varith, setBodyLabel } from './lib/physics';
import { webSource, asset } from './lib/assetManager';
import { Input, BigBen } from './lib/stateControllers';

// Loads in a plugin that allows the bodies to execute collision callbacks.
useMatterPlugin(MatterCollisionEvents);

// Iain read this
// https://github.com/liabru/matter-js/wiki/Creating-plugins

// Some bird functions
const sprite = (name, flipped = false) => asset(['img', 'sprites', 'svg', name + (flipped ? '-flip' : '') + '.svg'].join('/'));
const birdNames = ['bella', 'harry', 'olive', 'perry', 'sahana', 'todd'];
const birdAssetNames = ['angry-nohat', ...birdNames.map(name => name + '-day')];
const randomBird = () => choose(birdAssetNames);

export class Player {

    constructor(spawn) {
        const { x, y } = spawn;
        this.spawn = { x, y };
        this.skin = randomBird();
        this.isGrounded = false;
        this.orientation = 1; // Bird looking right

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
        this.body = Bodies.polygon(x, y, 8, 50, options);
        this.body.label = 'gamer';
    }

    setup() {
        const onCollisionBegin = pair => {
            const cases = {
                'ground': () => { this.isGrounded = true; },
                'boing': () => {
                    const bounciness = 10;
                    this.isGrounded = false;
                    jump(this.body, bounciness);
                    this.skin = randomBird();
                    this.updateSprite();
                }
            };
            const other = collision.otherBody(pair);
            cases[other.label]?.call();
        };
        const onCollisionEnd = pair => {
            const cases = {
                'ground': () => { this.isGrounded = false; },
                'boing': () => { this.isGrounded = false; }
            };
            const other = collision.otherBody(pair);
            cases[other.label]?.call();
            this.orient();
        };

        this.body.onCollide(onCollisionBegin);
        this.body.onCollideEnd(onCollisionEnd);
    }

    update() {
        const dt = BigBen.deltaTime;
        const body = this.body;

        // Jump
        if (Input.upArrow) {
            if (this.isGrounded) {
                this.isGrounded = false;
                const hops = 12;
                jump(body, hops);
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
    }

    flip() {
        this.orientation *= -1;
        Body.setAngle(this.body, 0);
        Body.scale(this.body, this.orientation, 1);
        this.updateSprite();
        this.body.render.sprite.xOffset += 0.2 * this.orientation;
    }

    updateSprite() { this.body.render.sprite.texture = sprite(this.skin, this.orientation > 0); }

    sparseUpdate() {
        const hasFallen = this.body.position.y > 1000;
        if (hasFallen) {
            Body.setPosition(this.body, this.spawn);
        }
        this.orient();
    }

    orient() {
        Body.setAngle(this.body, 0);
        Body.setAngularVelocity(this.body, 0);
        Body.setInertia(this.body, Infinity);
    }
}

export class Game {

    constructor() {
        this.engine = Engine.create();
        this.runner = Runner.create();

        this.players = [];
    }

    // Setup the game controller.
    setup() {
        // Sets up some sort of scene
        const bouncer = Bodies.rectangle(400, 200, 80, 5);
        const ground = Bodies.rectangle(400, 1000, 1, 60, { isStatic: true, friction: 0, frictionStatic: 0 });
        const terrain = generateTerrain([400, 610], 10);

        Body.set(ground, 'label', 'ground');
        Body.set(bouncer, 'label', 'boing');

        for (const platform of terrain) {
            Body.set(platform, 'label', 'ground');
            const options = {
                texture: asset('img/level-objects/dirt-platform.svg'),
                xScale: 1 / 5, // 1514
                yScale: 1 / 4, // 127
                visible: true,
            };
            [...Object.entries(options)].map(([key, val]) => { platform.render.sprite[key] = val; });
        }

        World.add(this.engine.world, [ground, bouncer]);
        World.add(this.engine.world, terrain);
        Events.on(this.runner, 'tick', this.update.bind(this)); // Registers the update functions for each update.

        for (const player of this.players) player.setup();
    }

    // Adds a player into the game, as well as the players array.
    addPlayer(player) {
        World.add(this.engine.world, player.body); // Adds the player's physics body into the world.
        Events.on(this.runner, 'tick', player.update.bind(player)); // Registers the player's functions to be called when an update happens.

        this.players.push(player); // Adds the player to the array.
    }

    // Called every time a new frame is rendered.
    update() {
        BigBen.deltaTime = this.runner.delta; // Updates the global time variable.
    }
    
    sparseUpdate() {
        for (const player of this.players) {
            player.sparseUpdate();
        }
    }

    // Runs the game. This is not control blocking.
    run() {
        BigBen.begin(); // Starts Big Ben
        Runner.run(this.runner, this.engine); // Starts the Matter.js physics

        const sparseTime = 1000 / 30; // Thirty times a second. 
        this.sparseUpdaterThread = new Thread(this.sparseUpdate.bind(this), sparseTime, true);
    }

    // Stops the game.
    stop() {
        Runner.stop(this.runner);
        this.sparseUpdaterThread.kill();
    }
}