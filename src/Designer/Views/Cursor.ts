import { IVector2, Vector2 } from "../../Core/Vector2";
import { VectorDesigner } from "../VectorDesigner";









export class Cursor {
    public position: Vector2;
    public horizontalLineColor: string;
    public verticalLineColor: string;
    private designer: VectorDesigner;
    private _visible: boolean;

    public constructor(designer: VectorDesigner) {
        this.designer = designer;
        this.position = new Vector2();
        this._visible = false;
        this.horizontalLineColor = '#00FF00';
        this.verticalLineColor = '#00FF00';
    }



    public update(v: Vector2, state?: IVector2) {
        this._visible = v != null;
        if (v) {
            this.position.copy(v);
        }
        else {
            this.designer.cursor.horizontalLineColor = '#00FF00';
            this.designer.cursor.verticalLineColor = '#00FF00';
        }
        if (state) {
            this.designer.cursor.horizontalLineColor = state.y != null ? '#0000FF' : '#00FF00';
            this.designer.cursor.verticalLineColor = state.x != null ? '#0000FF' : '#00FF00';
        }
        this.designer.onCursorChange.dispatch(this.position);
    }



    public render() {
        if (this._visible) {
            this.designer.renderer.opacity = 1;
            var position = this.designer.convertPoint(this.position);
            this.designer.renderer.strokeColor = this.horizontalLineColor;
            this.designer.renderer.line(0, position.y, this.designer.width, position.y, 1);
            this.designer.renderer.strokeColor = this.verticalLineColor;
            this.designer.renderer.line(position.x, 0, position.x, this.designer.height);
        }
    }


    public get visible(): boolean {
        return this._visible;
    }


}