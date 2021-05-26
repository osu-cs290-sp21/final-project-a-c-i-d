import Thread from 'async-threading';
import { Engine, Runner, World, Events, Bodies, Body, Composite, use as useMatterPlugin } from 'matter-js';
import { choose } from 'matter-js/src/core/Common';
import { MatterCollisionEvents } from './lib/matter-collision-events';
import { MatterSparseUpdateEvents } from './lib/matter-sparse-update-events';
import { collision } from './lib/collisionController';
import { generateTerrain } from './lib/levelGeneration';
import { Axes, jump, horizontalMovement, varith, setBodyLabel } from './lib/physics';
import { webSource, asset } from './lib/assetManager';
import { Input, BigBen } from './lib/stateControllers';

const chungus = 'https://purepng.com/public/uploads/large/big-chungus-jkg.png';

// Loads in a plugin that allows the bodies to execute collision callbacks.
useMatterPlugin(MatterCollisionEvents);
useMatterPlugin(MatterSparseUpdateEvents);

// Iain read this
// https://github.com/liabru/matter-js/wiki/Creating-plugins

// Some bird functions
const sprite = (name, flipped = false) => asset(['img', 'sprites', 'svg', name + (flipped ? '-flip' : '') + '.svg'].join('/'));
const birdNames = [];   // ['bella', 'harry', 'olive', 'perry', 'sahana', 'todd'];
const ogBirds = ['andy-bluebird', 'david-penguin', 'cole-kakapo', 'iain-shamathrush'];
const birdAssetNames = [...ogBirds, ...birdNames.map(name => name + '-day')];
const randomBird = () => choose(birdAssetNames);

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
                    this.skin = randomBird();
                    this.updateSprite();
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
        if (Input.upArrow) {
            if (this.isGrounded) {
                this.isGrounded = false;
                const hops = 20;
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

        if (!this.isGrounded && Input.downArrow) {
            this.rotationSpeed = 10;
        }
        if (this.rotationSpeed > 0) {
            const rotation = this.rotationSpeed * dt;
            this.rotationIntegral += rotation;
            Body.setAngle(body, rotation + body.angle);
            if (this.rotationIntegral >= 2 * Math.PI) {
                this.rotationSpeed = 0;
                this.rotationIntegral = 0;
            }
        }
    }

    died() {
        Body.setPosition(this.body, this.spawn);
        this.skin = randomBird();
        this.updateSprite();
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

    stopFlip() {
        this.rotationSpeed = 0;
        Body.setAngle(this.body, 0);
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
        const bouncer = Bodies.rectangle(0,0, 80, 5);
        const ground = Bodies.rectangle(550, 1000, 1, 60, { isStatic: true, friction: 0, frictionStatic: 0 });
        const terrain = generateTerrain([400, 610], 30).concat(generateTerrain([500, 410], 30)).concat(generateTerrain([600, 210], 10)).concat(generateTerrain([700, 10], 30));

        Body.set(ground, 'label', 'ground');
        Body.set(bouncer, 'label', 'boing');

        const player = this.players[0];

        const passthrough = body => {
            body.collisionFilter.group = -1;
            body.collisionFilter.category = 0;
        };
        const pauliExclusion = body => {
            body.collisionFilter.group = 1;
            body.collisionFilter.category = 1;
        }
        pauliExclusion(player.body);

        for (const platform of terrain) {
            if (Math.random() < 0.2) {
                const {x, y} = platform.position;
                const sensor = Bodies.fromVertices(x, y, platform.vertices, {
                    isSensor: true,
                    isStatic: true,
                    render: {
                        fillStyle: 'transparent'
                    }
                });
                Body.set(sensor, 'label', 'boing');
                Composite.add(this.engine.world, sensor);
                passthrough(platform);
                continue;
            }
            Body.set(platform, 'label', 'ground');
            // Body.set(platform, 'hard', false);

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

            passthrough(platform);
            platform.hard = false;
            pauliExclusion(sensor);
            
            Composite.add(this.engine.world, sensor);
        }
        Body.set(bouncer, 'isStatic',true);

        Composite.add(this.engine.world, bouncer);
        Composite.add(this.engine.world, terrain);

        Events.on(this.runner, 'tick', this.update.bind(this)); // Registers the update functions for each update.

        for (const player of this.players) player.setup();
    }

    // Adds a player into the game, as well as the players array.
    addPlayer(player) {
        Composite.add(this.engine.world, player.body); // Adds the player's physics body into the world.
        Events.on(this.runner, 'tick', player.update.bind(player)); // Registers the player's functions to be called when an update happens.

        this.players.push(player); // Adds the player to the array.
    }

    // Called every time a new frame is rendered.
    update() {
        BigBen.deltaTime = this.runner.delta; // Updates the global time variable.
    }

    // Runs the game. This is not control blocking.
    run() {
        BigBen.begin(); // Starts Big Ben
        Runner.run(this.runner, this.engine); // Starts the Matter.js physics
        this.players.map(player => { Events.trigger(player.body, 'awake', {self: player.body}); });
    }

    // Stops the game.
    stop() {
        Runner.stop(this.runner);
    }
}

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