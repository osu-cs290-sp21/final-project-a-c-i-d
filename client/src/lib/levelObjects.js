import { Bodies, Body, Composite, Events, Vector } from 'matter-js';


export function makeBlock(highest) {
    const block = Bodies.rectangle(0, 0, 90, 20, {
        friction:       0,
        frictionStatic: 0,
        isStatic:       true,
        restitution:    1,
    })

    Body.setPosition(block, {
        x:           Math.random() * window.innerWidth,
        y: highest - Math.random() * window.innerHeight
    })

    return block;
}


function getNextBlockPosition() {
    return {
        x: 0,
        y: -200
    }
}

