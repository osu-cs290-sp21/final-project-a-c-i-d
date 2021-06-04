import { Bodies, Body, Composite, Events, Vector } from 'matter-js';


const dist   = (v1, v2)       => Vector.magnitude(Vector.sub(v1, v2));
const remove = (array, value) => array.splice(array.indexOf(value), 1);
let player   = null;
export const setPlayer = p => { player = p; }


const platformOptions = {
    friction:       0,
    frictionStatic: 0,
    isStatic:       true,
    restitution:    1,
};


export function makeBlock(watches, maxDistance) {
    const block = Bodies.rectangle(0, 0, 90, 10, platformOptions);
    Body.setPosition(block, getNextBlockPosition());
    block.positionHistory = [];
    Events.on(block, 'sparseUpdate', body => {
        if (dist(body.position,watches) > maxDistance) {
            // let newPosition = undefined;
            // for (const position of body.positionHistory) {
            //     if (dist(position, watches) < maxDistance) {
            //         remove(body.positionHistory, position);
            //         newPosition = position;
            //         break;
            //     }
            // }
            // if (!newPosition) {
            //     do {
            //         newPosition = ;
            //         console.log('max',maxDistance,'generated',newPosition);
            //     } while (dist(newPosition,watches) > maxDistance);
            // }
            // body.positionHistory.push(body.position);
            const newPos = getNextBlockPosition();
            Body.setPosition(body, newPos);
            Events.trigger(body, 'movedTo', newPos);
        }
    });
    return block;
}


let counter = -400;
export function getNextBlockPosition() {
    counter += 100;
    const base = {...player.position};
    const pos = {x: Math.sin(Math.random() * Math.PI * 2) * 200, y: -counter};
    const starting = Vector.add(base, pos);
    return starting;
}

