import Thread from 'async-threading';
import { Engine,Runner, World, Events, Bodies, Body, Composite, use as useMatterPlugin } from 'matter-js';
import { choose } from 'matter-js/src/core/Common';
import { MatterCollisionEvents } from './lib/matter-collision-events';
import { collision } from './lib/collisionController';
import { generateTerrain } from './lib/levelGeneration';
import { Axes, jump, horizontalMovement, varith, setBodyLabel } from './lib/physics';
import { webSource, asset } from './lib/assetManager';

useMatterPlugin(MatterCollisionEvents);


// This is just a global variable for the game time.
// This method is more efficient.
export const BigBen = {
    delta: 0.0,
    start: null,
    set deltaTime(delta) {
        this.delta = delta/1000.0;
    },
    get deltaTime() {
        return this.delta;
    },
    begin() {
        this.start = new Date();
    }
};

// Global manager for the key presses.
export const Input = {
    keys: [...new Array(256)].map(e => false), // Array of 256 false values.
    get upArrow() { return Input.keys[38]; },
    get rightArrow() { return Input.keys[39]; },
    get leftArrow() { return Input.keys[37]; },
    get downArrow() { return Input.keys[40]; }
};

// Some bird functions
const sprite = (name, flipped = false) => asset(['img', 'sprites', 'svg', name + (flipped ? '-flip' : '') + '.svg'].join('/'));
const birdNames = ['bella', 'harry', 'olive', 'perry', 'sahana', 'todd'];
const birdAssetNames = ['angry-nohat', ...birdNames.map(name => name + '-day')];
const randomBird = () => choose(birdAssetNames);

export class Player {

    constructor(spawn) {
        this.spawn = spawn;
        const {x, y} = spawn;
        this.skin = randomBird();
        this.isGrounded = false;
        this.orientation = 1; // Bird looking right

        const options = {
            render: {
                sprite: {
                    texture: sprite(this.skin, true),
                    xScale: 1/3,
                    yScale: 1/3,
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

        // this.body = Bodies.rectangle(spawnPos.x, spawnPos.y, 64, 64, options);
        this.body = Bodies.polygon(x, y, 8, 50, options);
        this.body.label = 'gamer';

        // Body.setInertia(this.body, Infinity);
        // Body.setAngle(this.body, 0);
        // Body.setMass(this.body, 1);

        this.body.onCollide(this.initialCollision.bind(this));
        this.body.onCollideEnd(this.finaleCollision.bind(this));
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
            const groundSpeedBoost = 50;
            const zoom = speed + (this.isGrounded ? groundSpeedBoost : 0);
            // horizontalMovement(body, speed * dt * this.orientation);
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

    initialCollision(pair) {
        const cases = {
            'ground': () => {
                this.isGrounded = true;
            },
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
    }
    finaleCollision(pair) {
        const cases = {
            'ground': () => {
                this.isGrounded = false;
            },
            'boing': () => {
                this.isGrounded = false;
            }
        };
        const other = collision.otherBody(pair);
        cases[other.label]?.call();

        this.orient();
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
        this.box = Bodies.rectangle(400, 200, 80, 5);
        this.ground = Bodies.rectangle(400, 1000, 1, 60, { isStatic: true, friction: 0, frictionStatic: 0 });
        this.ground.label = 'ground';
        this.box.label = 'boing';

        const ball = Bodies.circle(550, 200, 30);
        ball.onCollide(pair => console.log(collision.otherBody(pair)));

        // Adds the bodies into the world
        // World.add(this.engine.world, [this.box, this.ground]);
        World.add(this.engine.world, [this.ground, this.box, ball]);
        
        this.terrain = generateTerrain([400, 610], 10)
            .map(platform => {
                Body.set(platform, 'label', 'ground');
                const options = {
                    texture: asset('img/level-objects/dirt-platform.svg'),
                    xScale: 1/5, // 1514
                    yScale: 1/4, // 127
                    visible: true,
                };
                [...Object.entries(options)].map(([key,val]) => { platform.render.sprite[key] = val; });
                return platform;
            });
        World.add(this.engine.world, this.terrain);

        // Registers the update functions for each update.
        Events.on(this.engine, 'beforeUpdate', this.preUpdate.bind(this));
        Events.on(this.runner, 'tick', this.update.bind(this));
    }

    // Adds a player into the game, as well as the players array.
    addPlayer(player) {
        // Adds the player's physics body into the world.
        World.add(this.engine.world, player.body);

        // Registers the player's functions to be called when an update happens.
        // Events.on(this.engine, 'beforeUpdate', player.updatePhysics.bind(player));
        Events.on(this.runner, 'tick', player.update.bind(player));

        // Adds the player to the array.
        this.players.push(player);

    }

    // Called every time a new frame is rendered.
    update() {
        // Updates the global time variable.
        BigBen.deltaTime = this.runner.delta;
    }
    sparseUpdate() {
        for (const player of this.players) {
            player.sparseUpdate();
        }
    }

    // Just called before anything else in the game, every frame.
    preUpdate() {}

    // Runs the game. This is not control blocking.
    run() {
        // Starts Big Ben
        BigBen.begin();
        // Starts the Matter.js physics
        Runner.run(this.runner, this.engine);
        const sparseTime = 1000/30; // ms
        this.sparseUpdaterThread = new Thread(this.sparseUpdate.bind(this), sparseTime, true);
    }

    // Stops the game.
    stop() {
        Runner.stop(this.runner);
        this.sparseUpdaterThread.kill();
    }
}