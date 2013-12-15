"use strict";

import Sensor = require('./sensor');

class ADXL345 extends Sensor {
    public static ADDRESS   = 0x53;
    public static DATASHEET = {
        rate : {
            register : 0x2C,
            default  : 100,

            3    : 0x05,
            6    : 0x06,
            12   : 0x07,
            25   : 0x08,
            50   : 0x09,
            100  : 0x0A,
            200  : 0x0B,
            400  : 0x0C,
            800  : 0x0D,
            1600 : 0x0E
        },

        range : {
            register : 0x31,
            default  : 2,

            2  : 0x00,
            4  : 0x01,
            8  : 0x02,
            16 : 0x03
        }
    };

    public range: number;
    public rate: number;
    public gain: number;

    constructor(bus: string, options?: {rate?: number; range?: number}) {
        super(bus, options);
    }

    public measure(type: string, callback?: (err: Error, ...values: number[]) => void): any;
    public measure(type: 'acceleration'): number[];
    public measure(type: string, callback?: any, buffer?: any): any {
        var gain = this.gain;

        if(!(callback instanceof Function)) {
            buffer   = buffer || callback || new Buffer(6);
            callback = null;
        }

        buffer = buffer || new Buffer(6);

        if(type === 'acceleration')
            if(callback)
                this.read(0x32, 6, buffer, (err: Error, data: NodeBuffer) => {
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
                buffer = this.read(0x32, 6, buffer);
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

    public tune(options: {rate?: number; range?: number}) {
        var datasheet = ADXL345.DATASHEET;

        this.write(new Buffer([0x2D, 0x00]), 2);
        this.write(new Buffer([0x2D, 0x08]), 2);

        super.tune(options);

        this.rate  = this.rate  || datasheet.rate .default;
        this.range = this.range || datasheet.range.default;
        this.gain  = 2*this.range/1024;
    }

    public finalize() {
        this.write(new Buffer([0x2D, 0x10]), 2);

        super.finalize();
    }
}

export = ADXL345;
