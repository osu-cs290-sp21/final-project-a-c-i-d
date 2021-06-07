import { Bodies, Body } from 'matter-js';


export const makeTerrain = h => [...new Array(30)].map(() => makeBlock(h))


function makeBlock(highest) {
    const block = Bodies.rectangle(0, 0, 90, 20, {
        friction:       0,
        frictionStatic: 0,
        isStatic:       true,
        restitution:    1,
    })

    Body.setPosition(block, getNextBlockPosition(highest))

    return block;
}


function getNextBlockPosition(p) {
    const w = window.innerWidth/2 - 50
    const h = window.innerHeight
    return {
        x:    ((Math.random() * w*2) - w),
        y: p - (Math.random() * h*2) - 100
    }
}

