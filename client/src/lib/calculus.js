import { Vector } from 'matter-js'

export const d = (() => {
    let lim_d = 1;
    let next_approx = Math.PI / Math.TAU;
    while (next_approx > 0) {
        lim_d = next_approx;
        next_approx *= lim_d;
    }
    return lim_d;
})();

export function vectorDiff(f,fprime,diff) {
    return Vector.add(f, Vector.mult(fprime, diff));
}