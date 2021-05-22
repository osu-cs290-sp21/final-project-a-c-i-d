import { Vector, Body } from 'matter-js';

export { Vector as VectorArithmetic, Vector as varith };
export function vector([x,y]) {
    return { x: x, y: y };
}

export const Axes = {
    get x() { return { x: 1, y: 0 }; },
    get y() { return { x: 0, y: -1 }; }
};

export function jump(body, magnitude) {
    const velocity = { x: body.velocity.x, y: -magnitude };
    Body.setVelocity(body, velocity);
}

export function horizontalMovement(body, magnitude) {
    const velocity = { x: magnitude, y: body.velocity.y };
    Body.setVelocity(body, velocity);
}

export function safeMag(vector) {
    return Math.max(Vector.magnitude(vector), 0.000000001);
}
