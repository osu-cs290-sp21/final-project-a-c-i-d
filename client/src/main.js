import { Matter, Render, Events } from 'matter-js'
import { Game } from './game'
import { Player } from './player'
import { Input } from './lib/stateControllers'
import { showLeaderboard } from './ui'


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
    await showLeaderboard()

    const startScreens    = [...document.getElementsByClassName('start-screen')]
    const settingsScreens = [...document
                                    .getElementsByClassName('settings-screen')]
    const settingsButton  = document.getElementById('settings-button')
    const playButton      = document.getElementById('play-button')
    const gameElement     = document.getElementById('game')
    const altitude        = document.getElementById('altitude')

    const andy = document.getElementById('andy-bird')

    startScreens.map(s => s.classList.add('there')) // Fade in.
    startScreens.map(s => s.classList.add('fade-in'))

    const game   = new Game() // Creates new game.
    const player = new Player({ x: 0, y: 0 })

    player.onDie(() => {
        console.log('died')
    })

    const render = makeRenderer({ // Makes the renderer.
        element: gameElement,
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
            +   `${-Math.floor(player.body.position.y*.01)}`
            +   ` bds (birdies)`
    })

    document.addEventListener('keydown', e => { Input.ks[e.keyCode] = true  })
    document.addEventListener('keyup'  , e => { Input.ks[e.keyCode] = false })
    document.addEventListener('keydown', e => {
        if (e.code === 'KeyC') { game.stop() }
    })

    playButton.addEventListener('click', () => {
        playButton.disabled = true;

        // Name the player after entered name.
        const playerName = document.getElementById('name-author-input').value;
        if (playerName) {
            console.log('== Name ' + playerName + ' is set.');
        } else {
            playerName = 'Birdie';
        }
        player.name = playerName;

        startScreens.map((s) => s.classList.remove('fade-in'));
        setTimeout(() => {
            startScreens.map((s) => s.classList.remove('there'));
        }, 1000);
        gameElement.classList.add('there');
        altitude.classList.add('there');
        setTimeout(() => {
            gameElement.classList.add('fade-in');
        }, 500);
        setTimeout(() => {
            altitude.classList.add('fade-in');
        }, 1000);
    })

    settingsButton.addEventListener('click', () => {
        settingsButton.disabled = true
        startScreens.map(s => s.classList.remove('fade-in'))
        settingsScreens.map(s => s.classList.add('there'))
        setTimeout(() => {
            startScreens.map(s => s.classList.remove('there'))
        }, 1000)
        setTimeout(() => {
            settingsScreens.map(s => s.classList.add('fade-in'))
        }, 500)
        andy.disabled = false
    })



    andy.addEventListener('click', () => {
        andy.disabled = true
        settingsScreens.map(s => s.classList.remove('fade-in'))
        startScreens.map(s => s.classList.add('there'))
        setTimeout(() => {
            settingsScreens.map(s => s.classList.remove('there'))
        }, 1000)
        setTimeout(() => {
            startScreens.map(s => s.classList.add('fade-in'))
        }, 500)
        settingsButton.disabled = false
    })
}


main()

