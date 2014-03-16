"use strict";

import assert = require('assert');
import os     = require('os');
import fs     = require('fs');

var prevCPUTimes = os.cpus()[0].times;
export function cpuUsage() {
    var prev = prevCPUTimes, curr: typeof prev;
    prevCPUTimes = curr = os.cpus()[0].times;
    var payload = (prev.sys - curr.sys) + (prev.user - curr.user)
                + (prev.irq - curr.irq) + (prev.nice - curr.nice);

    return payload / (payload + prev.idle - curr.idle) || 0;
}

export var totalMem = os.totalmem() / 1024; // [kB]
export function memUsage() {
    try {
        var meminfo = fs.readFileSync('/proc/meminfo', 'utf8');
    } catch(err) {
        return 0;
    }

    var freeMem = os.freemem() / 1024
        + +meminfo.match(/Buffers:\s+(\d+)/)[1]
        + +meminfo.match(/Cached:\s+(\d+)/)[1];

    return 1 - freeMem / this.totalMem;
}

export function load() {
    return os.loadavg();
}
