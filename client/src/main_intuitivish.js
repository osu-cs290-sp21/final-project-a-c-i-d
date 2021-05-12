import { Engine, Render, World, Events, Bodies, Body, Vector } from 'matter-js';
import {Player, Game} from './game';
import Thread from 'async-threading';


const gameInstance = new Game();

const render = Render.create({
    element: document.body,
    engine: gameInstance.engine
});

const player = new Player({ x: 200, y: 200 }, gameInstance.engine.world);
gameInstance.addPlayer(player);

const keys = player.keys;

document.body.addEventListener('keydown', event => {
    keys[event.keyCode] = true;
});

document.body.addEventListener('keyup', event => {
    keys[event.keyCode] = false;
});

Render.run(render);

const framerate = 60; // FPS

const updateThread = new Thread( () => gameInstance.update(), 1000 / framerate, false);

