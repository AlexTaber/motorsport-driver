import { sample } from "lodash";
import { arrayLast } from "../../state/utils";
import { randomRange, randomInt } from "../../utils/random";
import { InputNodeType } from "../input-nodes/input-node.model";
import { useDistance } from "../services/distance.service";
import { TrackSegment } from "../track-segments/track-segment.model";
import { useTrackSpriteGenerator } from "./track-sprite-generator";

interface InputNodeParams {
  type: InputNodeType;
  distance: number;
}

interface TrackSegmentParams {
  name: string;
  length: number;
  arc?: number;
}

export class Track {
  public x = 0;
  public y = 0;
  public direction = 0;

  private distanceService = useDistance();

  private segments = [] as TrackSegment[];
  private segmentInputs = [
    {
			name: "S1",
			length: 400
		},
		{
			name: "T1",
			radius: 120,
			arc: 180,
		},
		{
			name: "S2",
			length: 400,
		},
    {
			name: "T2",
			radius: 120,
			arc: 180,
		},
  ]

  public distance = randomRange(this.distanceService.kilometer * 0.6, this.distanceService.kilometer * 0.8);
  public nodeIndex = 0;
  public nodes = [] as InputNodeParams[];

  constructor() {
    const sprite = useTrackSpriteGenerator().generate(this);

    let dis = this.distanceService.kilometer * 0.1;
    while(dis < this.distance) {
      dis += (this.distanceService.meter * 2) * randomInt(3, 20);
      this.nodes.push({
        type: sample(["brake", "throttle", "steer"].filter(i => i !== arrayLast(this.nodes)?.type)) as InputNodeType,
        distance: dis,
      });
    }
  }

  private generateSegments() {
    // 
  }
}
