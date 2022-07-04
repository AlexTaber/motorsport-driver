import { sample } from "lodash";
import { arrayLast } from "../../state/utils";
import { randomRange, randomInt } from "../../utils/random";
import { useCanvas } from "../canvas/canvas.service";
import { GameScene } from "../game.scene";
import { InputNodeType } from "../input-nodes/input-node.model";
import { useDistance } from "../services/distance.service";
import { TrackSegment, TrackSegmentParams } from "../track-segments/track-segment.model";
import { useTrackSpriteGenerator } from "./track-sprite-generator";

interface InputNodeParams {
  type: InputNodeType;
  distance: number;
}

export class Track {
  private distanceService = useDistance();
  private canvas = useCanvas();

  public x = this.canvas.getCenter().x;
  public y = this.canvas.getCenter().y;
  public direction = 0;
  public distance = 0;
  public segments = [] as TrackSegment[];

  private segmentData = [
    {
			name: "S1",
			length: 200
		},
		{
			name: "T1",
			radius: 80,
			arc: 180,
		},
		{
			name: "S2",
			length: 200,
		},
    {
			name: "T2",
			radius: 80,
			arc: 180,
		},
  ] as TrackSegmentParams[];

  public nodeIndex = 0;
  public nodes = [] as InputNodeParams[];

  constructor() {
    this.generateSegments();
    this.generateRandomNodes();
  }

  public setSprite(scene: GameScene) {
    const sprite = useTrackSpriteGenerator(this, scene).generate();
  }

  private generateSegments() {
    let position = {
      x: this.x,
      y: this.y,
      direction: this.direction,
    };

    this.segmentData.forEach((data) => {
      const segment = new TrackSegment(
        data,
        new Phaser.Math.Vector2({ x: position.x, y: position.y }),
        position.direction,
        this
      );
      this.segments.push(segment);
      position = { ...segment.endPosition, direction: segment.endPosition.direction };
      this.distance += segment.distance;
    });
  }

  private generateRandomNodes() {
    this.distance = this.distanceService.kilometer * 0.5;
    let dis = this.distanceService.kilometer * 0.1;
    while(dis < this.distance) {
      dis += (this.distanceService.meter * 2) * randomInt(2, 15);
      this.nodes.push({
        type: sample(["brake", "throttle", "steer"].filter(i => i !== arrayLast(this.nodes)?.type)) as InputNodeType,
        distance: dis,
      });
    }
  }
}
