/// <reference path="../definitions/node/node.d.ts" />
/// <reference path="../definitions/smoothie/smoothie.d.ts" />
"use strict";

import config = require('../config');

import Transport = require('../shared/transport');
import Protocol  = require('../shared/protocol');
import Video     = require('./video/video');
import OSD       = require('./osd/osd');

var udpInfo = new Transport.UdpTransport({
    host : config.DOMAIN,
    port : config.FPV_INFO_PORT,
    timeout : config.FPV_INFO_TIMEOUT
});

var decoder = new Protocol.Decoder;
udpInfo.pipe(decoder);

function onload() {
    var document = window.document;
    var $: (sel: string) => Element = document.querySelector.bind(window.document);

    var osd = new OSD({
        compass : <HTMLCanvasElement> $('#compass'),
        horizon : <HTMLCanvasElement> $('#horizon'),
        cpumem  : <HTMLCanvasElement> $('#cpumem'),
        temp    : <HTMLCanvasElement> $('#temp'),
        load    : <HTMLCanvasElement> $('#load'),
    });

    decoder.on('state', (state: Protocol.IState) => osd.update(state));

    // var video = new Video(<HTMLCanvasElement> $('#video'));
}

export = onload;
