import { GroupWalls, WallPolygon, HolePolygon } from './Core/Common';
import { Anchor } from './Core/Anchor';
import { Wall } from "./Core/Wall";
import { Hole } from './Core/Hole';

export class WallPolygonParser {



    /**
     * 解析点数据成多边形数据
     * @param area 
     * @param relocation 是否重定位墙的初始坐标位置为墙中心，如果为否 强的 position始终为0
     */
    public static parse(area: GroupWalls, relocation?: boolean): WallPolygon[] {
        var result: WallPolygon[] = [];
        var anchors: { [key: number]: Anchor } = {};
        var walls: { [key: number]: Wall } = {};
        var heights: { [key: number]: number } = {};
        try {
            // parse anchors
            for (let anchor of area.anchors) {
                if (anchor && anchor.id && anchor.x && anchor.y && anchors[anchor.id] == null) {
                    anchors[anchor.id] = new Anchor(anchor.id, anchor.x, anchor.y);
                }
            }
            // parse walls
            for (let wall of area.walls) {
                if (wall && wall.id && wall.anchors && wall.anchors.length === 2) {
                    var object = walls[wall.id];
                    if (object == null) {
                        var from = anchors[wall.anchors[0]];
                        var to = anchors[wall.anchors[1]];
                        if (from && to) {
                            object = new Wall(wall.id, from, to, wall.thick);
                            walls[wall.id] = object;
                            heights[wall.id] = wall.height;

                            if (wall.holes && wall.holes.length > 0) {
                                for (let holeConfig of wall.holes) {
                                    let hole = new Hole();
                                    hole.id = holeConfig.id;
                                    hole.width = holeConfig.width;
                                    hole.height = holeConfig.height;
                                    hole.ground = holeConfig.ground;
                                    hole.location = holeConfig.location;
                                    // hole.thickness = holeConfig.thickness;
                                    object.addHole(hole);
                                }
                            }


                        }
                    }
                }
            }
            for (let key in anchors) {
                var anchor = anchors[key];
                if (anchor.targets.length > 0) {
                    anchors[key].build();
                }
            }
            for (let key in walls) {
                var wall = walls[key];
                wall.update();
                var config = new WallPolygon();
                config.id = wall.id;
                config.height = heights[wall.id];
                config.points = wall.points;
                config.position = [0, 0];
                config.holes = [];
                if (relocation) {
                    var center = this.getCenter(config.points);
                    config.position = this.reLocation(config.points, center);
                }
                // holes
                if (wall.holes.length > 0) {
                    for (let hole of wall.holes) {
                        let holepolygon = new HolePolygon();
                        holepolygon.id = hole.id;
                        holepolygon.position = [0, 0];
                        holepolygon.points = hole.points;
                        if (relocation) {
                            config.position = this.reLocation(holepolygon.points, config.position);
                        }
                        config.holes.push(holepolygon);
                    }
                }
                result.push(config);
            }
            return result;
        }
        catch (e) {
            throw e;
        } finally {
            anchors = {};
            walls = {};
            heights = {};
        }
    }



    private static reLocation(points: number[][], center: number[]): number[] {
        for (let i = 0; i < points.length; i++) {
            let point = points[i];
            point[0] += center[0];
            point[1] += center[1];
        }
        return center;
    }


    private static getCenter(points: number[][]): number[] {
        let left = points[0][0];
        let right = points[0][0];
        let top = points[0][1];
        let bottom = points[0][1];
        for (let i = 1; i < points.length; i++) {
            var point = points[i];
            if (point[0] > right) right = point[0];
            if (point[0] < left) left = point[0];
            if (point[1] > bottom) bottom = point[1];
            if (point[1] < top) top = point[1];
        }
        return [left + (right - left) / 2, top + (bottom - top) / 2];
    }




}