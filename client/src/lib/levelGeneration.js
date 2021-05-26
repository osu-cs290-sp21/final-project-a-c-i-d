import { Bodies, Body } from 'matter-js';

// export const vector = ([x,y]) => ({ x: x, y: y });

const platforms = ['dirt-platform'];

const platformOptions = {
    // isStatic: true,
    friction: 0,
    frictionStatic: 0,
    restitution: 1
};

export const makePlatform = ([x, y], [width, height]) => Bodies.rectangle(x, y, width, height, platformOptions);

export const range = (a,b,n) => [... new Array(n).keys()].map(x => a + ((b-a) * x / n));

export const generateTerrain = ([startX, startY], amount) => range(0,500 * amount, amount)
        .map(x => [x, Math.sin(x * 20) * 150 ]) // (x,f(x))
        .map(([x,y]) => makePlatform([startX - y,startY - x], [200 * Math.random(Math.random(50)) + 50,20]))
        .map(platform => [platform, Body.setStatic(platform, true)].shift());