"use strict";

import child     = require('child_process');
import assert    = require('assert');
import config    = require('../../config');
import transport = require('../../shared/transport');

var tcpVideo = new transport.TcpTransport({
    port : config.FPV_VIDEO_PORT,
    timeout : config.FPV_VIDEO_TIMEOUT
});

var raspivid: child.ChildProcess;

//#XXX: bad abstraction for streaming
tcpVideo.on('connect', () => {
    var opts = [
        '-w', config.FPV_VIDEO_WIDTH,
        '-h', config.FPV_VIDEO_HEIGHT,
        '-fps', config.FPV_VIDEO_FPS,
        '-t', '0',
        '-vs',
        '-n',
        '-o', '-'
    ];

    if(config.FPV_VIDEO_BITRATE > 0)
        opts.push('-b', config.FPV_VIDEO_BITRATE);

    if(config.FPV_VIDEO_GOP_SIZE > 0)
        opts.push('-g', config.FPV_VIDEO_GOP_SIZE);

    if(config.FPV_VIDEO_HFLIP)
        opts.push('-hf');

    if(config.FPV_VIDEO_VFLIP)
        opts.push('-vf');

    raspivid = child.spawn('raspivid', <any> opts);
    raspivid.stdout.pipe(tcpVideo, {end : false});

    //#TODO: add listeners to stderr
});

tcpVideo.on('error', (err: Error) => {
    raspivid.kill();
    throw err;
});

tcpVideo.on('close', () => raspivid.kill());
