import { Engine, Render, World, Events, Bodies, Body, Vector } from 'matter-js';


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

export class Player {

    constructor(spawnPos) {
        this.body = Bodies.trapezoid(spawnPos.x, spawnPos.y, 40, 40, 1);
        this.keys = [];
    }

    update() {
        this.movement();
    }

    movement() {
        //reset position
        if (this.keys[40]) {
            this.body.position = { x: 200, y: 200 };
        }
        //jump
        if (this.keys[38]) {
            this.body.force = Vector.mult(getUpVector(this.body), 0.005);
        }
        //spin left and right
        if (this.keys[37] && this.body.angularVelocity > -0.2) {
            this.body.torque = -0.03;
        } else {
            if (this.keys[39] && this.body.angularVelocity < 0.2) {
                this.body.torque = 0.03;
            }
        }
    }
}


export class Game {

    constructor() {
        // Game States
        this.engine = Engine.create();

        this.box = Bodies.rectangle(450, 50, 80, 80);
        this.ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
        World.add(this.engine.world, [this.box, this.ground]);
        this.players = [];
    }

    load(data) {
        this.engine.world = data;
    }

    onNewConnection() {
        const newPlayer = new Player({ x: 200, y: 200 }, this.engine.world);
        this.players.push(newPlayer);
        return newPlayer;
    }

    addPlayer(player) {
        World.add(this.engine.world, player.body);
        // Events.on(this.engine.world, 'tick', player.update.bind(player));
        this.players.push(player);
    }

    onEndConnection(player) {
        const index = this.players.indexOf(player);
        if (index > -1) this.players.splice(index, 1);

        World.remove(this.engine.world, player.body);
    }

    update() {
        // console.log(this.engine.world.bodies);
        // Events.trigger(this.engine, 'tick');
        
        const deltaTime = this.engine.timing.lastElapsed;

        for (const player of this.players) {
            player.update(deltaTime);
        }
        
        Engine.update(this.engine);
    }
}