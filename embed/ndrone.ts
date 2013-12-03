/// <reference path="../definitions/node/node.d.ts" />
/// <reference path="../definitions/node-ffi/node-ffi.d.ts" />
"use strict";

declare var de: boolean;
declare var mand: typeof assert;

import assert  = require('assert');
import cluster = require('cluster');
import os      = require('os');
import config  = require('../config');

global.mand = assert;
global.de   = 'DEBUG' in process.env;

if(cluster.isMaster) {
    process.title = 'ndrone';
    process.on('uncaughtException', dump);

    /*
        Danger zone. In any case it is necessary to guarantee the availability
        of the workers inside the callback function of 'message' event.
     */
    var mock = <cluster.Worker> {
        send(message: any, sendHandle?: any) {}
    };

    var flight: cluster.Worker = mock,
        fpv:    cluster.Worker = mock;

    var TIME = config.WORKER_RESTART_TIMEOUT;
    var throttle = (fn: () => void) => {
        var state = 0;
        return () => {
            if(state > 0) {
                if(state === 1) state = 2;
                return;
            }

            state = 1;
            fn();
            setTimeout(() => {
                if(state === 2) fn();
                state = 0;
            }, TIME);
        };
    };

    var run = {
        flight : throttle(() => {
            if(flight.suicide) return;

            flight = cluster.fork({ROLE : 'flight'});
            flight.on('error', (err) => {
                dump(err);
                flight = mock;
                run.flight();
            });

            flight.on('exit', () => {
                flight = mock;
                run.flight();
            });
            flight.on('message', (data) => fpv.send(data));
        }),

        fpv : throttle(() => {
            if(fpv.suicide) return;

            fpv = cluster.fork({ROLE : 'fpv'});
            fpv.on('error', (err) => {
                dump(err);
                fpv = mock;
                run.fpv();
            });

            fpv.on('exit', () => {
                fpv = mock;
                run.fpv();
            });
            fpv.on('message', (data) => flight.send(data));
        })
    };

    run.flight();
    run.fpv();
} else {
    var role: string = process.env['ROLE'];
    de&&mand(~['flight', 'fpv'].indexOf(role));
    process.title = 'ndrone: ' + role;

    process.on('uncaughtException', (err) => {
        dump(err);
        process.exit(1);
    });

    require('./' + role + '/' + role);
}

function dump(err) {
    console.error('%s (%d)', process.title, process.pid);
    console.error('Uptime: %s (OS), %s (worker)',
        new Date(     os.uptime() * 1000).toISOString().slice(11, 19),
        new Date(process.uptime() * 1000).toISOString().slice(11, 19));
    console.error('Load average: ', os.loadavg());
    console.error('Memory usage: ', process.memoryUsage());
    console.error(err.stack || err.message || err, '\n');
}
