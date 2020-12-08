/**
 * 墙面2D位置信息
 */
export interface WallSegment {
    id: number;
    anchors: number[];
    thick: number;
    height: number;
    holes: WallHole[],
}


export interface WallHole {
    id:number;
    /* 洞的宽度 */
    width: number;

    /* 洞的位置 */
    location: number;

    /* 墙的角度 */
   // angle: number;

    /* 离地高度 */
    ground:number;
    /* 洞的高度 3D属性 */
    height: number;
}




/**
 * 锚点信息
 */
export interface AnchorPoint {
    id: number;
    x: number;
    y: number;
}


export interface GroupWalls {
    anchors: AnchorPoint[];
    walls: WallSegment[];
}



/**
 * 每面墙的多边形数据
 */
export class WallPolygon {
    public id: number;
    public height: number;
    public points: number[][];
    public position: number[];
    public holes:HolePolygon[];
}


export class HolePolygon {
    public id: number;
    public position: number[];
    public points: number[][];
    public height: number;
    /* 离地高度 */
    public ground: number;
}