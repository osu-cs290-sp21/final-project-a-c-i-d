import { Engine, Runner, World, Events, Bodies, Body, Composite, use as useMatterPlugin, Vector } from 'matter-js';
import { MatterCollisionEvents } from './lib/matterjs-plugins/matter-collision-events';
import { MatterSparseUpdateEvents } from './lib/matterjs-plugins/matter-sparse-update-events';
import { generateTerrain } from './lib/levelGeneration';
import { Axes, jump } from './lib/physics';
import { BigBen } from './lib/stateControllers';
import { ogBirds, sprite } from './lib/sprites';
import { makeBlock, setPlayer } from './lib/levelObjects';


// Loads in a plugin that allows the bodies to execute collision callbacks.
useMatterPlugin(MatterCollisionEvents);
useMatterPlugin(MatterSparseUpdateEvents);


export class Game {


    constructor() {
        this.engine = Engine.create();
        this.runner = Runner.create();
        this.players = [];
    }


    // Setup the game controller.
    setup() {
        const player = this.players[0];

        // Sets up some sort of scene
        // const bouncer = Bodies.rectangle(0,0, 80, 5);

        const ground = Bodies.rectangle(550, 1000, 1, 60, {
            isStatic: true,
            friction: 0,
            frictionStatic: 0
        });
        const terrain_ = generateTerrain([400, 610], 30).concat(generateTerrain([500, 410], 30)).concat(generateTerrain([600, 210], 10)).concat(generateTerrain([700, 10], 30));

        setPlayer(player.body);
        const p = Vector.add(Vector.mult(Axes.y,100), player.body.position);
        const terrain = [makeBlock(player.body.position, 400, [...Object.values(p),90,10]),...terrain_];

        Body.set(ground, 'label', 'ground');

        // Body.set(bouncer, 'label', 'boing');

        const passthrough = body => {
            body.collisionFilter.group = -1;
            body.collisionFilter.category = 0;
        };

        const pauliExclusion = body => {
            body.collisionFilter.group = 1;
            body.collisionFilter.category = 1;
        };

        pauliExclusion(player.body);

        for (const platform of terrain) {
            // if (Math.random() < 0.2 && terrain.indexOf(platform) != 0) {
            //     const {x, y} = platform.position;
            //     const sensor = Bodies.fromVertices(x, y, platform.vertices, {
            //         isSensor: true,
            //         isStatic: true,
            //         render: {
            //             fillStyle: 'transparent'
            //         }
            //     });
            //     Body.set(sensor, 'label', 'boing');
            //     Composite.add(this.engine.world, sensor);
            //     passthrough(platform);
            //     continue;
            // }

            Body.set(platform, 'hard', false);
            Body.set(platform, 'label', 'ground');

            // const options = {
            //     texture: asset('img/level-objects/dirt-platform.svg'),
            //     xScale: 1, // 1514
            //     yScale: 1 / 4, // 127
            //     visible: true,
            // };
            // [...Object.entries(options)].map(([key, val]) => { platform.render.sprite[key] = val; });

            const {x, y} = platform.position;
            const sensor = Bodies.fromVertices(x, y, platform.vertices, {
                isSensor: true,
                isStatic: true,
                render: {
                    fillStyle: 'transparent'
                }
            });

            Events.on(sensor, 'onCollideEnd', pair => {
                if (pair.other.label === 'gamer') {
                    if (platform.position.y > pair.other.position.y && platform.hard) {
                        passthrough(platform);
                        platform.hard = false;
                    }
                }
            });

            Events.on(sensor, 'onCollide', pair => {
                if (pair.other.label === 'gamer') {
                    if (platform.position.y > pair.other.position.y) {
                        pauliExclusion(platform);
                        platform.hard = true;
                    } else {
                        passthrough(platform);
                        platform.hard = false;
                    }
                }
            });
            
            Events.on(platform, 'movedTo', position => Body.setPosition(sensor, position));

            passthrough(platform);
            platform.hard = false;
            pauliExclusion(sensor);

            Composite.add(this.engine.world, sensor);
        }
        // Body.set(bouncer, 'isStatic',true);

        Composite.add(this.engine.world, terrain);
        // Composite.add(this.engine.world, bouncer);

        Events.on(this.runner, 'tick', this.update.bind(this)); // Registers the update functions for each update.

        for (const player of this.players) {
            player.setup()
        }
    }


    addPlayer(player) { // Adds a player into the game, as well as the players array.
        Composite.add(this.engine.world, player.body); // Adds the player's physics body into the world.
        Events.on(this.runner, 'tick', player.update.bind(player)); // Registers the player's functions to be called when an update happens.
        this.players.push(player); // Adds the player to the array.
    }


    update() { // Called every time a new frame is rendered.
        BigBen.deltaTime = this.runner.delta; // Updates the global time variable.
    }


    run() { // Runs the game. This is not control blocking.
        BigBen.begin(); // Starts Big Ben
        Runner.run(this.runner, this.engine); // Starts the Matter.js physics
        this.players.map(player => { 
            Events.trigger(player.body, 'awake', {
                self: player.body
            });
        });
    }


    stop() { // Stops the game.
        Runner.stop(this.runner);
    }
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
export class ShowoffScene {


    constructor() {
        this.engine = Engine.create();
        this.runner = Runner.create();

        const birds = ogBirds.map(name => {

            const options = {
                render: {
                    sprite: {
                        texture: sprite(name, true),
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

            const idx = ogBirds.indexOf(name);
            const bird = Bodies.rectangle(idx * 200, 0, 50, 50, options);

            const onCollide = col => {
                if (col.other.label === 'ground') {
                    const hops = 10 * Math.random() + 1;
                    jump(bird, hops);
                }
            }

            Events.on(bird, 'onCollide', onCollide);
            bird.sparseUpdateEvery(1000/4);
            Events.on(bird, 'sparseUpdate', () => {
                if (Math.random() < 0.2) {
                    bird.render.sprite.texture = sprite(name, !bird.orientation);
                    bird.orientation = !bird.orientation;
                }
            })
            return bird;
        });

        Composite.add(this.engine.world, birds);
        this.birds = birds;

        const ground = Bodies.rectangle(200, 300, 1000, 10, { isStatic: true, friction: 0, frictionStatic: 0 });
        Body.set(ground, 'label', 'ground');
        Composite.add(this.engine.world, ground);
        this.ground = ground;
    }


    run() {
        Runner.run(this.runner, this.engine);
        for (const bird of this.birds) Events.trigger(bird, 'awake', { self: bird });
    }


    stop() {
        Runner.stop(this.runner);
    }


}
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// import game from './game';
//
// function main() {
//     const sc = new SceneController();
//     add('game', {
//         initScene: game.setup,
//         startScene: game.start,
//         updateScene: game.update
//     });
// }


// David and Iain's meeting. here you go
//
// export class StateController {
//     constructor(table) {
//         this.table = table;
//     }
//     canTransitionTo(requestedState) {
//         //
//
//     }
//     transition(newState) {
//         //
//     }
// }
//
// export function transition(currentState, next) {
//     //
// }
//
// class SceneController {
//     constructor() {
//         this.transitionTable = [
//             //
//         ]
//     }
//     add(sceneName, { initScene, startScene, updateScene, stopScene })
// }

