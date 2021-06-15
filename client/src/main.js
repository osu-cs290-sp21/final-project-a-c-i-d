import { Matter, Render, Events, Runner } from 'matter-js'
import { Game } from './game'
import { Player } from './player'
import { Input } from './lib/stateControllers'
import { showLeaderboard } from './ui'
import Cookies, { set } from 'js-cookie';
import { birdNames, birdButtonskin } from './lib/sprites'


const debug = false


function makeRenderer({ element, engine, follows }) {
    // Creates the renderer.
    // https://github.com/liabru/matter-js/wiki/Rendering
    // https://github.com/liabru/matter-js/blob/master/src/render/Render.js#L66
    const render = Render.create({
        element: element,
        engine: engine,
        options: {
            background: 'transparent',
            height: window.innerHeight, // document.body.clientHeight,
            width: window.innerWidth,  // document.body.clientWidth,
            hasBounds: true,
            wireframes: false, // This needs to be false for sprites to show up.
            pixelRatio: 'auto',
            showVelocity: debug,
            showAxes: debug,
            showCollisions: debug,
            showIds: debug,
            showAngleIndicator: debug,
            showVertexNumbers: debug,
            showInternalEdges: debug,
            showPositions: debug,
            showBounds: debug,
            showBroadphase: debug,
            showDebug: true,
        }
    })

    if (follows) { // Centers renderer on the player before every update.
        const cameraScale = 0.5
        Events.on(render, 'beforeRender', event => {
            const center = { ...follows.position }
            center.x = 0
            center.y = Math.min(follows.position.y, follows['highest']);
            Render.lookAt(event.source, center, {
                x: window.innerWidth * cameraScale,
                y: window.innerHeight * cameraScale
            })
        })
    }

    return render
}


const startScreens    = [...document.getElementsByClassName('start-screen')]
const settingsScreens = [...document.getElementsByClassName('settings-screen')]
const settingsButton  = document.getElementById('settings-button')
const birdButtons     = document.getElementsByClassName('bird-button')
const playButton      = document.getElementById('play-button')
const gameElement     = document.getElementById('game')
const altitude        = document.getElementById('altitude')


const MAX_CHARS = 15


const showMainView = () => {
    startScreens.map(s => s.classList.add('there')) // Fade in.
    startScreens.map(s => s.classList.add('fade-in'))
}


let current_player_unsafe = null;
let next_skin = null;


async function setupGame() {
    if (Cookies.get('player_name')) {
        if (!document.getElementById('name-input').value) {
             document.getElementById('name-input').value = Cookies.get('player_name');
        }
    }

    const game = new Game() // Creates new game.
    const player = new Player({ x: 0, y: 0 })

    if (next_skin) {
        player.skin = next_skin;
    }
    player.updateSprite()
    const render = makeRenderer({ // Makes the renderer.
        element: gameElement,
        engine: game.engine,
        follows: player.body
    })

    game.addPlayer(player)
    game.setup()

    Events.on(player.body, 'sparseUpdate', () => {
        altitude.innerText
            = `Altitude: `
            + `${-Math.floor(player.body.position.y * .01)}`
            + ` bds (birdies)`
    })
    game.run()
    // game.run2(render)
    Render.run(render) // Starts the renderer.
    current_player_unsafe = null;
    current_player_unsafe = player;

    player.onDiedCallback = () => {
        console.log('died')
        const score = player.body['highest']
        const { protocol, hostname, origin, port } = window.location;
        fetch(origin + '/died', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: Cookies.get('player_name'),
                altitude: -Math.floor(score * .01)
            })
        }).then(() => {
            const deathDelay = 1;
            setTimeout(() => {
                Render.stop(render);
                game.stop();
                game.destroy();

                const cnvs = [...document.getElementsByTagName('canvas')]
                cnvs.forEach(element => {
                    element.remove();
                });
                current_player_unsafe = null;

                showMainView();
                showLeaderboard();

                playButton.disabled = false;
                gameElement.classList.remove('fade-in');
                gameElement.classList.remove('there');
                altitude.classList.remove('fade-in');
                altitude.classList.remove('there');
            }, deathDelay);
        })
    }

    return { game, render, player }
}


async function main() {
    await showLeaderboard()

    const date = new Date()
    const currentTime = date.getHours()
    const isNight = 20
    const isDay = 5

    // In daytime, request light mode.
    if (currentTime >= isDay && currentTime < isNight) {
        // document.body.classList.add("day")
    } else { 
        document.body.classList.add("night")
    }

    showMainView();

    document.addEventListener('keydown', e => { Input.ks[e.keyCode] = true; Input.down(e.code); })
    document.addEventListener('keyup', e => { Input.ks[e.keyCode] = false; Input.up(e.code); })
    // document.addEventListener('keydown', e => {
    //     if (e.code === 'KeyC') { game.stop() }
    // })

    playButton.addEventListener('click', () => {
        setupGame();

        playButton.disabled = true;

        // Name the player after entered name.
        const playerName = document.getElementById('name-input').value
            .substr(0, MAX_CHARS)
            .trim()
            .replace(/[!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~]/g, '')
        || 'Birdie';
        if (playerName != 'Birdie') { Cookies.set('player_name', playerName); }
        current_player_unsafe.name = playerName;

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
        for (let i = 0; i < birdButtons.length; i++) {
            birdButtons[i].disabled = false
        }
    })

    for (let i = 0; i < birdButtons.length; i++) {
        birdButtons[i].addEventListener('click', () => {
            birdButtons[i].disabled = true

            const birdSelected = i
            next_skin = birdNames[birdSelected]

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
}


main()

