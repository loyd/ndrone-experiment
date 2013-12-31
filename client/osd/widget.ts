"use strict";

class Widget {
    public canvas:   HTMLCanvasElement;
    public context:  CanvasRenderingContext2D;
    public textures: HTMLImageElement[] = [];

    public rate: number;

    constructor(rate: number, options?: {path: string; factor?: number}[]) {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'widget';

        this.context = this.canvas.getContext('2d')

        if(options)
            options.forEach((entry, i) => {
                var texture: HTMLImageElement,
                    factor:  number = entry.factor || 1;

                texture = new Image();
                texture.src = entry.path;

                texture.width  *= factor;
                texture.height *= factor;

                this.textures[i] = texture;
            });

        document.body.appendChild(this.canvas);
    }

    public update(data: any) {
        throw new Error('Abstract method called');
    }
}

export = Widget;
