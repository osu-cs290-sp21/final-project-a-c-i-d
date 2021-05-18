import { Engine, Render, Runner, World, Events, Bodies, Body, Vector } from 'matter-js';


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

export class Player {

    /*
        body: Matter.Body;
    */

    constructor(spawnPos) {
        this.body = Bodies.trapezoid(spawnPos.x, spawnPos.y, 40, 40, 1);
    }

    updatePhysics() {
        const dt = BigBen.deltaTime;
        const body = this.body;

        // Reset position
        if (Input.downArrow) {
            body.position = { x: 200, y: 200 };
        }
        // Jump
        if (Input.upArrow) {
            body.force = Vector.mult(getUpVector(body), 0.07 * dt);
        }
        // Spin left and right
        if (Input.leftArrow && body.angularVelocity > -0.2) {
            this.body.torque = -0.03 * dt;
        } else {
            if (Input.rightArrow && body.angularVelocity < 0.2) {
                body.torque = 0.03 * dt;
            }
        }
    }

    update() {

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

        this.players = [];
        this.setup();
    }

    // Setup the game controller.
    setup() {
        // Sets up some sort of scene
        this.box = Bodies.rectangle(450, 50, 80, 80);
        this.ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

        // Adds the bodies into the world
        World.add(this.engine.world, [this.box, this.ground]);

        // Registers the update functions for each update.
        Events.on(this.engine, 'beforeUpdate', this.preUpdate.bind(this));
        Events.on(this.runner, 'tick', this.update.bind(this));
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
    }

    // Called every time a new frame is rendered.
    update() {
        // Updates the global time variable.
        BigBen.deltaTime = this.runner.delta;
    }

    // Just called before anything else in the game, every frame.
    preUpdate() {}

    // Runs the game. This is not control blocking.
    run() {
        // Starts Big Ben
        BigBen.begin();
        // Starts the Matter.js physics
        Runner.run(this.runner, this.engine);
    }

    // Stops the game.
    stop() {
        Runner.stop(this.runner);
    }
}

