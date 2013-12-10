/// <reference path="../../definitions/node-ffi/node-ffi.d.ts" />

"use strict";

import ffi = require('ffi');
import ref = require('ref');

import errno = require('../errno');

var T   = ref.types,
    lib = new ffi.Library(null, {
        ioctl : [T.int, [T.int, T.int, T.int]]
});

function ioctl(fd: number, slave: number, address: number): number {
    var status = lib.ioctl(fd, slave, address);

    if(status < 0)
        throw new errno.ErrnoError(ffi.errno(), 'Failed to control I2C subdevice');

    return status;
}

export = ioctl;
