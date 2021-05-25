import Thread from 'async-threading';
import { Engine, Render, Runner, World, Events, Bodies, Body, Vector } from 'matter-js';
import { Player, Game } from './game';
import { Input } from './lib/stateControllers';
import { AssetManager } from './lib/assetManager';

const debug = false;
function makeRenderer({ element, engine, follows }) {
    // Creates the renderer
    // https://github.com/liabru/matter-js/blob/master/src/render/Render.js#L66
    // https://github.com/liabru/matter-js/wiki/Rendering
    const render = Render.create({
        element: element,
        engine: engine,
        options: {
            background: 'transparent',
            height: document.body.clientHeight,
            width: document.body.clientWidth,
            pixelRatio: 'auto',
            showCollisions: debug,
            showAxes: debug,
            showIds: debug,
            hasBounds: true,
            wireframes: false, // This needs to be false for sprites to show up.
            showVelocity: debug,
            showAngleIndicator: debug,
            showVertexNumbers: debug,
            showInternalEdges: debug,
            showPositions: debug,
            showBounds: debug,
            showBroadphase: debug,
            showDebug: debug,
        }
    });

    // Centers renderer on the player before every update
    const cameraScale = 0.5;
    Events.on(render, 'beforeRender', function (event) {
        Render.lookAt(event.source, follows, {
            x: document.body.clientWidth * cameraScale,
            y: document.body.clientHeight * cameraScale
        });
    });

    return render;
}



AssetManager.register(['angry-nohat', 'sprites/svg/angry-nohat.svg']);

AssetManager.init() // Loads the assets in that are required for game setup.
    .then(() => {
        // Creates a new game and player
        const gameInstance = new Game();
        const player = new Player({ x: 300, y: 100 });
        gameInstance.addPlayer(player);

        // Makes the renderer
        const render = makeRenderer({
            element: document.body,
            engine: gameInstance.engine,
            follows: player.body.position
        });

        gameInstance.setup();
        gameInstance.run(); // Starts the game and physics. 
        Render.run(render); // Starts the renderer.

        window.capture = () => {
            console.table(Object.entries(player.body));
        }
        document.body.addEventListener('keydown', event => { if (event.code=='KeyC') { gameInstance.stop(); } });
        // setTimeout( () => gameInstance.stop(), 40000 );
    })
    .then(() => {
        // Connects the Input manager to the DOM, once the game is running.
        document.body.addEventListener('keydown', event => { Input.keys[event.keyCode] = true; });
        document.body.addEventListener('keyup', event => { Input.keys[event.keyCode] = false; });
    });



