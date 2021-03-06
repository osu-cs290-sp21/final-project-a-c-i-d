import { Vector, Body } from 'matter-js';

export { Vector as VectorArithmetic, Vector as varith };
export function vector([x,y]) {
    return { x: x, y: y };
}

export function diff(v1,v2) {
    return Vector.magnitude(Vector.sub(v1,v2));
}

export const Axes = {
    get x() { return { x: 1, y: 0 }; },
    get y() { return { x: 0, y: -1 }; },
    get zero() { return { x: 0, y: 0 }; },
    get ex() { return { x: 1, y: 0 }; },
    get ey() { return { x: 0, y: 1 }; },
    get one() { return { x: 1, y: 1 }; }

};

export function jump(body, magnitude) {
    const velocity = { x: body.velocity.x, y: -magnitude };
    Body.setVelocity(body, velocity);
}
export function stop(body) {
    Body.setVelocity(body, Axes.zero);
    Body.setForce(body, Axes.zero, false);
}

export function horizontalMovement(body, magnitude) {
    const velocity = { x: magnitude, y: body.velocity.y };
    Body.setVelocity(body, velocity);
}

export function safeMag(vector) {
    return Math.max(Vector.magnitude(vector), 0.000000001);
}
