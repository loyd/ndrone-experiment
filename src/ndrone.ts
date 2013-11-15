/// <reference path="../definitions/node/node.d.ts" />
"use strict";

declare function assert(expr: any);
global.assert = require('better-assert');

import cluster = require('cluster');

if(cluster.isMaster) {
    var flight = cluster.fork({ROLE : 'flight'}),
        fpv    = cluster.fork({ROLE : 'fpv'});

    assert(!flight.suicide);
    assert(!fpv.suicide);

    //#TODO: link workers

} else {
    assert(cluster.isWorker);
    var role: string = process.env['ROLE'];
    assert(~['flight', 'fpv'].indexOf(role));

    require('./' + role + '/' + role + '.ts');
}
