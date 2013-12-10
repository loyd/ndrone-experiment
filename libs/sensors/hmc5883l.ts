"use strict";

import Sensor = require('./sensor');

class HMC5883L extends Sensor {
    public static ADDRESS   = 0x1E;
    public static DATASHEET = {
        samples : {
            register : 0x00,
            default  : 0x10,

            1 : 0x00,
            2 : 0x20,
            4 : 0x40,
            8 : 0x60
        },

        rate : {
            register : 0x00,
            default  : 0x10,

             0.75 : 0x00,
             1.5  : 0x04,
             3    : 0x08,
             7.5  : 0x0C,
            15    : 0x10,
            30    : 0x14,
            75    : 0x18
        },

        range : {
            register : 0x01,
            default  : 0x20,

            0.88 : 0x00,
            1.3  : 0x20,
            1.9  : 0x40,
            2.5  : 0x60,
            4    : 0x80,
            4.7  : 0xA0,
            5.6  : 0xC0,
            8.1  : 0xE0,
        }
    };

    public samples: number;
    public range:   number;
    public rate:    number;
    public gain:    number;

    constructor(bus: string, options?: {samples?: number; range?: number; rate?: number}) {
        super(bus, options);
    }

    public measure(type: string, callback?: (err: Error, ...values: number[]) => void): any;
    public measure(type: 'induction'): number[];
    public measure(type, callback?, buffer?): any {
        var gain = this.gain;

        if(!(callback instanceof Function)) {
            buffer   = buffer || callback || new Buffer(6);
            callback = null;
        }

        buffer = buffer || new Buffer(6);

        if(type === 'induction')
            if(callback)
                this.read(0x03, 6, buffer, (err: Error, data: NodeBuffer) => {
                    if(err) return callback(err);

                    var x = data[1] << 8 | data[0],
                        y = data[3] << 8 | data[2],
                        z = data[5] << 8 | data[4];

                    callback(null,
                             (!(x & 0x8000) ? x : (0xffff - x + 1) * -1) * gain,
                             (!(y & 0x8000) ? y : (0xffff - y + 1) * -1) * gain,
                             (!(z & 0x8000) ? z : (0xffff - z + 1) * -1) * gain);
                });
            else {
                buffer = this.read(0x03, 6, buffer);
                var x  = buffer[1] << 8 | buffer[0],
                    y  = buffer[3] << 8 | buffer[2],
                    z  = buffer[5] << 8 | buffer[4];

                return [
                    (!(x & 0x8000) ? x : (0xffff - x + 1) * -1) * gain,
                    (!(y & 0x8000) ? y : (0xffff - y + 1) * -1) * gain,
                    (!(z & 0x8000) ? z : (0xffff - z + 1) * -1) * gain
                ];
            }
    }

    tune(options: {samples?: number; range?: number; rate?: number}) {
        this.write(new Buffer([0x02, 0x00]), 2);

        super.tune(options);

        this.samples = this.samples ||  1;
        this.range   = this.range   ||  1.3;
        this.rate    = this.rate    || 15;

        this.gain = 2*this.range/4096+0.0003;
    }

    public finalize() {
        this.write(new Buffer([0x02, 0x02]), 2);

        super.finalize();
    }
}

export = HMC5883L;
