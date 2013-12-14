"use strict";
 
import assert = require('assert');
import events = require('events');
import fs = require('fs');

import ioctl = require('../ffi/ioctl');
 
var I2C_SLAVE = 0x703;

class Sensor extends events.EventEmitter {
    public static DATASHEET: any;
    public static ADDRESS: number;
 
    private _streams:   {[key: string]: NodeTimer} = {};
    private _periods:   {[key: string]: number}    = {};
    private _callbacks: {[key: string]: Function}  = {};
    private _fd: number;
 
    constructor(bus: string, options?: any) {
        super();
 
        var address = (<any> this).constructor.ADDRESS;
 
        if (!(address && bus))
            throw new Error('Invalid parameters for setup');
 
        var fd = this._fd = fs.openSync(bus, 'r+');
        ioctl(fd, I2C_SLAVE, address);
 
        if(options) this.tune(options);
    }

    public write(buffer: NodeBuffer, callback?: (err: Error) => void): void;
    public write(buffer: NodeBuffer, length: number, callback?: (err: Error) => void): void;
    public write(buffer: NodeBuffer, length?: any, callback?: any) {
        if(typeof length !== 'number') {
            callback = length;
            length   = buffer.length;
        }

        if(callback)
            fs.write(this._fd, buffer, 0, length, null, (err, written) => {
                if(err) return callback(err);
                assert(written === length);

                callback(null);
            });
        else {
            var written = fs.writeSync(this._fd, buffer, 0, length, null);
            assert(written === length);
        }
    }
 
    public read(register: number, length: number,
                callback?: (err: Error, data: NodeBuffer) => void): NodeBuffer;
    public read(register: number, length: number, buffer: NodeBuffer,
                callback?: (err: Error, data: NodeBuffer) => void): NodeBuffer;
    public read(register: number, length: number, buffer?: any, callback?: any): NodeBuffer {
        if(!(buffer instanceof Buffer)) {
            callback = buffer;
            buffer   = new Buffer(length);
        }

        buffer[0] = register;
 
        if(callback)
            fs.write(this._fd, buffer, 0, 1, null, (err, written) => {
                if(err) return callback(err);
                assert(written === 1);

                fs.read(this._fd, buffer, 0, length, null, (err, read, block) => {
                    if(err) return callback(err);
                    assert(read === length);
                    
                    callback(null, block);
                });
            });
        else {
            var bytes = fs.writeSync(this._fd, buffer, 0, 1, null);
            assert(bytes === 1);

            bytes = fs.readSync(this._fd, buffer, 0, length, null);
            assert(bytes === length);
 
            return buffer;
        }
    }
 
    public tune(options: any) {
        var datasheet = (<any> this).constructor.DATASHEET,
            sending   = {};
 
        for(var option in datasheet) if(datasheet.hasOwnProperty(option)) {
            var entry = datasheet[option];

            if(option in options) {
                var level = options[option];
                if(!(<any>level in entry))
                    throw new Error('Invalid option level for sensor');

                this[option] = level;
            }

            sending[entry.register]  = sending[entry.register] || entry.default || 0x00;
            sending[entry.register] |= entry[level];
        }

        for(var register in sending) if(sending.hasOwnProperty(register))
            this.write(new Buffer([parseInt(register, 10), sending[register]]), 2);
    }
 
    public measure(type: string, callback?: (err: Error, ...values: number[]) => void): void;
    public measure(type: string): any;
    public measure(type: string, callback?: Function, buffer?: NodeBuffer): any {
        throw new Error('Abstract method called');
    }
 
    public stream(type: string, period: number, callback?: Function) {
        if(period <= 0)
            throw new RangeError('period must be greater than 0');

        var time = Date.now(),
            buffer = new Buffer(8),
            listeners = Sensor.listenerCount(this, type);

        if(callback && listeners === 0) {
            var fire = (/* ...args */) => {
                var dtime = -(time - (time = Date.now()));
                callback.apply(this, [].slice.call(arguments).concat(dtime));
            };
            this._callbacks[type] = callback;
        } else {
            var argsBase = [type];
            var fire = (/* ...args */) => {
                var dtime = -(time - (time = Date.now()));
                this.emit.apply(this, argsBase.concat<any>([].slice.call(arguments), dtime));
            };
        }

        this._periods[type] = period;
        this._streams[type] = setInterval(() =>
           (<any> this.measure)(type, fire, buffer),
        period);

        if(callback && listeners > 0) this.on(type, callback);
    }

    public on(type: string, callback: Function): events.EventEmitter {
        if(!(type in this._streams))
            throw new Error('Event does not exist');

        if(Sensor.listenerCount(this, type) === 0) {
            this.streamOff(type);
            this.stream(type, this._periods[type]);

            super.on(type, this._callbacks[type]);
            this._callbacks[type] = null;
        }

        return super.on(type, callback);
    }
 
    public streamOff(type: string) {
        if(!(type in this._streams))
            throw new Error('Invalid type');
 
        this.removeAllListeners(type);
        clearInterval(<any> this._streams[type]);
        this._streams[type] = null;
    }
 
    public finalize() {
        for(var type in this._streams) if(this._streams.hasOwnProperty(type)) {
            clearInterval(<any> this._streams[type]);
            this._streams[type] = null;
        }
 
        fs.closeSync(this._fd);
    }
}
 
export = Sensor;
