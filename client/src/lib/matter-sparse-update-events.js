import Matter from 'matter-js';
import Thread from 'async-threading';

export const MatterSparseUpdateEvents = {
    name: 'matter-sparse-update-events',
    version: '0.0.1',
    for: 'matter-js@^0.17.0',
    install: function (matter) {

        const bodyCreate = matter.Body.create;
        matter.Body.create = function () {
            const body = bodyCreate.apply(null, arguments);
            body.onSparseUpdate = function (sparseUpdateCallback, deltaTime) {
                body._sparseUpdateCallback = sparseUpdateCallback;
                body._sparseUpdateDeltaTime = deltaTime;
            };
            return body;
        }

        const runnerRun = matter.Runner.run;
        matter.Runner.run = function () {
            const runner = runnerRun.apply(null, arguments);
            runner._engine = arguments[1];
            console.log(runner._engine);
            matter.Events.trigger(runner, 'awake', { source: runner, self: runner });
        }

        matter.after('Body.create', function () {
            matter.Events.on(this, 'sparseUpdate', function (body) {
                body._sparseUpdateCallback();
            });
            matter.Events.on(this, 'awake', function (event) {
                const body = event.self;
                if (body._sparseUpdateCallback && body._sparseUpdateDeltaTime) {
                    const caller = () => matter.Events.trigger(body, 'sparseUpdate', body);
                    body._sparseUpdateThread = new Thread(caller, body._sparseUpdateDeltaTime, false);
                    body._sparseUpdateThread.start();
                }
            });
        });
        matter.after('Composite.create', function () {
            matter.Events.on(this, 'awake', function (event) {
                event.self.bodies.map( function (body) {
                    matter.Events.trigger(body, 'awake', { source: event.self, self: body });
                });
            });
        });
        matter.after('Engine.create', function () {
            matter.Events.on(this, 'awake', function (event) {
                matter.Events.trigger(event.self.world, 'awake', { source: event.self, self: event.self.world })
            });
        });
        matter.after('Runner.create', function () {
            matter.Events.on(this, 'awake', function (event) {
                matter.Events.trigger(event.self._engine, 'awake', { source: event.self, self: event.self._engine });
            });
        });
        matter.after('Runner.run', function () {
            // matter.Events.trigger(this, 'awake', { source: this, self: this });
        });
    },
};

Matter.Plugin.register(MatterSparseUpdateEvents);
