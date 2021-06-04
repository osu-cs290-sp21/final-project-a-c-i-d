import { Engine, Runner, World, Events, Bodies, Body, Composite, use as useMatterPlugin, Vector } from 'matter-js'
import { MatterCollisionEvents } from './lib/matterjs-plugins/matter-collision-events'
import { MatterSparseUpdateEvents } from './lib/matterjs-plugins/matter-sparse-update-events'
import { Axes, jump } from './lib/physics'
import { BigBen } from './lib/stateControllers'
import { ogBirds, sprite } from './lib/sprites'
import { makeBlock } from './lib/levelObjects'


// Loads in a plugin that allows the bodies to execute collision callbacks.
useMatterPlugin(MatterCollisionEvents)
useMatterPlugin(MatterSparseUpdateEvents)


export class Game {


    constructor() {
        this.engine  = Engine.create()
        this.runner  = Runner.create()
        this.players = []
    }


    setup() { // Setup the game controller.
        const player = this.players[0]

        let nest = [Bodies.rectangle(0, 100, 90, 20, {
            friction:       0,
            frictionStatic: 0,
            isStatic:       true,
            restitution:    1,
        })]

        const terrain = nest.concat([... new Array(100)].map(() => {
            return makeBlock(player.body['highest'])
        }))

        const passthrough    = body => { body.collisionFilter.group    = -1
                                         body.collisionFilter.category =  0 }
        const pauliExclusion = body => { body.collisionFilter.group    =  1
                                         body.collisionFilter.category =  1 }
        pauliExclusion(player.body)

        for (const platform of terrain) {
            const { x, y } = platform.position
            const sensor = Bodies.fromVertices(x, y, platform.vertices, {
                isSensor: true,
                isStatic: true,
                render: {
                    fillStyle: 'transparent'
                }
            })

            if (Math.random() < 0.2 && terrain.indexOf(platform) != 0) {
                Body.set(sensor, 'label', 'boing');
                Composite.add(this.engine.world, sensor);
                passthrough(platform);
                continue;
            } else {
                Body.set(platform, 'hard' , false)
                Body.set(platform, 'label', 'ground')
            }

            Events.on(sensor, 'onCollideEnd', pair => {
                if (pair.other.label === 'gamer') {
                    if (platform.position.y > pair.other.position.y
                    &&  platform.hard) {
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

            Events.on(platform, 'movedTo', position => {
                return Body.setPosition(sensor, position)
            })

            passthrough(platform)
            platform.hard = false
            pauliExclusion(sensor)

            Composite.add(this.engine.world, sensor)
        }
        Composite.add(this.engine.world, terrain)

        Events.on(this.runner, 'tick', this.update.bind(this)) // Registers the update functions for each update.

        for (const player of this.players) {
            player.setup()
        }
    }


    addPlayer(player) { // Adds a player into the game, as well as the players array.
        Composite.add(this.engine.world, player.body) // Adds the player's physics body into the world.
        Events.on(this.runner, 'tick', player.update.bind(player)) // Registers the player's functions to be called when an update happens.
        this.players.push(player) // Adds the player to the array.
    }


    update() { // Called every time a new frame is rendered.
        BigBen.deltaTime = this.runner.delta // Updates the global time variable.
    }


    run() { // Runs the game. This is not control blocking.
        BigBen.begin() // Starts Big Ben.
        Runner.run(this.runner, this.engine) // Starts the Matter.js physics.
        this.players.map(player => {
            Events.trigger(player.body, 'awake', {
                self: player.body
            })
        })
    }


    stop() { // Stops the game.
        Runner.stop(this.runner)
    }
}

