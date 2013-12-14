"use strict";

import ffi = require('ffi');
import ArrayType = require('ref-array');
import ref = require('ref');

var T = ref.types;
var $ = (type: any) => ref.refType(type);

var glvoid   = T.void;
var char     = T.char;
var glenum   = T.uint;
var boolean  = T.bool;
var bitfield = T.uint;
var byte     = T.char;
var short    = T.short;
var int      = T.int;
var sizei    = T.int;
var ubyte    = T.uchar;
var ushort   = T.ushort;
var uint     = T.uint;
var float    = T.float;
var clampf   = T.float;
var fixed    = T.int32;

var lib = new ffi.Library('libGLESv2', {
    glGetError                : [glenum, []],
    glGenTextures             : [glvoid, [sizei, $(uint)]],
    glBindTexture             : [glvoid, [glenum, uint]],
    glTexImage2D              : [glvoid,
        [glenum, int, int, sizei, sizei, int, glenum, glenum, $(glvoid)]
    ],
    glTexParameteri           : [glvoid, [glenum, glenum, int]],
    glGetAttribLocation       : [int,  [uint, T.CString]],
    glGetUniformLocation      : [int,  [uint, T.CString]],
    glClearColor              : [glvoid, [clampf, clampf, clampf, clampf]],
    glViewport                : [glvoid, [int, int, sizei, sizei]],
    glClear                   : [glvoid, [bitfield]],
    glUseProgram              : [glvoid, [uint]],
    glVertexAttribPointer     : [glvoid,
        [uint, int, glenum, boolean, sizei, $(glvoid)]
    ],
    glEnableVertexAttribArray : [glvoid, [uint]],
    glUniform1i               : [glvoid, [int, int]],
    glActiveTexture           : [glvoid, [glenum]],
    glDrawElements            : [glvoid, [glenum, sizei, glenum, $(glvoid)]],
    glDeleteTextures          : [glvoid, [sizei, $(uint)]],
    glDeleteProgram           : [glvoid, [uint]]
});

var NO_ERROR                      = 0x0000;
var INVALID_ENUM                  = 0x0500;
var INVALID_VALUE                 = 0x0501;
var INVALID_OPERATION             = 0x0502;
var INVALID_FRAMEBUFFER_OPERATION = 0x0506;
var OUT_OF_MEMORY                 = 0x0505;

function checkError() {
    switch(lib.glGetError()) {
        case NO_ERROR:
            return;
        case INVALID_ENUM:
            throw new RangeError('Enum argument out of range');
        case INVALID_VALUE:
            throw new RangeError('Numeric argument out of range');
        case INVALID_FRAMEBUFFER_OPERATION:
            throw new Error('Framebuffer is incomplete');
        case INVALID_OPERATION:
            throw new Error('Operation illegal in current state');
        case OUT_OF_MEMORY:
            throw new Error('Not enough memory left to execute command');
        default:
            throw new Error('Unknown error #' + lib.glGetError());
    }
}

var UintArray   = ArrayType<number>(uint);
var UshortArray = ArrayType<number>(ushort);
var FloatArray  = ArrayType<number>(float);

export function genTextures(num: number): number[] {
    if(num <= 0) return [];
    var ids = new UintArray(num|0);
    lib.glGenTextures(num|0, ids.buffer);
    return ids.toArray();
}

export function bindTexture(target: number, texId: number) {
    lib.glBindTexture(target|0, texId);
    checkError();
}

export function texParameter(target: number, param: number, value: number) {
    lib.glTexParameteri(target|0, param|0, value|0);
    checkError();
}

export function getAttribLocation(program: number, name: string): number {
    var res = lib.glGetAttribLocation(program|0, name);
    checkError();
    return res;
}

export function getUniformLocation(program: number, name: string): number {
    var res = lib.glGetUniformLocation(program|0, name);
    checkError();
    return res;
}

export function clearColor(r: number, g: number, b: number, a: number) {
    lib.glClearColor(r, g, b, a);
    checkError();
}

export function viewport(x: number, y: number, width: number, height: number) {
    lib.glViewport(x|0, y|0, width|0, height|0);
    checkError();
}

export function clear(buf: number) {
    lib.glClear(buf|0);
    checkError();
}

export function useProgram(program: number) {
    lib.glUseProgram(program|0);
    checkError();
}

export function vertexAttribPointer(location: number, size: number, vertices: number[]) {
    var verBuf = new FloatArray(vertices).buffer;
    lib.glVertexAttribPointer(location|0, size|0, FLOAT, FALSE, float.size, verBuf);
    checkError();
}

export function enableVertexAttribArray(location: number) {
    lib.glEnableVertexAttribArray(location|0);
    checkError();
}

export function uniform1(location: number, value: number) {
    lib.glUniform1i(location|0, value|0);
    checkError();
}

export function activeTexture(texture: number) {
    lib.glActiveTexture(texture|0);
    checkError();
}

export function drawElements(mode: number, indices: number[]) {
    var indBuf = new UshortArray(indices).buffer;
    lib.glDrawElements(mode|0, indices.length, UNSIGNED_SHORT, indBuf);
    checkError();
}

export function deleteTextures(textures: number[]) {
    var texBuf = new UintArray(textures).buffer;
    lib.glDeleteTextures(textures.length, texBuf);
    checkError();
}

export function deleteProgram(program: number) {
    lib.glDeleteProgram(program|0);
    checkError();
}

export function texImage2D(
        target: number, level: number, internalFormat: number, width: number,
        height: number, border: number, format: number, pixels: number[]) {
    arguments[7] = new FloatArray(pixels).buffer;
    lib.glTexImage2D.apply(null, arguments);
    checkError();
}

export var RGB                = 0x1907;
export var UNSIGNED_BYTE      = 0x1401;
export var TEXTURE_MIN_FILTER = 0x2801;
export var TEXTURE_MAG_FILTER = 0x2800;
export var LINEAR             = 0x2601;
export var TEXTURE_WRAP_S     = 0x2802;
export var TEXTURE_WRAP_T     = 0x2803;
export var CLAMP_TO_EDGE      = 0x812F;
export var COLOR_BUFFER_BIT   = 0x00004000;
export var FLOAT              = 0x1406;
export var TRUE               = 1;
export var FALSE              = 0;
export var TEXTURE0           = 0x84C0;
export var TEXTURE1           = 0x84C1;
export var TEXTURE_2D         = 0x0DE1;
export var TRIANGLES          = 0x0004;
export var UNSIGNED_SHORT     = 0x1403;
