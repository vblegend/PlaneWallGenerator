/**
 * 墙面2D位置信息
 */
export interface WallSegment {
    id: number;
    anchors: number[];
    thick: number;
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
}