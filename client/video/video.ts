/*
    Now (feb 2014) Real-time video using browser is non-trivial problem.
    There are few solutions of it.

    Broadway.js:
    - lack of h/w acceleration (high CPU usage and resolution < 480p)
    - only baseline profile of h264
    - not available from package managers
    - poor documentation

    <video src>:
    + simplicity
    - only HTTP
    - each fragment must begin with keyframe (implementation-specific)
    - forced buffering (latency > 2s, implementation-specific)
    - need to use a wrapper of raw data

    Media Source Extensions (MSE):
    - each fragment must begin with keyframe (implementation-specific)
    - forced buffering (implementation-specific latency)
    - need to use a wrapper of raw data (e.g. fragmented mp4)

    Media Stream (MS):
    - it's not possible to create custom stream on client

    VLC plugin:
    - impossible to completely disable buffering (latency > 2s)
    - must be installed
    - poor documentation

    Flash plugin:
    - bad support of linux and mobile platform
    - need to use flv container
    - must be installed
 */

"use strict";

import assert = require('assert');
import config = require('../../config');
import transport    = require('../../shared/transport');
import VideoDecoder = require('./video_decoder');

class Video {
    public width  = config.FPV_VIDEO_WIDTH;
    public height = config.FPV_VIDEO_HEIGHT;
    public ratio  = this.width / this.height;

    private _transport: transport.Transport;
    private _decoder: VideoDecoder;
    private _canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this._transport = new transport.TcpTransport({
            host : config.DOMAIN,
            port : config.FPV_VIDEO_PORT,
            timeout : config.FPV_VIDEO_TIMEOUT
        });

        this._decoder = new VideoDecoder(this.width, this.height);
        this._canvas = canvas;

        //#TODO: improve error/close handling
        // this._transport.on('error', onerror);
        // this._decoder.on('error', onerror);
        
        function onerror(err: Error) {
            throw err;
        }

        this._setupCanvas();
        this._setupPiping();
    }

    private _setupCanvas() {
        var canvas = this._canvas;
        canvas.width  = this.width;
        canvas.height = this.height;

        this._onresize();

        //#TODO: implement throttle for onresize
        window.addEventListener('resize', () => this._onresize(), false);
    }

    private _onresize() {
        var ratio = this.ratio,
            style = this._canvas.style;

        var viewWidth  = window.innerWidth,
            viewHeight = window.innerHeight;

        if(viewWidth/viewHeight < ratio) {
            var realHeight  = viewWidth / ratio | 0,
                deltaHeight = viewHeight - realHeight;

            style.width  = viewWidth  + 'px';
            style.height = realHeight + 'px';
            style.top = (deltaHeight/2 | 0) + 'px';
            style.left = '0';
        } else {
            var realWidth  = viewHeight * ratio | 0,
                deltaWidth = viewWidth - realWidth;

            style.height = viewHeight + 'px';
            style.width  = realWidth  + 'px';
            style.left = (deltaWidth/2 | 0) + 'px';
            style.top = '0';
        }
    }

    private _setupPiping() {
        this._transport.pipe(this._decoder);

        var ctx = this._canvas.getContext('2d'),
            imageData = ctx.createImageData(this.width, this.height),
            buf = imageData.data;

        this._decoder.on('data', (data: NodeBuffer) => {
            (<any> buf.set)(data, 0);

            /*
                Don't use `requestAnumationFrame`, because his rate is 60Hz.
                Thus, we can get an additional delay of up to 17ms.
             */
            ctx.putImageData(imageData, 0, 0);
        });
    }
}

export = Video;
