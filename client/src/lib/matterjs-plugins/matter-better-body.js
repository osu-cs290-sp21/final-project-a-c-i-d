import Matter from 'matter-js';
import { Bounds, Vertices, Vector, Axes, Body, Bodies } from 'matter-js';

import { BigBen } from '../stateControllers'

export const BetterBody = {
    name: 'matter-better-body',
    version: '0.1.5',
    for: 'matter-js@^0.17.0',
    install: function (matter) {
        // add the onCollide, onCollideEnd, and onCollideActive callback handlers
        // to the native Matter.Body created

        matter.Vector.copy = function (v) { return { x: v.x, y: v.y }; }

        const bodyCreate = matter.Body.create;
        matter.Body.create = function () {
            let body = bodyCreate.apply(null, arguments);
            // body['acceleration'] = Vector.create(0,0);
            return body;
        };
        matter.Body.update = function(body, deltaTime, timeScale, correction) {
            // console.log(deltaTime, BigBen.deltams, timeScale, correction);
            // deltaTime = BigBen.deltams
            // let deltaTimeSquared = Math.pow(deltaTime * timeScale * body.timeScale, 2);
            // // from the previous step
            // let frictionAir = 1 - body.frictionAir * timeScale * body.timeScale,
            //     velocityPrevX = body.position.x - body.positionPrev.x,
            //     velocityPrevY = body.position.y - body.positionPrev.y;
        
            // update velocity with Verlet integration
            // body.velocity.x = (velocityPrevX * frictionAir * correction) + (body.force.x / body.mass) * deltaTimeSquared;
            // body.velocity.y = (velocityPrevY * frictionAir * correction) + (body.force.y / body.mass) * deltaTimeSquared;
        
            // body.positionPrev.x = body.position.x;
            // body.positionPrev.y = body.position.y;
            // body.position.x += body.velocity.x;
            // body.position.y += body.velocity.y;
            let perception = 1;
            let dt = BigBen.deltaTime * perception
            // body.velocity.x += (body.force.x / body.mass) * dt;
            // body.velocity.y += (body.force.y / body.mass) * dt;
            let acceleration = Vector.div(body.force, body.mass);
            let adt = Vector.mult(acceleration, dt);
            body.velocity = Vector.add(body.velocity, adt);            
            
            body.positionPrev.x = body.position.x;
            body.positionPrev.y = body.position.y;
            // body.position.x += body.velocity.x * dt;
            // body.position.y += body.velocity.y * dt;
            let vdt = Vector.mult(body.velocity, dt);
            body.position = Vector.add(body.position, vdt);
        
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
            let offset = Vector.sub(position, body.position);
            body.torque += offset.x * force.y - offset.y * force.x;
        };
        matter.Body.setForce = function(body, force, copyneeded=true) {
            // const dt = BigBen.deltaTime;
            // if (!position) { position = body.position }
            // body.force.x = force.x;
            // body.force.y = force.y;
            if (copyneeded) { force = Vector.copy(force); }
            body.force = force;
            // let offset = { x: position.x - body.position.x, y: position.y - body.position.y };
            // body.torque = offset.x * force.y - offset.y * force.x;
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


