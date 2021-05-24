import Matter from 'matter-js';

export const MatterCollisionEvents = {
    name: 'matter-collision-events',
    version: '0.1.5',
    for: 'matter-js@^0.17.0',
    install: function (matter) {
        // add the onCollide, onCollideEnd, and onCollideActive callback handlers
        // to the native Matter.Body created
        const create = matter.Body.create;
        matter.Body.create = function () {
            const body = create.apply(null, arguments);
            body.onCollide = function (cb) { matter.Events.on(body, 'onCollide', cb); }
            body.onCollideEnd = function (cb) { matter.Events.on(body, 'onCollideEnd', cb); }
            body.onCollideActive = function (cb) { matter.Events.on(body, 'onCollideActive', cb); }
            return body;
        }
        matter.after('Engine.create', function () {
            matter.Events.on(this, 'collisionStart', function (event) {
                event.pairs.map(function (pair) {
                    matter.Events.trigger(pair.bodyA, 'onCollide', { pair: pair, other: pair.bodyB });
                    matter.Events.trigger(pair.bodyB, 'onCollide', { pair: pair, other: pair.bodyA });
                    // pair.bodyA._mceOC && pair.bodyA._mceOC(pair);
                    // pair.bodyB._mceOC && pair.bodyB._mceOC(pair);
                });
            });

            // matter.Events.on(this, 'collisionActive', function (event) {
            //     event.pairs.map(function (pair) {
            //         matter.Events.trigger(pair.bodyA, 'onCollideActive', { pair: pair, other: pair.bodyB });
            //         matter.Events.trigger(pair.bodyB, 'onCollideActive', { pair: pair, other: pair.bodyA });
            //         // pair.bodyA._mceOCA && pair.bodyA._mceOCA(pair);
            //         // pair.bodyB._mceOCA && pair.bodyB._mceOCA(pair);
            //     });
            // });

            matter.Events.on(this, 'collisionEnd', function (event) {
                event.pairs.map(function (pair) {
                    matter.Events.trigger(pair.bodyA, 'onCollideEnd', { pair: pair, other: pair.bodyB });
                    matter.Events.trigger(pair.bodyB, 'onCollideEnd', { pair: pair, other: pair.bodyA });
                    // pair.bodyA._mceOCE && pair.bodyA._mceOCE(pair);
                    // pair.bodyB._mceOCE && pair.bodyB._mceOCE(pair);
                });
            });
        });
    },
};

Matter.Plugin.register(MatterCollisionEvents);
