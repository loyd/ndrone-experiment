"use strict";

import Sensor = require('./sensor');

class BMP085 extends Sensor {
    public static ADDRESS   = 0x77;
    public static DATASHEET = {
        mode: {
            0 : 5,
            1 : 8,
            2 : 14,
            3 : 26
        }
    };

    public mode: number;
    public coef: any;
    public oss:  number;

    constructor(bus: string, options?: {mode?: number}) {
        super(bus, options);
    }

    public measure(type: string, callback?: (err: Error, value: number) => void): any;
    public measure(type: 'pressure'): number;
    public measure(type: 'temperature'): number;
    public measure(type: string, callback?: any, buffer?: any): any {
        if(!(callback instanceof Function))
            throw new Error('Only asynchronous method supported');

        buffer = buffer || new Buffer(3);

        if(type === 'pressure') {
            buffer[0] = 0xF4;
            buffer[1] = 0x34 + (this.oss << 6);

            this.write(buffer, 2, (err) => {
                if(err) return callback(err);

                setTimeout(() => {
                    this.read(0xF6, 3, buffer, (err, data) =>
                        err ? callback(err)
                            : callback(null, this._calcPressure(data))
                    );
                }, this.mode);
            });
        } else if(type === 'temperature') {
            buffer[0] = 0xF4;
            buffer[1] = 0x2E;

            this.write(buffer, 2, (err) => {
                setTimeout(() => {
                    this.read(0xF6, 2, buffer, (err, data) => {
                        if(err) return callback(err);

                        var coef = this.coef,
                            ut = (data[0] << 8) | data[1],
                            x1 = ((ut - coef.ac6) * coef.ac5) >> 15,
                            x2 = (coef.mc << 11) / (x1 + coef.md);

                        coef.b5 = x1 + x2;
                        callback(null, ((coef.b5 + 8) >> 4) / 10);
                    });
                }, this.mode);
            });
        }
    }

    public tune(options: {mode?: number}) {
        this.mode = BMP085.DATASHEET.mode[this.oss];
        this.coef = {};
        this.oss  = options['oss'] || 0;
        var bytes = new Buffer(2);

        [   ['ac1', 0xAA],
            ['ac2', 0xAC],
            ['ac3', 0xAE],
            ['b1',  0xB6],
            ['b2',  0xB8],
            ['mb',  0xBA],
            ['mc',  0xBC],
            ['md',  0xBE]
        ].forEach((data: any[]) => {
            bytes = this.read(data[1], 2, bytes);
            this.coef[data[0]] = bytes.readInt16BE(0);
        });

        [   ['ac4', 0xB0],
            ['ac5', 0xB2],
            ['ac6', 0xB4]
        ].forEach((data: any[]) => {
            bytes = this.read(data[1], 2, bytes);
            this.coef[data[0]] = bytes.readUInt16BE(0);
        });

        this.measure('temperature', (err, t) => {});
    }

    private _calcPressure(raw: NodeBuffer) {
        var coef = this.coef,
            oss  = this.oss;

        var x1: number, x2: number, x3: number, p: number,
            b3: number, b4: number, b6: number, b7: number,
            up = ((raw[0] << 16) | (raw[1] << 8)) >> (8 - oss);
  
        b6 = coef.b5 - 4000;
        x1 = (coef.b2  * (b6 * b6) >> 12) >> 11;
        x2 = (coef.ac2 * b6) >> 11;
        x3 = x1 + x2;
        b3 = (((coef.ac1 * 4 + x3) << oss) + 2) >> 2;
        x1 = (coef.ac3 * b6) >> 16;
        x2 = (coef.b1  * ((b6 * b6) >> 12)) >> 16;
        x3 = ((x1 + x2) + 2) >> 2;
        b4 = (coef.ac4 * (x3 + 32768)) >> 15;
        b7 = ((up - b3) * (50000 >> oss));
        p  = b7 < 0x80000000 ? (b7 *  2) / b4 : (b7 / b4) >> 1;
        x1 = p >> 8;
        x1*= x1;
        x1 = (x1 * 3038) >> 16;
        x2 = (-7357 * p) >> 16;
        p += (x1 + x2 + 3791) >> 4;

        return p;
    }
}

export = BMP085;
