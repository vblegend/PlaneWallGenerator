
import { IVector2, Vector2 } from '../../Core/Vector2';
import { Control, ControlDragEvent } from './Control';
import { VectorDesigner } from '../VectorDesigner';
import { RenderType } from '../Renderer';
import { CubePolygon, ElementCube } from '../../Core/Common';
import { MathHelper } from '../../Core/MathHelper';
import { Cube } from '../../Core/Cube';



export class CubeControl extends Control {
    private _cube: Cube;


    public constructor(designer: VectorDesigner, id: number, x: number, y: number, length: number, width: number, height: number) {
        super(designer);
        this.dragDelayTime = 50;
        this._cube = new Cube(id, x, y, length, width, height);
        this.strokeColor = '#FFFFFF';
        this.fillColor = '#888888';
        this.update();
    }

    public get position(): Vector2 {
        return this._cube.position;
    }
    public set position(value: Vector2) {
        this._cube.position = value;
        this.update();
    }

    public get length(): number {
        return this._cube.length;
    }
    public set length(value: number) {
        this._cube.length = value;
        this.update();
    }

    public get width(): number {
        return this._cube.width;
    }
    public set width(value: number) {
        this._cube.width = value;
        this.update();
    }

    public get height(): number {
        return this._cube.height;
    }
    public set height(value: number) {
        this._cube.height = value;
        this.update();
    }

    public get id(): number {
        return this._cube.id;
    }
    public set id(value: number) {
        this._cube.id = value;
    }

    protected onBeginDrag(e: ControlDragEvent) {
        this.designer.clearEvents();
        this.designer.grabObjects([this]);
        this.designer.updateElementPoints();
        this.designer.cursor.update(this.position);
        this.designer.requestRender();
    }

    protected onDraging(e: ControlDragEvent) {
        const viewPos = e.viewPos.sub(e.offset).round(4);
        const result: IVector2 = this.designer.adsorb.adsorption(viewPos);
        this.position.copy(viewPos);
        this.update();
        this.designer.cursor.update(this.position, result);
        this.designer.requestRender();
    }


    protected onEndDrag(e: ControlDragEvent) {
        const viewPos = e.viewPos.sub(e.offset).round(4);
        this.designer.adsorb.adsorption(viewPos);
        this.position.copy(viewPos);
        this.designer.cursor.update(null);
        this.designer.renderer.canvas.style.cursor = 'default';
        this.designer.releaseGrabObjects();
        this.designer.updateElementPoints();
        this.designer.dispatchEvents();
    }


    public update() {
        this._cube.update();
        this.designer.updateEvents(this);
        this.designer.requestRender();
    }

    public hit(point: Vector2): boolean {
        return point.inPolygon2(this._cube.vertices);
    }


    public selectedUpdate(value: boolean) {
        super.selectedUpdate(value);
        this.fillColor = value ? '#0078d7' : '#888888';
    }

    protected onClick() {
        this.designer.selected = this;
    }

    public render() {
        this.designer.renderer.opacity = this.opacity;
        this.designer.renderer.fillColor = this.isHover && !this.isSelected ? this.hoverColor : this.fillColor;
        this.designer.renderer.strokeColor = this.strokeColor;
        const pos = this.designer.convertArrayPoints(this._cube.vertices);
        this.designer.renderer.polygon(pos, true, RenderType.ALL);
        // let radius = Math.min(this.length, this.width) / 4 / this.designer.res;
        // if (radius > 5) {
        //     var pt = this.designer.convertPoint(this.position);
        //     this.designer.renderer.circle(pt.x, pt.y, 5, RenderType.ALL /* / this.designer.res */);
        // }
    }




    public onLoad() {
        super.onLoad();
        this.designer.updateEvents(this);
    }

    public onUnLoad() {
        super.onUnLoad();
        this.designer.updateEvents(this);
    }




    public toPolygon(relocation?: boolean): CubePolygon {
        const config = new CubePolygon();
        config.id = this.id;
        config.p = [0, 0];
        config.points = MathHelper.clone2Array(this._cube.vertices);
        config.h = this.height;
        if (relocation && config.points.length > 0) {
            config.p = MathHelper.getCenter(config.points);
            MathHelper.reLocation(config.points, config.p);
        }
        return config;
    }

    public serialize(): ElementCube {
        const clinder: ElementCube = {
            id: this.id,
            p: this.position.toArray(),
            x: this.length,
            y: this.height,
            z: this.width
        };
        return clinder;
    }


}