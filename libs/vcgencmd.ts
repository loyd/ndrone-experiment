"use strict";

import assert = require('assert');
import ffi    = require('ffi');
import ref    = require('ref');

var MSGBUF_SIZE = 1024;

var T = ref.types;
var $ = (type: ref.Type) => ref.refType(type);

var vchiInstanceType   = $(T.void),
    vchiConnectionType = T.void;

var lib = new ffi.Library('libbcm_host', {
    vcos_init           : [T.void, []],
    vchi_initialise     : [T.int32, [$(vchiInstanceType)]],
    vchi_connect        : [T.int32, [$($(vchiConnectionType)), T.uint32, vchiInstanceType]],
    vc_vchi_gencmd_init : [T.void, [vchiInstanceType, $($(vchiConnectionType)), T.uint32]],
    vc_gencmd_send      : [T.int, [T.CString], {async : true}],
    vc_gencmd_read_response : [T.int, [$(T.char), T.int], {async : true}],
    vc_gencmd_stop      : [T.void, []],
    vchi_disconnect     : [T.int32, [vchiInstanceType]]
});

/*
    Сommunication with vcgencmd service is done through a request-response.
    Unfortunately, we can only have one connection. Therefore if we want to use
    async-style it is necessary to use queue of requests and state machine.
*/

enum EStates {BUSY, IDLE, BLOCK}

var buffer = new Buffer(MSGBUF_SIZE),
    state: EStates = EStates.IDLE;

var queue = {
    head : <any> null,
    tail : <any> null,

    enqueue(data: IArguments) {
        if(this.tail)
            this.tail = (this.tail.next = {next : null, data : data});
        else
            this.head = this.tail = {next : null, data : data};
    },

    dequeue() {
        var res = this.head;
        if(!(this.head = res.next)) this.tail = null;
        return res.data;
    }
};

// Initialize connection
var vchi = (() => {
    var vchiInstPtr = ref.alloc($(vchiInstanceType)),
        vchiConnPtr = ref.alloc($(vchiConnectionType), ref.NULL);

    lib.vcos_init();

    if(lib.vchi_initialise(vchiInstPtr) !== 0)
        throw new Error('VCHI initialization failed');

    var vchiInst = vchiInstPtr.deref();
    if(lib.vchi_connect(ref.NULL, 0, vchiInst) !== 0)
        throw new Error('VCHI connection failed');

    lib.vc_vchi_gencmd_init(vchiInst, vchiConnPtr, 1);
    return vchiInst;
})();

function hardDisconnect() {
    lib.vc_gencmd_stop();
    if(lib.vchi_disconnect(vchi) !== 0)
        throw new Error('VCHI disconnect failed');
}

/*
    Low-level API
 */

export function request(what: string, cb: (err: Error, answer?: string) => void) {
    switch(state) {
        case EStates.BUSY  : queue.enqueue(arguments);
        case EStates.BLOCK : return;
        case EStates.IDLE  : state = EStates.BUSY;
    }

    lib.vc_gencmd_send(what, (err: Error, res: number) => {
        if(err) return cb(err);
        if(res) return cb(new Error('Failed to send request'));
        assert(state !== EStates.IDLE);

        lib.vc_gencmd_read_response(buffer, MSGBUF_SIZE, (err: Error, res: number) => {
            if(err) return cb(err);
            if(res) return cb(new Error('Failed to read response'));
            assert(state !== EStates.IDLE);

            cb(null, ref.readCString(buffer));

            if(state === EStates.BLOCK) {
                queue = null;
                return hardDisconnect();
            }
            
            state = EStates.IDLE;
            if(queue.head)
                request.apply(null, queue.dequeue());
        });
    });
}

/*
    High-level API
 */

export enum EClocks {arm, core, h264, isp, v3d, uart, pwm, emmc, pixel, vec, hdmi, dpi}
export function measureClock(clock: EClocks, cb: (err: Error, res?: number) => void) {
    request('measure_clock ' + EClocks[clock], (err, answer?) => {
        if(err) cb(err);
        assert(answer[10] !== '0');
        err ? cb(err) : cb(null, +answer.slice(answer.indexOf('=')+1));
    });
}

export function measureTemp(cb: (err: Error, res?: number) => void) {
    request('measure_temp', (err, answer?) =>
        err ? cb(err) : cb(null, parseFloat(answer.slice(5)))
    );
}

export enum ECodecs {H264, MPG2, WVC1, MPG4, MJPG, WMV9}
export function codecEnabled(codec: ECodecs, cb: (err: Error, res?: boolean) => void) {
    request('codec_enabled ' + ECodecs[codec], (err, answer?) =>
        err ? cb(err) : cb(null, answer[5] === 'e')
    );
}

export function getConfig(cb: (err: Error, config?: any) => void) {
    request('get_config int', (err, answer?) =>
        err ? cb(err) : cb(null, answer.split('\n').reduce<any>((cnf, line) => {
            var pair = line.split('=');
            cnf[pair[0]] = +pair[1];
            return cnf;
        }, {}))
    );
}

export interface ICameraAvailability {
    supported: boolean;
    detected: boolean;
}

export function getCamera(cb: (err: Error, res?: ICameraAvailability) => void) {
    request('get_camera', (err, answer?) =>
        err ? cb(err) : cb(null, {
            supported : answer[10] === '1',
            detected  : answer[21] === '1'
        })
    );
}

export enum EMems {arm, gpu}
export function getMem(mem: EMems, cb: (err: Error, res?: number) => void) {
    request('get_mem ' + EMems[mem], (err, answer?) =>
        err ? cb(err) : cb(null, parseInt(answer.slice(4), 10))
    );
}

export function disconnect() {
    if(state === EStates.IDLE) hardDisconnect();
    state = EStates.BLOCK;
}
