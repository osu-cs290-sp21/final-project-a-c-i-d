import { Bodies, Body } from 'matter-js';

// export const vector = ([x,y]) => ({ x: x, y: y });

const platforms = ['dirt-platform'];

const platformOptions = {
    // isStatic: true,
    friction: 0,
    frictionStatic: 0,
};

export const makePlatform = ([x, y], [width, height]) => Bodies.rectangle(x, y, width, height, platformOptions);

export const range = (a,b,n) => [... new Array(n).keys()].map(x => a + ((b-a) * x / n));

export const generateTerrain = ([startX, startY], amount) => range(0,500 * amount, amount)
        .map(x => [x, Math.sin(x * 20) * 150])
        .map(([x,y]) => makePlatform([startX + x,startY - y], [400,20]))
        .map(platform => [platform, Body.setStatic(platform, true)].shift());