"use strict";

class Widget {
    public canvas:   HTMLCanvasElement;

    public _textures: any = {};
    public _context:  CanvasRenderingContext2D;

    private _toload: number;
    private _loaded: number;

    constructor(canvas: HTMLCanvasElement) {
        this._context = canvas.getContext('2d');
        this.canvas   = canvas;

        var textures = (<any> this).constructor._TEXTURES;

        if(textures)
            this._loadTextures(textures);
    }

    public update(...data: any[]) {
        throw new Error('Abstract update called');
    }

    public _appear() {
        throw new Error('Abstract appearance called');
    }

    private _loadTextures(textures: {path: string; factor?: number}[]) {
        this._loaded = 0;
        this._toload = Object.keys(textures).length;

        var bw = (<any> this).constructor._BASE_WIDTH,
            bh = (<any> this).constructor._BASE_HEIGHT,
            sx = this.canvas.width/bw,
            sy = this.canvas.height/bh;

        for (var entry in textures) if(textures.hasOwnProperty(entry)) {
            var texture: HTMLImageElement,
                factor:  number = entry.factor || 1;

            texture = new (<any> window).Image;
            texture.onload = this._prepareTextures.bind(this, texture, sx, sy);
            texture.src    = textures[entry].path;

            this._textures[entry] = texture;
        };
    }

    private _prepareTextures(texture: HTMLImageElement, sx: number, sy: number) {
        this._loaded++;

        texture.width  = texture.naturalWidth  * sx;
        texture.height = texture.naturalHeight * sy;

        if(this._loaded === this._toload)
            this._appear();
    }
}

export = Widget;
