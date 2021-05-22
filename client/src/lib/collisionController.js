export class CollisionController {
    constructor() {
        this.callbacks = {
            'initial': new Map(),
            'continuous': new Map(),
        };
    }
    register(body, handler, type) {
        this.callbacks[type].set(body.label, handler);
    }
    initialCollision(collisionEvent) { return this.onCollision(collisionEvent, 'initial'); }
    continuousCollision(collisionEvent) { return this.onCollision(collisionEvent, 'continuous'); }

    onCollision(collisionEvent, type) {
        const getPair = collision => [collision.bodyA, collision.bodyB];
        const collisionTable = collisionEvent.source.pairs.table;
        const map = this.callbacks[type];
        
        for (const name in collisionTable) {
            const [a, b] = getPair(collisionTable[name]);
            console.log([a,b]);
            if (map.has(a.label)) map.get(a.label)(b);
            if (map.has(b.label)) map.get(b.label)(a);
        }
    }
}