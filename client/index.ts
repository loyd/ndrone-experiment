/// <reference path="../definitions/node/node.d.ts" />
"use strict";

import Video = require('./video/video');

function onload() {
    var doc = window.document;
    var $: (sel: string) => Element = doc.querySelector.bind(window.document);

    new Video(<HTMLCanvasElement> $('#video'));
}

export = onload;
