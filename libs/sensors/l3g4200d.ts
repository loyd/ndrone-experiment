"use strict";

import Sensor = require('./sensor');

class L3G4200D extends Sensor {
    public static ADDRESS   = 0x69;
    public static DATASHEET = {
        rate : {
            register : 0x23,
            default  : 250,

            250  : 0x00,
            500  : 0x10,
            2000 : 0x20
        }
    };

    public rate: number;
    public gain: number;

    constructor(bus: string, options?: {rate?: number}) {
        super(bus, options);
    }

    public measure(type: string, callback?: (err: Error, ...values: number[]) => void): any;
    public measure(type: 'velocity'): number[];
    public measure(type: 'temperature'): number;
    public measure(type: string, callback?: any, buffer?: any): any {
        var gain = this.gain;

        if(!(callback instanceof Function)) {
            buffer   = buffer || callback || new Buffer(6);
            callback = null;
        }

        buffer = buffer || new Buffer(6);

        if(type === 'velocity')
            if(callback)
                this.read(0x80 | 0x28, 6, buffer, (err: Error, data: NodeBuffer) => {
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
                buffer = this.read(0x80 | 0x28, 6, buffer);
                var x  = buffer[1] << 8 | buffer[0],
                    y  = buffer[3] << 8 | buffer[2],
                    z  = buffer[5] << 8 | buffer[4];

                return [
                    (!(x & 0x8000) ? x : (0xffff - x + 1) * -1) * gain,
                    (!(y & 0x8000) ? y : (0xffff - y + 1) * -1) * gain,
                    (!(z & 0x8000) ? z : (0xffff - z + 1) * -1) * gain
                ];
            }
        else if(type === 'temperature')
            if(callback)
                this.read(0x26, 1, buffer, (err, data) =>
                    err ? callback(err) : callback(null, data[0])
                );
            else
                return this.read(0x26, 1, buffer)[0];
    }

    public tune(options: {rate?: number}) {
        var datasheet = L3G4200D.DATASHEET;

        this.write(new Buffer([0x20, 0x1F]), 2);
        this.write(new Buffer([0x21, 0x00]), 2);
        this.write(new Buffer([0x22, 0x08]), 2);

        super.tune(options);

        this.write(new Buffer([0x24, 0x00]), 2);

        this.rate = this.rate || datasheet.rate.default;
        this.gain = 2*this.rate/65536;
    }

    public finalize() {
        this.write(new Buffer([0x20, 0x00]), 2);

        super.finalize();
    }
}

export = L3G4200D;
