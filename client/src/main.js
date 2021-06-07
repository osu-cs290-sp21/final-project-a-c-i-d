import { Matter, Render, Events } from 'matter-js'
import { Game } from './game'
import { Player } from './player'
import { Input } from './lib/stateControllers'
import { showLeaderboard } from './ui';


const debug = false


function makeRenderer({ element, engine, follows }) {
    // Creates the renderer.
    // https://github.com/liabru/matter-js/wiki/Rendering
    // https://github.com/liabru/matter-js/blob/master/src/render/Render.js#L66
    const render = Render.create({
        element: element,
        engine:  engine,
        options: {
            background: 'transparent',
            height:     window.innerHeight, // document.body.clientHeight,
            width:      window.innerWidth,  // document.body.clientWidth,
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

    if (follows) { // Centers renderer on the player before every update.
        const cameraScale = 0.5
        Events.on(render, 'beforeRender', event => {
            const center = { ...follows.position }
            center.x = 0
            center.y = Math.min(follows.position.y, follows['highest']);
            Render.lookAt(event.source, center, {
                x: window.innerWidth  * cameraScale,
                y: window.innerHeight * cameraScale
            })
        })
    }

    return render
}


async function main() {
    const startScreens = [...document.getElementsByClassName('start-screen')]
    const settScreens  = [...document.getElementsByClassName('sett-screen')]
    const playButton   = document.getElementById('play-button')
    const settButton   = document.getElementById('sett-button')
    const gameElem     = document.getElementById('game')
    const altitude     = document.getElementById('altitude')

    const game   = new Game() // Creates new game.
    const player = new Player({ x: 0, y: 0 })

    player.onDie(() => {
        showLeaderboard();
    })

    const render = makeRenderer({ // Makes the renderer.
        element: gameElem,
        engine:  game.engine,
        follows: player.body
    })

    game.addPlayer(player)
    game.setup()
    game.run()
    Render.run(render) // Starts the renderer.

    Events.on(player.body, 'sparseUpdate', () => {
        altitude.innerText
            =   `Altitude: `
            +   `${-Math.floor(player.body.position.y * 0.01)}`
            +   ` bds (birdies)`
// Debug.
+   `\ny: ${Math.floor(Math.abs(player.body.position.y))}`
+   `\nh: ${Math.floor(Math.abs(player.body['highest']))}`
+   `\nd: ${Math.floor(Math.abs(player.body['highest'] - player.body.position.y))}`
+       `/${Math.floor(window.innerHeight/2)}`
    })

    document.addEventListener('keydown', e => { Input.ks[e.keyCode] = true  })
    document.addEventListener('keyup'  , e => { Input.ks[e.keyCode] = false })
    document.addEventListener('keydown', e => {
        if (e.code === 'KeyC') { game.stop() }
    })

    playButton.addEventListener('click', () => {
        playButton.disabled = 'true'

        startScreens.map(s => s.classList.toggle('fade'))
        setTimeout(() => {
            startScreens.map(s => s.classList.toggle('gone'))
        }, 1000)

        setTimeout(() => { gameElem.classList.toggle('fade') },  500)
        setTimeout(() => { altitude.classList.toggle('fade') }, 1000)
    })

    settButton.addEventListener('click', () => {
        settButton.disabled = 'true'

        startScreens.map(s => s.classList.toggle('fade'))
        setTimeout(() => {
            startScreens.map(s => s.classList.toggle('gone'))
        }, 1000)
    })

    fetch('http://localhost:3000/leaderboard', {
        method: 'GET',
    }).then(data => console.log(data))
}


main()

