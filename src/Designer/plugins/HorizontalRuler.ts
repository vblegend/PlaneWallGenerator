import { Vector2 } from "../../Core/Vector2";
import { Renderer, HorizontalAlign, RenderType } from "../Renderer";
import { VectorDesigner } from "../VectorDesigner";


export class HorizontalRuler {
    private _canvas: HTMLCanvasElement;
    private designer: VectorDesigner;
    private _renderer: Renderer;

    private _cursorRenderer: Renderer;


    private _needUpdate: boolean;
    private _width: number;
    private _height: number;
    public constructor(designer: VectorDesigner, canvas: HTMLCanvasElement) {
        this.designer = designer;
        this._canvas = canvas;
        this._needUpdate = true;
        this._renderer = new Renderer(canvas);

        this._cursorRenderer = new Renderer();

        this.designer.onRender.add(this.render, this);
        this.designer.viewControl.onmove.add(() => {
            this._needUpdate = true;
        }, this);

        this.designer.onCursorChange.add(() => {
            this.renderCursor();
            this._needUpdate = true;
        }, this);


        this._canvas.oncontextmenu = (e) => {
            e.preventDefault();
        }

        this.resize();
    }



    private resize() {
        this._width = this._canvas.clientWidth;
        this._height = this._canvas.clientHeight;
        this._renderer.resize(this.width, this.height);
        this._cursorRenderer.resize(this.width, this.height);
    }


    private renderCursor() {
        this._cursorRenderer.clear();
        var designerlength = this.designer.bounds.right - this.designer.bounds.left;
        var position =this.designer.cursor.position;
        if (position.x >= this.designer.bounds.left && position.x <= this.designer.bounds.right) {
            this._cursorRenderer.fontSize = 16;
            var posx = (position.x - this.designer.bounds.left) / designerlength * this.width;
            var text = position.x.toFixed(4);
            var width = this._cursorRenderer.measureTextWidth(text) + this._cursorRenderer.fontSize;
            var left = posx - width / 2;
            var right = posx + width / 2;
            if (left < 0) {
                right -= left;
                left = 0;
            } else if (right > this.width) {
                let v = right - this.width;
                left -= v;
                right = this.width;
            }
            this._cursorRenderer.rectangle(left, this.height - 7 - this._cursorRenderer.fontSize, right - left, this._cursorRenderer.fontSize, RenderType.ALL);
            this._cursorRenderer.fillColor = '#ffffff'
            this._cursorRenderer.fillText(text, left + width / 2, this.height - 7 - this._cursorRenderer.fontSize, null, HorizontalAlign.CENTER)
            var paths: Vector2[] = [];
            paths.push(new Vector2(posx, this.height - 1));
            paths.push(new Vector2(posx - 5 < 0 ? 0 : posx - 5, this.height - 7));
            paths.push(new Vector2(posx + 5 > this.width ? this.width : posx + 5, this.height - 7));
            this._cursorRenderer.fillColor = '#333333'
            this._cursorRenderer.fillPath(paths, true);
        }
    }







    private render() {
        if (!this._needUpdate) return;
        this._needUpdate = false;
        var designerlength = this.designer.bounds.right - this.designer.bounds.left;
        var offset = this.designer.center.x % (designerlength / this.width * 100);
        this._renderer.strokeColor = '#ffffff';
        this._renderer.fillColor = '#ffffff';
        this._renderer.fontSize = 10;
        var center = this.width / 2;
        var offsetCenter = this.designer.center.x / this.designer.res;
        var offsetCalibration = offset / this.designer.res;
        var centeroffset = center - offsetCalibration;
        var pos = 0;
        var count = 0;
        this._renderer.clear();

        while (centeroffset + pos < this.width || centeroffset - pos > 0) {
            if (centeroffset + pos < this.width) {
                var pValue: number = null;
                if (count % 10 === 0) {
                    pValue = (offsetCenter - offsetCalibration + pos) * this.designer.res;
                    pValue = Number.parseFloat(pValue.toFixed(2));
                }
                this.drawCalibration(centeroffset + pos, pValue);
            }
            if (centeroffset - pos > 0) {
                var pValue: number = null;
                if (count % 10 === 0) {
                    pValue = (offsetCenter - offsetCalibration - pos) * this.designer.res;
                    pValue = Number.parseFloat(pValue.toFixed(2));
                }
                this.drawCalibration(centeroffset - pos, pValue);
            }
            pos += 10;
            count++;
        }

        /**
         * fixed triangle pointer
         */
        this._renderer.fillColor = '#333333'
        this._renderer.fillPath([new Vector2(center - 5, 0), new Vector2(center + 5, 0), new Vector2(center, 10)], true);
        this._renderer.strokeColor = '#aaaaaa'
        this._renderer.strokePath([new Vector2(center - 5, 0), new Vector2(center + 5, 0), new Vector2(center, 10)], true);


        if (this.designer.cursor.visible) {
            this._renderer.draw(this._cursorRenderer, 0, 0);
        }


    }

    /**
     * draw ruler calibration
     * @param x 
     * @param value 
     */
    private drawCalibration(x: number, value?: number) {
        var calibration = this.height / 3;
        if (value != null) {
            this._renderer.fillText(value.toString(), x, this.height * 0.65, null, HorizontalAlign.CENTER);
            calibration = this.height / 2;
        }
        this._renderer.line(x, 0, x, calibration, 1);
    }



    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

}