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

export class Player {

    constructor(spawnPos) {
        this.body = Bodies.trapezoid(spawnPos.x, spawnPos.y, 40, 40, 1);
        this.keys = [];
    }

    updatePhysics() {

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
        this.runner = Runner.create();
        this.render = null;
    }

    setup() {
        Events.on(this.engine, 'beforeUpdate', this.preUpdate.bind(this));
        Events.on(this.runner, 'tick', this.update.bind(this));
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
        Events.on(this.engine, 'beforeUpdate', player.updatePhysics.bind(player));
        Events.on(this.runner, 'tick', player.update.bind(player));
        this.players.push(player);
    }

    onEndConnection(player) {
        const index = this.players.indexOf(player);
        if (index > -1) this.players.splice(index, 1);

        World.remove(this.engine.world, player.body);
    }

    setRender(render) {
        this.render = render;
    }

    update() {
        
    }
    preUpdate() {

    }

    run() {
        Runner.run(this.runner, this.engine);
    }
}