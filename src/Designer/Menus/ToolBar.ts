import { Vector2 } from '../../Core/Vector2';
import { VectorDesigner } from '../VectorDesigner';
import { Control } from '../Views/Control';
import { AnchorControl } from '../Views/AnchorControl';
import { PolygonControl } from '../Views/PolygonControl';
import { Connector } from '../Common/Connector';
import { MouseCapturer } from '../Utility/MouseCapturer';






export class ToolBar {
    public dom: HTMLDivElement;
    private designer: VectorDesigner;
    private _visible: boolean;
    private btnConnectTo: HTMLButtonElement;
    private btnDelete: HTMLButtonElement;
    private btnSetting: HTMLButtonElement;
    private thicknessDiv: HTMLDivElement;
    private thicknessInput: HTMLInputElement;
    private xInput: HTMLInputElement;
    private yInput: HTMLInputElement;
    private _position: Vector2;
    private _dragCapture: MouseCapturer;
    private _dragPosition: Vector2;
    private positionDiv: HTMLDivElement;

    private heightDiv: HTMLDivElement;
    private heightInput: HTMLInputElement;



    public constructor(designer: VectorDesigner) {
        this.designer = designer;
        this._position = new Vector2();
        this.dom = document.createElement('div');

        this.dom.oncontextmenu = (e: MouseEvent) => {
            e.preventDefault();
        }

        this.dom.className = 'designer-toolbar';
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

        this.thicknessDiv = document.createElement('div');
        this.thicknessDiv.className = 'designer-toolbar-block';
        var header = document.createElement('a');
        header.innerText = '厚度';
        // header.style.float = 'left';
        this.thicknessInput = document.createElement('input');
        this.thicknessInput.type = 'number';
        this.thicknessInput.onchange = () => {
            var value = this.thicknessInput.value;
            if (value == null || value.length == 0) return;
            if (this.designer.selected instanceof PolygonControl) {
                this.designer.selected.updateThickness(Number.parseFloat(value));
                this.designer.requestRender();
            }
        }
        var setThickness = document.createElement('button');
        setThickness.textContent = '修改'

        this.thicknessDiv.appendChild(header);
        this.thicknessDiv.appendChild(this.thicknessInput);
        this.thicknessDiv.appendChild(setThickness);
        this.dom.appendChild(this.thicknessDiv);






        this.addBreak(this.dom);





        this.heightDiv = document.createElement('div');
        this.heightDiv.className = 'designer-toolbar-block';
        var header = document.createElement('a');
        header.innerText = '高度';
        // header.style.float = 'left';
        this.heightInput = document.createElement('input');
        this.heightInput.type = 'number';
        this.heightInput.onchange = () => {
            var value = this.heightInput.value;
            if (value == null || value.length == 0) return;
            if (this.designer.selected instanceof PolygonControl) {
                this.designer.selected.height = Number.parseFloat(value);
            }
        }
        var setThickness = document.createElement('button');
        setThickness.textContent = '修改'

        this.heightDiv.appendChild(header);
        this.heightDiv.appendChild(this.heightInput);
        this.heightDiv.appendChild(setThickness);
        this.dom.appendChild(this.heightDiv);















        this.positionDiv = document.createElement('div');
        this.positionDiv.className = 'designer-toolbar-block';

        var header = document.createElement('a');
        header.innerText = 'x';
        // header.style.float = 'left';
        this.positionDiv.appendChild(header);


        this.xInput = document.createElement('input');
        this.xInput.type = 'number';
        this.xInput.onchange = () => {
            var value = this.xInput.value;
            if (value == null || value.length == 0) return;
            if (this.designer.selected instanceof AnchorControl) {
                var position = this.designer.selected.position.clone();
                position.x = Number.parseFloat(value);
                this.designer.selected.setPosition(position);
                this.designer.requestRender();
            }
        }
        this.positionDiv.appendChild(this.xInput);
        this.yInput = document.createElement('input');
        this.yInput.type = 'number';
        this.yInput.onchange = () => {
            var value = this.yInput.value;
            if (value == null || value.length == 0) return;
            if (this.designer.selected instanceof AnchorControl) {
                var position = this.designer.selected.position.clone();
                position.y = Number.parseFloat(value);
                this.designer.selected.setPosition(position);
                this.designer.requestRender();
            }
        }
        this.positionDiv.appendChild(this.yInput);
        var setPosition = document.createElement('button');
        setPosition.textContent = '修改'

        this.positionDiv.appendChild(setPosition);
        this.dom.appendChild(this.positionDiv);
        this.addBreak(this.dom);




    }

    private addBreak(parent: HTMLElement) {
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
                this.thicknessDiv.style.display = 'none';
                this.heightDiv.style.display = 'none';
                this.positionDiv.style.display = '';
                this.xInput.value = this.designer.selected.anchor.x.toString();
                this.yInput.value = this.designer.selected.anchor.y.toString();





            } else if (this.designer.selected instanceof PolygonControl) {
                this.btnConnectTo.style.display = 'none';
                this.btnDelete.style.display = '';
                this.btnSetting.style.display = '';
                this.thicknessDiv.style.display = '';
                this.positionDiv.style.display = 'none';
                this.thicknessInput.value = this.designer.selected.thickness.toString();
                this.heightDiv.style.display = '';
                this.heightInput.value = this.designer.selected.height.toString();

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
        button.className = 'dragbutton';
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="10px" height="20px"  style="margin-top: 6px;cursor: move;" viewBox="0 0 5 14" ><path fill-rule="evenodd" d="M1 2a1 1 0 110-2 1 1 0 010 2zm3 0a1 1 0 110-2 1 1 0 010 2zM1 6a1 1 0 110-2 1 1 0 010 2zm3 0a1 1 0 110-2 1 1 0 010 2zm-3 4a1 1 0 110-2 1 1 0 010 2zm3 0a1 1 0 110-2 1 1 0 010 2zm-3 4a1 1 0 110-2 1 1 0 010 2zm3 0a1 1 0 110-2 1 1 0 010 2z"></path></svg>';
        return button;
    }

    private drag_start(e: MouseEvent) {
        var offset = new Vector2(this.designer.container.offsetLeft, this.designer.container.offsetTop);
        this._dragPosition = new Vector2(e.pageX, e.pageY).sub(offset).sub(this._position);
        this._dragCapture.capture();
        e.preventDefault();
    }

    private drag_move(e: MouseEvent) {
        if (this._dragPosition != null) {
            var offset = new Vector2(this.designer.container.offsetLeft, this.designer.container.offsetTop);
            var pos = new Vector2(e.pageX, e.pageY).sub(offset).sub(this._dragPosition);
            this.setPosition(pos);
            e.preventDefault();
        }
    }

    private drag_end(e: MouseEvent) {
        this._dragPosition = null;
        this._dragCapture.release();
        e.preventDefault();
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