import { Bodies, Body, Composite, Events, Vector } from 'matter-js';


const dist = (v1, v2) => Vector.magnitude(Vector.sub(v1, v2));
const remove = (array, value) => array.splice(array.indexOf(value),1);
let player = null;
export const setPlayer = p => { player = p; }


const platformOptions = {
    friction: 0,
    frictionStatic: 0,
    restitution: 1,
    isStatic: true
};


export function makeBlock(watches, maxDistance, where) {
    const block = Bodies.rectangle(...where,platformOptions);
    block.positionHistory = [];
    block.sparseUpdateEvery(1000/3);
    Events.on(block, 'sparseUpdate', body => {
        if (dist(body.position,watches) > maxDistance) {
            let newPosition = undefined;
            for (const position of body.positionHistory) {
                if (dist(position, watches) < maxDistance) {
                    remove(body.positionHistory, position);
                    newPosition = position;
                    break;
                }
            }
            if (!newPosition) {
                do {
                    newPosition = getNextBlockPosition();
                    console.log('max',maxDistance,'generated',newPosition);
                } while (dist(newPosition,watches) > maxDistance);
            }
            body.positionHistory.push(body.position);
            Body.setPosition(body, newPosition);
            Events.trigger(body, 'movedTo', newPosition);
        }
    });
    return block;
}


// const getPos = (pos => pos < maxDistance ? pos : getPos(getNextBlockPosition()));
// const makeBlock = (watches,maxDistance) => (block => 
//     [block, 
//         Events.on(block, 'sparseUpdate', body => dist(body.position, watches) > maxDistance
//         ?(body.positionHistory.length < 1 ? (pos => [
//             body.positionHistory.push(body.position),
//             Body.setPosition(body,pos)
//         ])(getPos())
//         :(pos => [remove(body.positionHistory,pos),body.positionHistory.push(pos),Body.setPosition(body,pos)].shift())
//         (body.positionHistory.entries().map((v,k)=>[k,diff(v,body.position)]).sort((a,b)=> a - b).shift()))
//         :undefined)].shift()
//     )((() => { const block = Bodies.rectangle(10,10,10,10); block.sparseUpdateEvery(1000/3); return block; })())


// function getPos() { return 1; }
// export const makeBlock = (watches,maxDistance) => (block => 
//     [block, 
//         Events.on(block, 'sparseUpdate', body => dist(body.position, watches) > maxDistance
//         ?(body.positionHistory.length < 1 ? (pos => [
//             body.positionHistory.push(body.position),Body.setPosition(body,pos)
//         ])(getPos())
//         :((b,pos) => [remove(b.positionHistory,pos),b.positionHistory.push(pos),Body.setPosition(b,pos)].shift())
//         (body,body.positionHistory.entries().map((v,k)=>[k,diff(v,body.position)]).sort((a,b)=> a - b).shift()))
//         :undefined)].shift()
//     )((() => { const block = Bodies.rectangle(10,10,10,10); block.sparseUpdateEvery(1000/3); return block; })())


export function getNextBlockPosition() {
    // return Vector.add(player.position, Vector.mult({x: 1, y: -1},50));
    return Vector.add(player.position, Vector.mult(Vector.normalise(player.velocity),50));
}

