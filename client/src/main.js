import { Render, Events } from 'matter-js'
import { Game } from './game'
import { Player } from './player'
import { Input } from './lib/stateControllers'


const debug = false


function makeRenderer({ element, engine, follows }) {
    // Creates the renderer
    // https://github.com/liabru/matter-js/wiki/Rendering
    // https://github.com/liabru/matter-js/blob/master/src/render/Render.js#L66
    const render = Render.create({
        element: element,
        engine:  engine,
        options: {
            background: 'transparent',
            height:     window.innerHeight, // document.body.clientHeight,
            width:      window.innerWidth, // document.body.clientWidth,
            hasBounds:  true,
            wireframes: false, // This needs to be false for sprites to show up.
            pixelRatio: 'auto',
                showVelocity:       debug,
                showAxes:           debug,
                showCollisions:     debug,
                showIds:            debug,
                showAngleIndicator: debug,
                showVertexNumbers:  debug,
                showInternalEdges:  debug,
                showPositions:      debug,
                showBounds:         debug,
                showBroadphase:     debug,
                showDebug:          debug,
        }
    })

    if (follows) { // Centers renderer on the player before every update
        const cameraScale = 0.5
        Events.on(render, 'beforeRender', event => {
            const margin = 100
            const center = { ...follows.position };
            center.y = Math.min(follows.position.y - margin, follows['highest']);
            Render.lookAt(event.source, center, {
                x: window.innerWidth  * cameraScale,
                y: window.innerHeight * cameraScale
            });
        });
    }

    return render
}


async function main() {
    const starts = Array.from(document.getElementsByClassName('start-screen'))
    const playButton = document.getElementById('play-button')

    playButton.addEventListener('click', () => {
        playButton.disabled = 'true'
        starts.map(s => s.classList.add('fade'))
        setTimeout(() => { starts.map(s => s.classList.add('gone')) }, 1000)

        const gameInstance = new Game() // Creates new game
        const player = new Player({ x: 300, y: 100 })
        gameInstance.addPlayer(player)

        const render = makeRenderer({ // Makes the renderer
            element: document.body,
            engine:  gameInstance.engine,
            follows: player.body
        })

        gameInstance.setup()
        gameInstance.run()
        Render.run(render) // Starts the renderer

        Events.on(player.body, 'sparseUpdate', () => {
            document.getElementById('altitude')
                .innerText
                =   `Altitude: `
                +   `${-Math.floor(player.body.position.y * 0.01)}`
                +   ` bds (birdies)`
        })

        document.body.addEventListener('keydown', e => { Input.keys[e.keyCode] = true  })
        document.body.addEventListener('keyup'  , e => { Input.keys[e.keyCode] = false })
        document.body.addEventListener('keydown', e => { if (e.code === 'KeyC') gameInstance.stop() })
    })


}


main()

