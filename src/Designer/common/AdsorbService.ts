import { IVector2, Vector2 } from "../../Core/Vector2";
import { VectorDesigner } from "../VectorDesigner";
import { AnchorControl } from "../Views/AnchorControl";


export interface AdsorbResult {
    /**
     * x distance absolute value
     * no return null found
     */
    x: number;

    /**
     * y distance absolute value
     * no return null found
     */
    y: number;
}


export class AdsorbService {
    private designer: VectorDesigner;
    /**
     * 水平坐标
     */
    private horizontalTraces: number[];

    /**
     * 垂直坐标
     */
    private verticalTraces: number[];

    /**
     * 
     */
    public enabled: boolean;




    public constructor(designer: VectorDesigner) {
        this.designer = designer;
        this.horizontalTraces = [];
        this.verticalTraces = [];
        this.enabled = true;
    }


    /**
     * 更新所有锚点的坐标
     */
    public update() {
        if (!this.enabled) return;
        this.horizontalTraces.length = 0;
        this.verticalTraces.length = 0;
        for (let object of this.designer.children) {
            if (object instanceof AnchorControl) {
                this.horizontalTraces.push(object.point.x);
                this.verticalTraces.push(object.point.y);
            }
        }
        this.horizontalTraces = Array.from(new Set(this.horizontalTraces)).sort((a, b) => a - b);
        this.verticalTraces = Array.from(new Set(this.verticalTraces)).sort((a, b) => a - b);
    }



    /**
     * 
     */
    public clear() {
        this.horizontalTraces.length = 0;
        this.verticalTraces.length = 0;
    }

    /**
     * 二分查找近似值
     * @param datas 数据源
     * @param value 查找的近似值
     */
    public binarySearch(array: number[], targetNum: number): number {
        var min = 0;
        var max = array.length - 1;
        while (min != max) {
            var midIndex = Math.round((max + min) / 2);
            var mid = (max - min);
            if (targetNum === array[midIndex]) {
                return array[midIndex];
            }
            if (targetNum > array[midIndex]) {
                min = midIndex;
            } else {
                max = midIndex;
            }
            if (mid <= 2) {
                break;
            }
        }
        if (Math.abs(array[max] - targetNum) >= Math.abs(array[min] - targetNum)) {
            return array[min];
        }
        else {
            return array[max];
        }
    }



    /**
     * 吸附一个近似值
     * @param in_out_Point  要查找的坐标，最后返回
     * @param lessValue     小于范围
     * @param return        Vector2 (x,y) 返回 x,y轴坐标是否有修正
     */
    public adsorption(in_out_Point: Vector2, lessValue: number = 15): IVector2 {
        var result: IVector2 = { x: null, y: null };
        lessValue *= this.designer.res;
        var x = this.binarySearch(this.horizontalTraces, in_out_Point.x);
        var y = this.binarySearch(this.verticalTraces, in_out_Point.y);
        var x_dis = Math.abs(x - in_out_Point.x);
        if (x != null && x_dis <= lessValue) {
            in_out_Point.x = x;
            result.x = x_dis;
        }
        var y_dis = Math.abs(y - in_out_Point.y);
        if (y != null && y_dis <= lessValue) {
            in_out_Point.y = y;
            result.y = y_dis;
        }
        return result;
    }






}