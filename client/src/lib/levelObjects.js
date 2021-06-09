import { Bodies, Body } from 'matter-js';


export const makeTerrain = points => {
    const terrain = new Array(points.length)

    for (let i = terrain.length-1; i >= 0 ; i--) {
        const block = Bodies.rectangle(0, 0, 90, 20, {
            friction:       0,
            frictionStatic: 0,
            isStatic:       true,
            restitution:    1,
        })
        Body.setPosition(block, points[i])
        terrain[i] = block
    }

    return terrain
}

let lastHeight = 0;
export const getTerrain = highest => {
    const density = Math.floor(window.innerWidth * window.innerHeight/25000),
          width   = Math.floor(window.innerWidth/2-50),
          height  = Math.floor(window.innerHeight*5 / density)

    const points = new Array(density)

    let count  = highest-200
    for (let i = points.length-1; i >= 0 ; i--) {
        points[i] = {
            x: Math.floor(Math.random() * width*2) - width,
            y: count
        }
        count -= Math.floor(Math.random() * height)
    }
    lastHeight = highest;
    
    return points
}

