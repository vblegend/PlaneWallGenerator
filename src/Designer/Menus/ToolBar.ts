import { Vector2 } from '../../core/Vector2';
import { VectorDesigner } from '../VectorDesigner';
import { Control } from '../Views/Control';
import { AnchorControl } from '../Views/AnchorControl';
import { PolygonControl } from '../Views/PolygonControl';
import { Connector } from '../common/Connector';
import { MouseCapturer } from '../Utility/MouseCapturer';






export class ToolBar {
    public dom: HTMLDivElement;
    private designer: VectorDesigner;
    private _visible: boolean;
    private btnConnectTo: HTMLButtonElement;
    private btnDelete: HTMLButtonElement;
    private btnSetting: HTMLButtonElement;
    private inputDiv: HTMLDivElement;
    private thicknessInput: HTMLInputElement;
    private _position: Vector2;
    private _dragCapture: MouseCapturer;
    private _dragPosition: Vector2;


    

    public constructor(designer: VectorDesigner) {
        this.designer = designer;
        this._position = new Vector2();
        this.dom = document.createElement('div');
        this.dom.className = 'toolbar';
        var btnDrag = this.createDragButton();
        this._dragCapture = new MouseCapturer(btnDrag);
        this._dragCapture.onMouseDown.add(this.drag_start, this);
        this._dragCapture.onMouseMove.add(this.drag_move, this);
        this._dragCapture.onMouseUp.add(this.drag_end, this);
        this.dom.appendChild(btnDrag);
        this.btnConnectTo = this.createButton('icon-ATS');
        this.btnConnectTo.title = '建立新的线段';
        this.btnConnectTo.onclick = this.createObject.bind(this);
        this.dom.appendChild(this.btnConnectTo);

        this.btnDelete = this.createButton('icon-delete2');
        this.btnDelete.title = '删除对象';
        this.btnDelete.onclick = this.deleteObject.bind(this);
        this.dom.appendChild(this.btnDelete);

        this.btnSetting = this.createButton('icon-setting');
        this.btnSetting.title = '设置(未设置)';
        this.btnSetting.onclick = this.settingObject.bind(this);
        this.dom.appendChild(this.btnSetting);
        this.visible = false;
        this.designer.viewControl.onmove.add(() => {
        });

        this.addBreak(this.dom);

        this.inputDiv = document.createElement('div');
        this.inputDiv.className = 'ToolBox-Input';
        var header = document.createElement('a');
        header.innerText = '厚度';
        header.style.float = 'left';
        this.thicknessInput = document.createElement('input');
        this.thicknessInput.type = 'number';
        this.thicknessInput.onchange = () => {
            var value = this.thicknessInput.value;
            if (value == null || value.length == 0) return;
            if (this.designer.selected instanceof PolygonControl) {
                this.designer.selected.updateThickness(Number.parseFloat(value));
            }
        }
        var setThickness = document.createElement('button');
        setThickness.textContent = '修改'

        this.inputDiv.appendChild(header);
        this.inputDiv.appendChild(this.thicknessInput);
        this.inputDiv.appendChild(setThickness);
        this.dom.appendChild(this.inputDiv);
        this.addBreak(this.dom);

    }

    private addBreak(parent:HTMLElement) {
        var hr = document.createElement('hr');
        hr.style.border = '0';
        hr.style.borderLeft = '1px solid #585858';
        hr.style.marginLeft = '2px';
        hr.style.marginRight = '2px';
        parent.appendChild(hr);
    }

    private createObject() {
        var origin = this.designer.selected;
        if (origin instanceof AnchorControl) {
            this.visible = false;
            this.designer.connector = new Connector(this.designer, origin);
        }
    }


    private deleteObject() {
        this.visible = false;
        var origin = this.designer.selected;
        origin.remove();
    }

    private settingObject() {
        //this.visible = false;
    }


    public get width(): number {
        return this.dom.clientWidth;
    }
    public get height(): number {
        return this.dom.clientHeight;
    }


    public setPosition(v: Vector2) {
        if (v.x < 0) v.x = 0;
        if (v.y < 0) v.y = 0;
        if (v.x + this.width > this.designer.width) v.x = this.designer.width - this.width;
        if (v.y + this.height > this.designer.height) v.y = this.designer.height - this.height;
        var offset = new Vector2(this.designer.container.offsetLeft, this.designer.container.offsetTop);
        this._position = v.clone();
        v = v.sub(offset);
        this.dom.style.marginLeft = v.x + 'px';
        this.dom.style.marginTop = v.y + 'px'
    }


    public get visible(): boolean {
        return this._visible;
    }

    public set visible(value: boolean) {
        this._visible = value;
        this.dom.style.display = value ? "" : "none";
        if (value) {
            if (this.designer.selected == null) return;
            if (this.designer.selected instanceof AnchorControl) {
                this.btnConnectTo.style.display = '';
                this.btnDelete.style.display = '';
                this.btnSetting.style.display = '';
                this.inputDiv.style.display = 'none';
            } else if (this.designer.selected instanceof PolygonControl) {
                this.btnConnectTo.style.display = 'none';
                this.btnDelete.style.display = '';
                this.btnSetting.style.display = '';
                this.inputDiv.style.display = '';
                this.thicknessInput.value = this.designer.selected.thickness.toString();
            }
        }
    }

    public dispose() {
        this._dragCapture.dispose();
    }

    /**
     * 
     * 
     * @param iconName 
     */

    private createDragButton(): HTMLElement {
        var button = document.createElement('div');
        button.style.height = '32px';
        button.style.width = '16px';
        button.style.backgroundColor = '#282828'
        button.style.cursor = 'move';
        return button;
    }

    private drag_start(e: MouseEvent) {
        this._dragPosition = new Vector2(e.pageX, e.pageY);
        this._dragCapture.capture();
    }

    private drag_move(e: MouseEvent) {
        if (this._dragPosition != null) {
            var pos = new Vector2(e.pageX, e.pageY);
            var vertor = pos.sub(this._dragPosition);
            var v = this._position.add(vertor);
            this.setPosition(v);
            this._dragPosition = pos;
        }
    }

    private drag_end(e: MouseEvent) {
        this._dragPosition = null;
        this._dragCapture.release();
    }


    private createButton(iconName: string): HTMLButtonElement {
        const icon = document.createElement('span');
        icon.classList.add('icon');
        icon.classList.add('iconfont');
        icon.classList.add(iconName);
        var button = document.createElement('button');
        button.className = 'Button';
        button.appendChild(icon);
        return button;
    }


}