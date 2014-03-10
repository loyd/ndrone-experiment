"use strict";
 
import fs     = require('fs');
import assert = require('assert');
import ffi    = require('ffi');
import ref    = require('ref');
import errno  = require('./errno');

var T = ref.types;
var lib = new ffi.Library(null, {
    ioctl : [T.int, [T.int, T.int, T.int]]
});

var I2C_SLAVE = 0x703;

class AfroESC { 
    private static SEND_INTERVAL = 40;
    private static FULL_POWER    = 247;

    public power: number = 0;

    private _buffer: NodeBuffer = new Buffer([0]);
    private _loop:   NodeTimer;
    private _fd: number;
 
    constructor(bus: string, address: number) { 
        if (!(address && bus))
            throw new Error('Invalid parameters for setup');
 
        var fd = this._fd = fs.openSync(bus, 'r+');

        if(lib.ioctl(fd, I2C_SLAVE, address) < 0)
            throw new errno.ErrnoError(ffi.errno(), 'Failed to control I2C subdevice');

        this._loop = <any> setInterval(() => this._send(), AfroESC.SEND_INTERVAL);
    }

    public update(power: number) {
        if(power > 1 || power < 0)
            throw new Error('Invalid power value');

        power = power * AfroESC.FULL_POWER | 0;

        this.power = power;
        this._buffer[0] = power;
    }
 
    public finalize() {
        clearInterval(<any> this._loop);
        fs.closeSync(this._fd);
    }

    private _send(callback?: (err: Error) => void) {
        if(callback)
            fs.write(this._fd, this._buffer, 0, 1, null, (err, written) => {
                if(err) return callback(err);
                assert(written === 1);

                callback(null);
            });
        else {
            var written = fs.writeSync(this._fd, this._buffer, 0, 1, null);
            assert(written === 1);
        }
    }
}
 
export = AfroESC;
