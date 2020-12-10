import { Vector2 } from "../Core/Vector2";

export enum HorizontalAlign {
    LEFT = 0,
    CENTER = 1,
    RIGHT = 2
}
export enum VerticalAlign {
    TOP = 0,
    CENTER = 1,
    BOTTOM = 2
}


export enum RenderType {
    STROKE = 1,
    FILL = 2,
    ALL = 3
}



export class Renderer {

    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private _width: number;
    private _height: number;
    private _localOffset: Vector2;

    private _font: string;
    private _fontsize: number;


    public constructor(canvas?: HTMLCanvasElement) {
        if (canvas) {
            this._canvas = canvas;
        } else {
            this._canvas = document.createElement("canvas");
        }
        this._canvas.tabIndex = 0;
        this._canvas.style.outline = 'none';
        this._context = this.canvas.getContext("2d");
        this._context.globalAlpha = 1.0;
        this._context.translate(0, 0);
        this._localOffset = new Vector2(0.5, 0.5);
        this._font = 'sans-serif';
        this._fontsize = 10;
    }

    public apply(div: HTMLDivElement) {
        div.appendChild(this.canvas);
    }


    public clear(color: string = '#A9A9A9') {

        // var old = this.context.fillStyle;
        this._context.clearRect(0, 0, this._width, this._height);
        // this.context.fillStyle = color;
        // this.context.fillRect(0, 0, this._width, this._height)
        // this.context.fillStyle = old;
    }

    public resize(width: number, height: number) {
        this._width = width;
        this._height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        var ratio = this.getPixelRatio(this.context);
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.canvas.width = width * ratio;
        this.canvas.height = height * ratio;
    }




    private getPixelRatio(context) {
        var backingStore = context.backingStorePixelRatio ||
            context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1;
        return (window.devicePixelRatio || 1) / backingStore;
    };






    protected get context(): CanvasRenderingContext2D {
        return this._context;
    }

    public get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

    public get font(): string {
        return this._font;
    }

    public set font(value: string) {
        this._font = value;
        this._context.font = `${this._fontsize}px ${this._font}`;
    }

    public get fontSize(): number {
        return this._fontsize;
    }

    public set fontSize(value: number) {
        this._fontsize = value;
        this._context.font = `${this._fontsize}px ${this._font}`;
    }


    public measureTextWidth(text: string): number {
        const measure = this.context.measureText(text);
        return measure.width;
    }

    /**
     * 
     * @param text 
     * @param x 
     * @param y 
     * @param width 
     * @param align 
     */
    public fillText(text: string, x: number, y: number, width?: number, align?: HorizontalAlign, vertical?: VerticalAlign) {
        var left = x;
        var top = y + this.fontSize * 0.95;
        if (vertical === VerticalAlign.CENTER) {
            top = top - this.fontSize / 2;
        } else if (vertical === VerticalAlign.BOTTOM) {
            top = top - this.fontSize;
        }
        top -= this.fontSize * 0.1;
        if (align === HorizontalAlign.RIGHT) {
            const measure = this.context.measureText(text);
            if (width == null) {
                left = x - measure.width;
            } else {
                left = x + width - measure.width;
            }
        } else if (align === HorizontalAlign.CENTER) {
            const measure = this.context.measureText(text);
            if (width == null) {
                left = x - measure.width / 2;
            } else {
                left = x + (width + measure.width) / 2;
            }
        }
        this.context.fillText(text, left + this._localOffset.x, top + this._localOffset.y);
    }



    public rectangle(x: number, y: number, width: number, height: number, type: RenderType) {
        this.context.beginPath();
        this.context.rect(x, y, width, height);
        if (type === RenderType.ALL || type === RenderType.FILL) {
            this.context.fill();
        }
        if (type === RenderType.ALL || type === RenderType.STROKE) {
            this.context.stroke();
        }
    }


    public draw(renderer: Renderer, x: number, y: number) {
        this.context.drawImage(renderer._canvas, x, y, renderer.width, renderer.height);
    }







