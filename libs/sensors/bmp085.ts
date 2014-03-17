"use strict";

import Sensor = require('./sensor');

class BMP085 extends Sensor {
    public static ADDRESS   = 0x77;
    public static DATASHEET = {
        oss : {
            default : 0
        },

        time : {
            default : 5,

            0 : 5,
            1 : 8,
            2 : 14,
            3 : 26
        }
    };

    public coef: any;

    public time: number;
    public oss:  number;

    constructor(bus: string, options?: {oss?: number}) {
        super(bus, options);
    }

    public measure(type: string, callback?: (err: Error, ...values: number[]) => void): any;
    public measure(type: 'condition'): number;
    public measure(type: string, callback?: any, buffer?: any): any {
        if(!(callback instanceof Function))
            throw new Error('Only asynchronous method supported');

        buffer = buffer || new Buffer(3);

        var time = this.time;

        if(type === 'condition') {
            buffer[0] = 0xF4;
            buffer[1] = 0x2E;

            this.write(buffer, 2, (err) => {
                setTimeout(() => {
                    this.read(0xF6, 2, buffer, (err, tdata) => {
                        if(err) return callback(err);

                        var coef = this.coef,
                            ut = (tdata[0] << 8) | tdata[1],
                            x1 = ((ut - coef.ac6) * coef.ac5) >> 15,
                            x2 = (coef.mc << 11) / (x1 + coef.md);

                        coef.b5 = x1 + x2;

                        var t = ((coef.b5 + 8) >> 4) / 10;

                        buffer[0] = 0xF4;
                        buffer[1] = 0x34 + (this.oss << 6);

                        this.write(buffer, 2, (err) => {
                            if(err) return callback(err);

                            setTimeout(() => {
                                this.read(0xF6, 3, buffer, (err, pdata) =>
                                    err ? callback(err)
                                        : callback(null,
                                                   t,
                                                   this._calcPressure(pdata))
                                );
                            }, time);
                        });
                    });
                }, time);
            });
        }
    }

    public tune(options: {oss?: number}) {
        var datasheet = BMP085.DATASHEET;

        this.oss  = options.oss || datasheet.oss.default;
        this.time = (<any> datasheet.time)[this.oss] || datasheet.time.default;
        this.coef = {};
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
    }

    private _calcPressure(raw: NodeBuffer) {
        var coef = this.coef,
            oss  = this.oss;

        var x1: number, x2: number, x3: number, p: number,
            b3: number, b4: number, b6: number, b7: number,
            up = ((raw[0] << 16) | (raw[1] << 8) | raw[2]) >> (8 - oss);
  
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
