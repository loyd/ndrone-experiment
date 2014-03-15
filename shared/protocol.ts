/*!
 * State
 * =====
 * Network byte order is used (big-endian, BE).
 *
 *     0     2     4     6     8    9    10   11   12  13   14  15
 *     ┌─────┬─────┬─────┬─────╥────┬────╥────┬────┬────╥───╥───┐
 *     │ q'₀ │ q'₁ │ q'₂ │ q'₃ ║ tₐ │ t₀ ║ l'₁│ l'₅│l'₁₅║ m ║ c │
 *     └─────┴─────┴─────┴─────╨────┴────╨────┴────┴────╨───╨───┘
 *              attitude      temperatures     load    memory cpu
 * where
 *     q'₀, q'₁, q'₂, q'₃ — reformed attitude:
 *         q'ₓ = ⌊qₓ·10⁴⌋, if qₓ ≥ 0
 *         q'ₓ = ⌈qₓ·10⁴⌉, othewise
 *             where qₓ — component of normalized quaternion
 *
 *     tₐ — temperature of board in °C
 *     t₀ — temperature within box in °C
 *
 *     l'₁, l'₅, l'₁₅ — reformed load average:
 *         l'ₓ = max(lₓ·100; 255)
 *             where lₓ — load average during the last x minutes
 *
 *     m — memory usage
 *     c — cpu usage
 *
 *
 * Control
 * =======
 * Network byte order is used (big-endian, BE).
 *
 *     0     2     4     6     8
 *     ┌─────┬─────┬─────┬─────┐
 *     │ q'₀ │ q'₁ │ q'₂ │ q'₃ │
 *     └─────┴─────┴─────┴─────┘
 *              attitude
 * where
 *     q'₀, q'₁, q'₂, q'₃ — reformed attitude:
 *         q'ₓ = ⌊qₓ·10⁴⌋, if qₓ ≥ 0
 *         q'ₓ = ⌈qₓ·10⁴⌉, othewise
 *             where qₓ — component of normalized quaternion
 */
"use strict";

import assert = require('assert');
import stream = require('stream');

export interface IState {
    attitude: number[/*4*/];
    temperatures: {
        inside: number;
        outside: number;
    };

    load: number[/*one, five, fifteen*/];
    memory: number;
    cpu: number;
}

export interface IControl {
    attitude: number[/*4*/];
}

enum EDataType {STATE, CONTROL}
var STATE_SIZE   = 15;
var CONTROL_SIZE = 8;

export class Encoder extends stream.Readable {
    private _stateBk   = new Buffer(STATE_SIZE + 1);
    private _controlBk = new Buffer(CONTROL_SIZE + 1);

    constructor() {
        super();

        this._stateBk[0]   = EDataType.STATE;
        this._controlBk[0] = EDataType.CONTROL;
    }

    public encode(data: IState): void;
    public encode(data: IControl): void;
    public encode(data: any) {
        'load' in data ? this._encodeState(data) : this._encodeControl(data);
    }

    private _encodeState(data: IState) {
        var buf = this._stateBk.slice(1);

        var attitude = data.attitude,
            temps = data.temperatures,
            load = data.load;

        assert(attitude.length === 4);
        assert(attitude.every((comp) => -1 <= comp && comp <= 1));
        assert(-128 <= temps.inside  && temps.inside  <= 127);
        assert(-128 <= temps.outside && temps.outside <= 127);
        assert(load.length === 3);
        assert(load.every((comp) => comp >= 0));
        assert(0 <= data.memory && data.memory <= 1);
        assert(0 <= data.cpu && data.cpu <= 1);

        for(var i = 0; i < 4; ++i) {
            var val = attitude[i] * 1e4;
            buf[i*2]   = val >> 8;
            buf[i*2+1] = val & 0xff;
        }

        buf[8]  = temps.inside;
        buf[9]  = temps.outside;
        buf[10] = Math.min(load[0] * 100, 255);
        buf[11] = Math.min(load[1] * 100, 255);
        buf[12] = Math.min(load[2] * 100, 255);
        buf[13] = data.memory * 100;
        buf[14] = data.cpu * 100;

        this.push(this._stateBk);
    }

    private _encodeControl(data: IControl) {
        var buf = this._controlBk.slice(1);
        var attitude = data.attitude;

        assert(attitude.length === 4);
        assert(attitude.every((comp) => -1 <= comp && comp <= 1));

        for(var i = 0; i < 4; ++i) {
            var val = attitude[i] * 1e4;
            buf[i*2]   = val >> 8;
            buf[i*2+1] = val & 0xff;
        }

        this.push(this._controlBk);
    }

    /*
        Implementation of stream's template method
     */

    public _read(size: number) {
        // Ignore request
    }
}

/**
 * @event Decoder#state(IState)
 * @event Decoder#control(IControl)
 */
export class Decoder extends stream.Writable {
    private _storage = new Buffer(0);

    private _decodeState(data: NodeBuffer) {
        assert(data.length === STATE_SIZE);
        var v: number;
        var state: IState = <IState> {};

        state.attitude = [
            (((v = data[0] << 8 | data[1]) < 0x8000 ? v : v - 0x10000)) / 1e4,
            (((v = data[2] << 8 | data[3]) < 0x8000 ? v : v - 0x10000)) / 1e4,
            (((v = data[4] << 8 | data[5]) < 0x8000 ? v : v - 0x10000)) / 1e4,
            (((v = data[6] << 8 | data[7]) < 0x8000 ? v : v - 0x10000)) / 1e4
        ];

        state.temperatures = {
            inside  : ((v = data[8]) < 0x80 ? v : v - 0x100),
            outside : ((v = data[9]) < 0x80 ? v : v - 0x100)
        };

        state.load = [data[10]/100, data[11]/100, data[12]/100];
        state.memory = data[13] / 100;
        state.cpu    = data[14] / 100;

        this.emit('state', state);
    }

    private _decodeControl(data: NodeBuffer) {
        assert(data.length === CONTROL_SIZE);
        var v: number;

        var attitude = [
            (((v = data[0] << 8 | data[1]) < 0x8000 ? v : v - 0x10000)) / 1e4,
            (((v = data[2] << 8 | data[3]) < 0x8000 ? v : v - 0x10000)) / 1e4,
            (((v = data[4] << 8 | data[5]) < 0x8000 ? v : v - 0x10000)) / 1e4,
            (((v = data[6] << 8 | data[7]) < 0x8000 ? v : v - 0x10000)) / 1e4
        ];

        this.emit('control', {attitude : attitude});
    }

    /*
        Implementation of stream's template method
     */

    public _write(data: any, enc: string, cb: Function) {
        var storage = this._storage;
        assert(storage.length === 0 || (<any> storage[0]) in EDataType);

        if(storage.length > 0)
            data = Buffer.concat([storage, data]);
        else if(!(data[0] in EDataType))
            return cb();

        if(data[0] === EDataType.STATE) {
            if(data.length > STATE_SIZE) {
                this._storage = data.slice(STATE_SIZE+1);
                this._decodeState(data.slice(1, STATE_SIZE+1));
            } else
                this._storage = data;
        } else /* EDataType.CONTROL */ {
            if(data.length > CONTROL_SIZE) {
                this._storage = data.slice(CONTROL_SIZE+1);
                this._decodeControl(data.slice(1, CONTROL_SIZE+1));
            } else
                this._storage = data;
        }

        return cb();
    }
}
