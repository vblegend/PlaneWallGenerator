import { GroupWalls, WallPolygon } from "./Core/WallElement";
import { Anchor } from './Core/Anchor';
import { Segment } from "./Core/Segment";

export class WallPolygonParser {


    /**
     * 解析点数据成多边形数据
     * @param area 
     */
    public static parse(area: GroupWalls): WallPolygon[] {
        var result: WallPolygon[] = [];
        var anchors: { [key: number]: Anchor } = {};
        var walls: { [key: number]: Segment } = {};
        var heights: { [key: number]: number } = {};
        try {
            //parse anchors
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
                            object = new Segment(wall.id, from, to, wall.thick);
                            walls[wall.id] = object;
                            heights[wall.id] = wall.height;
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
                var polygon = new WallPolygon();
                polygon.id = wall.id;
                polygon.height = heights[wall.id];
                polygon.points = wall.points;
                result.push(polygon);
            }
            return result;
        }
        catch (e) {
            return null;
        } finally {
            anchors = {};
            walls = {};
            heights = {};
        }
    }

}