    public circle(x: number, y: number, radius: number, type: RenderType) {
        this.context.beginPath();
        this.context.arc(x, y, radius, 0, Math.PI * 2, false);
        if (type === RenderType.ALL || type === RenderType.FILL) {
            this.context.fill();
        }
        if (type === RenderType.ALL || type === RenderType.STROKE) {
            this.context.stroke();
        }
    }


    public image(image: HTMLImageElement, pos: Vector2, width: number, height: number) {
        this.context.drawImage(image, pos.x, pos.y, width, height);
    }





    public polygon(points: Vector2[], closed: boolean, type: RenderType) {
        if (points == null || points.length === 0) return;
        this.context.beginPath();
        this.context.moveTo(points[0].x + this._localOffset.x, points[0].y + this._localOffset.y);
        for (var i = 1; i < points.length; i++) {
            this.context.lineTo(points[i].x + this._localOffset.x, points[i].y + this._localOffset.y);
        }
        if (closed) {
            this.context.closePath();
        }
        if (type === RenderType.ALL || type === RenderType.FILL) {
            this.context.fill();
        }
        if (type === RenderType.ALL || type === RenderType.STROKE) {
            this.context.stroke();
        }
    }


    public fillRectangle(x: number, y: number, width: number, height: number) {
        this.context.fillRect(x, y, width, height);
    }

    public strokeRectangle(x: number, y: number, width: number, height: number) {
        this.context.strokeRect(x, y, width, height);
    }







    /**
     * Rotate
     * @param x 
     * @param y 
     * @param radian 
     */
    public translateRotate(x: number, y: number, r: number) {
        this.context.translate(x, y);
        this.context.rotate(r / 180 * Math.PI);
        this.context.translate(-x, -y);
    }





    /**
     * draw line 
     * @param x1 
     * @param y1 
     * @param x2 
     * @param y2 
     * @param lineWidth 
     */
    public line(x1: number, y1: number, x2: number, y2: number, lineWidth: number = 1) {
        if (lineWidth && lineWidth !== this.context.lineWidth) {
            this.context.lineWidth = lineWidth;
        }
        this.context.beginPath();
        this.context.moveTo(x1 + this._localOffset.x, y1 + this._localOffset.y);
        this.context.lineTo(x2 + this._localOffset.x, y2 + this._localOffset.y);
        // this.context.closePath();
        this.context.stroke();
    }








    /**
     * fill polygon
     * @param points 
     * @param closed 
     */
    public fillPath(points: Vector2[], closed: boolean) {
        this.context.beginPath();
        this.context.moveTo(points[0].x + this._localOffset.x, points[0].y + this._localOffset.y);
        for (var i = 1; i < points.length; i++) {
            this.context.lineTo(points[i].x + this._localOffset.x, points[i].y + this._localOffset.y);
        }
        if (closed) {
            this.context.closePath();
        }
        this.context.fill();
    }


    /**
     * polygon
     * @param points 
     * @param closed 
     */
    public strokePath(points: Vector2[], closed: boolean) {
        this.context.beginPath();
        this.context.moveTo(points[0].x + this._localOffset.x, points[0].y + this._localOffset.y);
        for (var i = 1; i < points.length; i++) {
            this.context.lineTo(points[i].x + this._localOffset.x, points[i].y + this._localOffset.y);
        }
        if (closed) {
            this.context.closePath();
        }
        this.context.stroke();
    }



    public set opacity(v: number) {
        this.context.globalAlpha = v;
    }

    public get opacity(): number {
        return this.context.globalAlpha;
    }



    public set strokeColor(v: string | CanvasGradient | CanvasPattern) {
        this.context.strokeStyle = v;
    }

    public get strokeColor(): string | CanvasGradient | CanvasPattern {
        return this.context.strokeStyle;
    }



    public set fillColor(v: string | CanvasGradient | CanvasPattern) {
        this.context.fillStyle = v;
    }

    public get fillColor(): string | CanvasGradient | CanvasPattern {
        return this.context.fillStyle;
    }



    public set lineWidth(v: number) {
        this.context.lineWidth = v;
    }

    public get lineWidth(): number {
        return this.context.lineWidth;
    }

}