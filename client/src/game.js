import { Engine, Runner, World, Events, Bodies, Body, Composite, use as useMatterPlugin, Vector } from 'matter-js'
import { MatterCollisionEvents } from './lib/matterjs-plugins/matter-collision-events'
import { MatterSparseUpdateEvents } from './lib/matterjs-plugins/matter-sparse-update-events'
import { Axes, jump, diff } from './lib/physics'
import { BigBen } from './lib/stateControllers'
import { ogBirds, sprite } from './lib/sprites'
import { getTerrain, makeTerrain } from './lib/levelObjects'


// Loads in a plugin that allows the bodies to execute collision callbacks.
useMatterPlugin(MatterCollisionEvents)
useMatterPlugin(MatterSparseUpdateEvents)


export class Game {


    constructor() {
        this.engine  = Engine.create()
        this.runner  = Runner.create()

        this.height  = -window.innerHeight*2
        this.player  = undefined
        this.sensors = []
        this.terrain = []
        this.points  = []
    }


    setup() { // Setup the game controller.
        const earth  = Bodies.rectangle(0, 50, window.innerWidth,  1, {
            friction:       0,
            frictionStatic: 0,
            isStatic:       true,
            restitution:    1,
        })

        const points  = getTerrain(this.player.body['highest'])
            // .concat(this.points)
        // this.terrain = makeTerrain(this.points).concat(earth)
        //     .concat(this.terrain)
        this.addTerrain([earth, ...makeTerrain(points)])

        // Registers the update functions for each update.
        Events.on(this.runner, 'tick', this.update.bind(this))

        this.player.setup()
    }


    addTerrain(terrain) {
        console.log('terrain added')
        const passthrough    = body => { body.collisionFilter.group    = -1
                                         body.collisionFilter.category =  0 }
        const pauliExclusion = body => { body.collisionFilter.group    =  1
                                         body.collisionFilter.category =  1 }
        pauliExclusion(this.player.body)
        if (this.engine.world.bodies.length > 100) {
            console.log('too many bodies!')
            return;
        }
        // const temp = new Array(this.terrain.length)
        for (let i = terrain.length-1; i >= 0; i--) {
            const platform = terrain[i]
            const { x, y } = platform.position
            const sensor = Bodies.fromVertices(x, y, platform.vertices, {
                isSensor: true,
                isStatic: true,
                render: {
                    fillStyle: 'white'// 'transparent'
                }
            })
            Body.set(platform, 'hard' , false)
            Body.set(platform, 'label', 'ground')

            platform.sparseUpdateEvery(5000)

            Events.on(platform, 'sparseUpdate', o => {
                if (diff(platform.position, this.player.body.position) > 500 && platform.label != 'gamecontroller') {
                    console.log('before', this.engine.world.bodies.length);
                    Composite.remove(this.engine.world, platform);
                    Composite.remove(this.engine.world, sensor);
                    console.log('after', this.engine.world.bodies.length);
                }
            })

            if (false && 
                Math.random() < 0.2) {
                Body.set(sensor, 'label', 'boing')
                // temp[i] = sensor
                Composite.add(this.engine.world, sensor)
                Composite.add(this.engine.world, platform)
                passthrough(platform)
                continue
            }

            Events.on(sensor, 'onCollideEnd', pair => {
                if (pair.other.label === 'gamer') {
                    if (platform.position.y > pair.other.position.y && platform.hard) {
                        passthrough(platform)
                        platform.hard = false
                    }
                }
            })

            Events.on(sensor, 'onCollide', pair => {
                if (pair.other.label === 'gamer') {
                    if (platform.position.y > pair.other.position.y) {
                        pauliExclusion(platform)
                        platform.hard = true
                    } else {
                        passthrough(platform)
                        platform.hard = false
                    }
                }
            })


            // Events.on(platform, 'movedTo', position => {
            //     return Body.setPosition(sensor, position)
            // })

            passthrough(platform)
            platform.hard = false
            pauliExclusion(sensor)

            // temp[i] = sensor
            Composite.add(this.engine.world, sensor)
            Composite.add(this.engine.world, platform)

            Events.trigger(platform, 'awake', { self: platform })

        }
        // this.sensors = temp.concat(this.sensors)

        /* shhhh don't worry about it */
        const gameController = Bodies.rectangle(-69,69,1,1,{
            isStatic: true
        });
        gameController.label = 'gamecontroller'
        gameController.sparseUpdateEvery(500);
        Events.on(gameController, 'sparseUpdate', this.sparseUpdate.bind(this));
        this.gameController = gameController
        Composite.add(this.engine.world, gameController);
    }


    // Adds a player into the game, as well as the players array.
    addPlayer(player) {
        // Adds the player's physics body into the world.
        Composite.add(this.engine.world, player.body)
        // Registers the player's functions to be called when an update happens.
        Events.on(this.runner, 'tick', player.update.bind(player))
        this.player = player // Adds the player to the array.
        // ^ Used to be `this.players` array intended for multiplayer.
    }


    update() { // Called every time a new frame is rendered.
        BigBen.deltaTime = this.runner.delta // Updates global time variable.
        // this.sparseUpdate();
    }


    sparseUpdate() {
        if (this.player.body.position.y < this.height) {
            this.height -= window.innerHeight*2
            // this.points  = getTerrain(this.player.body['highest'])
            //     .concat(this.points)
            // this.terrain = makeTerrain(this.points)
            //     .concat(this.terrain)
            const points  = getTerrain(this.player.body['highest'])
            
            this.addTerrain(makeTerrain(points))

            const density = Math.floor(window.innerWidth * window.innerHeight/25000)
        }

        // if (this.player.body.position.y < 
        //     this.points[this.points.length-1].y - (window.innerHeight/2)) {
        //     this.points.pop()
        //     Composite.remove(this.engine.world, this.terrain.pop())
        //     Composite.remove(this.engine.world, this.sensors.pop())
        // }

        // this.cleanUpBodies();
    }

    cleanUpBodies() {
        if (this.engine.world.bodies.length > 100) {
            const pp = this.player.body.position;
            for (const body of this.engine.world.bodies) {
                if (diff(body.position, pp) > 500) {
                    Events.trigger(body, 'destroy', {self: body});
                    Composite.remove(this.engine.world, body);
                }
            }
        }
    }


    run() { // Runs the game. This is not control blocking.
        console.log('game started');
        BigBen.begin() // Starts Big Ben.
        Runner.run(this.runner, this.engine) // Starts the Matter.js physics.
        Events.trigger(this.player.body, 'awake', { self: this.player.body })
        Events.trigger(this.gameController, 'awake', {
            self: this.gameController
        })
        setInterval(() => { 
            console.log(this.points.length,
                        this.terrain.length,
                        this.sensors.length,
                        this.engine.world.bodies.length
        )}, 1000)
    }


    stop() { // Stops the game.
        Runner.stop(this.runner)
    }

    destroy() {
        Events.trigger(this.gameController, 'destroy', {self: this.gameController});
        this.player.destroy();
        this.gameController = null;
        this.runner = null;
        this.engine = null;
        this.player = null;
    }


}

