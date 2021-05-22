import Thread from 'async-threading';
import { Engine, Render, Runner, World, Events, Bodies, Body, Vector, SAT, Composite } from 'matter-js';
import { AssetManager } from './lib/assetManager';
import { CollisionController } from './lib/collisionController';
import { generateTerrain } from './lib/levelGeneration';

function sprite(name, flipped = false) {
    return 'http://localhost:9000/sprites/svg/' + name + (flipped ? '-flip' : '') + '.svg';
}

const birdNames = ['angry-nohat', ...['bella', 'harry', 'olive', 'perry', 'sahana', 'todd'].map(name => name + '-day')];
const randomBird = () => birdNames[Math.floor(Math.random() * birdNames.length)];


function getUpVector(body) {
    return {
        x: Math.cos(body.angle - (Math.PI / 2.0)),
        y: Math.sin(body.angle - (Math.PI / 2.0))
    };
}

function getRightVector(body) {
    return {
        x: Math.cos(body.angle),
        y: Math.sin(body.angle)
    };
}

const Axes = {
    get x() { return {x: 1, y: 0 }; },
    get y() { return {x: 0, y: -1 }; }
};


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

function jump(body, magnitude) {
    const velocity = { x: body.velocity.x, y: -magnitude };
    Body.setVelocity(body, velocity);
}

function horizontalMovement(body, magnitude) {
    const velocity = { x: magnitude, y: body.velocity.y };
    Body.setVelocity(body, velocity);
}

// Global manager for the key presses.
export const Input = {
    keys: [...new Array(256)].map(e => false), // Array of 256 false values.
    get upArrow() { return Input.keys[38]; },
    get rightArrow() { return Input.keys[39]; },
    get leftArrow() { return Input.keys[37]; },
    get downArrow() { return Input.keys[40]; }
};

function safeMag(vector) {
    return Math.max(Vector.magnitude(vector), 0.000000001);
}

export class Player {

    /*
        body: Matter.Body;
    */

    constructor(spawnPos) {
        this.spawnPos = spawnPos
        const {x, y} = spawnPos;
        this.skin = randomBird();
        const options = {
            render: {
                sprite: {
                    texture: sprite(this.skin, true), // sprite('angry-nohat', true),
                    xScale: 1/3,
                    yScale: 1/3,
                    xOffset: 0.2,
                }
            },
            friction: 0,
            frictionStatic: 0,
            frictionAir: 0,
            inertia: Infinity,

        };

        // this.body = Bodies.rectangle(spawnPos.x, spawnPos.y, 64, 64, options);
        this.body = Bodies.polygon(spawnPos.x, spawnPos.y, 8, 50, options);
        this.body.label = 'gamer';
        this.isGrounded = false;
        this.orientation = 1; // Bird looking right

        Body.setInertia(this.body, Infinity);
        Body.setAngle(this.body, 0);
        Body.setMass(this.body, 1);

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
            const speed = 100;
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

    updatePhysics() {

    }

    sparseUpdate() {
        // Body.setAngle(this.body, 0);
        // Body.setAngularVelocity(this.body, 0);
        // Body.setInertia(this.body, Infinity);
        const hasFallen = this.body.position.y > 1000;

        if (hasFallen) {
            Body.setPosition(this.body, this.spawnPos);
        }
        this.orient();
    }

    orient() {
        Body.setAngle(this.body, 0);
        Body.setAngularVelocity(this.body, 0);
        Body.setInertia(this.body, Infinity);
    }

    initialCollision(other) {
        const cases = {
            'ground': () => {
                this.isGrounded = true;
            },
            'boing': () => {
                const bounciness = 10;
                this.isGrounded = false;
                jump(this.body, bounciness);
                this.skin = birdNames[Math.floor(Math.random() * birdNames.length)];
                this.updateSprite();
            }
        };
        cases[other.label]?.call();
    }
    finaleCollision(other) {
        const cases = {
            'ground': () => {
                this.isGrounded = false;
            },
            'boing': () => {
                this.isGrounded = false;
            }
        };
        cases[other.label]?.call();
        this.orient();

    }
}

export class Game {

    /*
        engine: Matter.Engine;
        runner: Matter.Runner;

        players: Player[];

        box: Matter.Body;
        ground: Matter.Ground;

    */

    constructor() {
        this.engine = Engine.create();
        this.runner = Runner.create();
        this.collisionController = new CollisionController();

        this.players = [];
    }

    // Setup the game controller.
    setup() {
        // Sets up some sort of scene
        this.box = Bodies.rectangle(400, 200, 80, 5);
        this.ground = Bodies.rectangle(400, 1000, 1, 60, { isStatic: true, friction: 0, frictionStatic: 0 });
        this.ground.label = 'ground';
        this.box.label = 'boing';

        // Adds the bodies into the world
        // World.add(this.engine.world, [this.box, this.ground]);
        World.add(this.engine.world, [this.ground, this.box]);

        this.terrain = generateTerrain([400, 610], 10);
        this.terrain.map(platform => {
            platform.label = 'ground';
        });
        World.add(this.engine.world, this.terrain);

        // Registers the update functions for each update.
        Events.on(this.engine, 'beforeUpdate', this.preUpdate.bind(this));
        Events.on(this.runner, 'tick', this.update.bind(this));

        Events.on(this.engine, 'collisionStart', this.collisionController.initialCollision.bind(this.collisionController));
        Events.on(this.engine, 'collisionActive', this.collisionController.continuousCollision.bind(this.collisionController));
        Events.on(this.engine, 'collisionEnd', this.collisionController.finaleCollision.bind(this.collisionController));

    }

    // Adds a player into the game, as well as the players array.
    addPlayer(player) {
        // Adds the player's physics body into the world.
        World.add(this.engine.world, player.body);

        // Registers the player's functions to be called when an update happens.
        Events.on(this.engine, 'beforeUpdate', player.updatePhysics.bind(player));
        Events.on(this.runner, 'tick', player.update.bind(player));

        // Adds the player to the array.
        this.players.push(player);

        this.collisionController.register(player.body, player.initialCollision.bind(player), 'initial');
        this.collisionController.register(player.body, player.finaleCollision.bind(player), 'finale');
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