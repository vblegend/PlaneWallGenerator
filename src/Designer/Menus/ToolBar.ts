import { Vector2 } from '../../core/Vector2';
import { VectorDesigner } from '../VectorDesigner';
import { Control } from '../Views/Control';
import { AnchorControl } from '../Views/AnchorControl';
import { PolygonControl } from '../Views/PolygonControl';
import { Connector } from '../Views/Connector';






export class ToolBar {
    public dom: HTMLDivElement;
    private designer: VectorDesigner;
    public _visible: boolean;

    private btnConnectTo: HTMLButtonElement;
    private btnDelete: HTMLButtonElement;
    private btnSetting: HTMLButtonElement;

    public constructor(designer: VectorDesigner) {
        //   icon-delete2 icon-ATS
        //   icon-send
        //   icon-setting
        this.designer = designer;
        this.dom = document.createElement('div');
        this.dom.className = 'toolbar';

        this.btnConnectTo = this.createButton('icon-ATS');
        this.btnConnectTo.onclick = this.createObject.bind(this);
        this.dom.appendChild(this.btnConnectTo);
        this.btnDelete = this.createButton('icon-delete2');
        this.btnDelete.onclick = this.deleteObject.bind(this);
        this.dom.appendChild(this.btnDelete);

        this.btnSetting = this.createButton('icon-setting');
        this.btnSetting.onclick = this.settingObject.bind(this);
        this.dom.appendChild(this.btnSetting);


        this.designer.viewControl.onmove.add(() => {


        });

    }

    private createObject() {
        var origin = this.designer.selected;
        if (origin instanceof AnchorControl) {
            this.visible = false;

            var c = new Connector(this.designer,origin);




            

        }
    }


    private deleteObject() {
        this.visible = false;

    }

    private settingObject() {
        this.visible = false;

    }










    public setPosition(v: Vector2) {
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
            } else {
                this.btnConnectTo.style.display = 'none';
                this.btnDelete.style.display = '';
                this.btnSetting.style.display = '';
            }
        }


    }





    public dispose() {

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