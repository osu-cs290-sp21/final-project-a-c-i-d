import Thread from 'async-threading';
import { Engine, Render, Runner, World, Events, Bodies, Body, Vector } from 'matter-js';
import { Player, Game } from './game';

const gameInstance = new Game();

const keys = [...new Array(256)].map(e => false);
document.body.addEventListener('keydown', event => { keys[event.keyCode] = true; });
document.body.addEventListener('keyup', event => { keys[event.keyCode] = false; });

const player = new Player({ x: 200, y: 200 });
player.keys = keys;
gameInstance.addPlayer(player);



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
        showIds: true
    }
});

Render.run(render);

gameInstance.run();