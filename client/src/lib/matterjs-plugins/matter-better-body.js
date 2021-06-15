import Matter from 'matter-js';
import { Bounds, Vertices, Vector, Axes, Body, Bodies } from 'matter-js';

import { BigBen } from '../stateControllers'
import * as Physics from '../physics';

export const BetterBody = {
    name: 'matter-better-body',
    version: '0.1.5',
    for: 'matter-js@^0.17.0',
    install: function (matter) {
        // add the onCollide, onCollideEnd, and onCollideActive callback handlers
        // to the native Matter.Body created

        for (const k in Physics.Axes) {
            if (matter.Axes[k] === undefined) {
                matter.Axes[k] = Physics.Axes[k];
            }
        }

        matter.Vector.copy = function (v) { return { x: v.x, y: v.y }; }
        const bodyCreate = matter.Body.create;
        matter.Body.create = function () {
            let body = bodyCreate.apply(null, arguments);
            // body['acceleration'] = Vector.create(0,0);
            return body;
        };
        matter.Body.update = function(body, deltaTime, timeScale, correction) {

            let perception = 2;
            let dt = BigBen.deltaTime * perception

            let { force, position: s0, velocity: v0, mass } = body;

            console.assert(mass !== 0 || velocity === Axes.infinity);

            // console.log('correction',correction);

            let a = Vector.div(force, mass);
            let adt = Vector.mult(a, dt);
            let v = Vector.add(v0, adt);
            let vdt = Vector.mult(v, dt);
            let s = Vector.add(s0, vdt);

            body.positionPrev = Vector.copy(s0);
            body.velocity = v;
            body.position = s;
        
            // update angular velocity with Verlet integration
            // body.angularVelocity = ((body.angle - body.anglePrev) * frictionAir * correction) + (body.torque / body.inertia) * deltaTimeSquared;
            // body.anglePrev = body.angle;
            // body.angle += body.angularVelocity;

            body.angularVelocity += (body.torque / body.inertia) * dt;
            body.anglePrev = body.angle;
            body.angle += body.angularVelocity * dt;
        
            // track speed and acceleration
            body.speed = Vector.magnitude(body.velocity);
            body.angularSpeed = Math.abs(body.angularVelocity);
        
            // transform the body geometry
            for (let i = 0; i < body.parts.length; i++) {
                let part = body.parts[i];
                // Vertices.translate(part.vertices, body.velocity);
                Vertices.translate(part.vertices, vdt);

                if (i > 0) {
                    // part.position.x += body.velocity.x;
                    // part.position.y += body.velocity.y;
                    part.position.x += vdt.x;
                    part.position.y += vdt.y;
                }
        
                if (body.angularVelocity !== 0) {
                    Vertices.rotate(part.vertices, body.angularVelocity * dt, body.position);
                    Axes.rotate(part.axes, body.angularVelocity * dt);
                    if (i > 0) {
                        Vector.rotateAbout(part.position, body.angularVelocity * dt, body.position, part.position);
                    }
                }

                // Interesting behavior
                // Bounds.update(part.bounds, part.vertices, body.velocity);
                Bounds.update(part.bounds, part.vertices, vdt);
            }
        };
        // matter.Body.setVelocity = function(body, velocity) {
        //     body.positionPrev.x = body.position.x - velocity.x;
        //     body.positionPrev.y = body.position.y - velocity.y;
        //     body.velocity.x = velocity.x;
        //     body.velocity.y = velocity.y;
        //     body.speed = Vector.magnitude(body.velocity);
        // };
        matter.Body.applyForce = function(body, position, force) {
            // const dt = BigBen.deltaTime;
            // body.force.x += force.x;
            // body.force.y += force.y;
            // let offset = { x: position.x - body.position.x, y: position.y - body.position.y };
            body.force = Vector.add(body.force, force);
            // let offset = Vector.sub(position, body.position);
            // body.torque += offset.x * force.y - offset.y * force.x; // Vector.cross(offset, force);
            body.torque += Vector.cross(Vector.sub(position, body.position), force);
        };
        matter.Body.setForce = function(body, force, copyneeded=true) {
            if (copyneeded) { force = Vector.copy(force); }
            body.force = force;
        };
        matter.Body.setAcceleration = function (body, acceleration) {
            Body.setForce(body, Vector.mult(acceleration, body.mass), false);
        };
        matter.Body.applyAcceleration = function (body, position, acceleration) {
            Body.applyForce(body, position, Vector.mult(acceleration, body.mass));
        };
        matter.Engine._bodiesClearForces = function(bodies) {
            return;
            const zero = Vector.create(0,0);
            for (let i = 0; i < bodies.length; i++) {
                let body = bodies[i];
                
                // // reset force buffers
                // body.force.x = 0;
                // body.force.y = 0;
                // body.torque = 0;
                Body.setAcceleration(body, zero);
            }
        };
        matter.Engine._bodiesApplyGravity = function(bodies, gravity) {
            let gravityScale = typeof gravity.scale !== 'undefined' ? gravity.scale : 0.001;
            gravityScale *= 100;
            if ((gravity.x === 0 && gravity.y === 0) || gravityScale === 0) {
                return;
            }
            
            for (let i = 0; i < bodies.length; i++) {
                let body = bodies[i];
    
                if (body.isStatic || body.isSleeping)
                    continue;
    
                // apply gravity

                let gforce = Vector.mult(gravity, gravityScale * body.mass);
                // matter.Body.applyForce(body, above, Vector.mult(gravity, gravityScale * body.mass));
                // matter.Body.setForce(body, gforce);
                matter.Body.setAcceleration(body, gforce);
                // body.force.y += body.mass * gravity.y * gravityScale;
                // body.force.x += body.mass * gravity.x * gravityScale;
            }
        };
    },
};

Matter.Plugin.register(BetterBody);


