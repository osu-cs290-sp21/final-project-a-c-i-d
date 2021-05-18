import Thread from 'async-threading';
import { Engine, Render, Runner, World, Events, Bodies, Body, Vector } from 'matter-js';
import { Player, Game, Input } from './game';

// Connects the Input manager to the DOM
document.body.addEventListener('keydown', event => { Input.keys[event.keyCode] = true; });
document.body.addEventListener('keyup', event => { Input.keys[event.keyCode] = false; });

// Creates a new game and player
const gameInstance = new Game();
const player = new Player({ x: 200, y: 200 });
gameInstance.addPlayer(player);

// Creates the renderer
// https://github.com/liabru/matter-js/blob/master/src/render/Render.js#L66
const render = Render.create({
    element: document.body,
    engine: gameInstance.engine,
    options: {
        height: document.body.clientHeight,
        width: document.body.clientWidth,
        pixelRatio: 'auto',
        showCollisions: true,
        showAxes: true,
        showIds: true,
        hasBounds: true
    }
});

// Centers renderer on the player before every update
const cameraScale = 0.5;
Events.on(render, 'beforeRender', () => Render.lookAt(render, player.body.position, {
    x: document.body.clientWidth * cameraScale,
    y: document.body.clientHeight * cameraScale
}));

// Starts the renderer
Render.run(render);

// Starts the game logic and physics
gameInstance.run();

setTimeout( () => gameInstance.stop(), 20000); // Stops game after 20 seconds bc laptop gets hot.