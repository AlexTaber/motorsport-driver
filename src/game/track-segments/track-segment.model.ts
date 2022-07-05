import { uniqueId } from "lodash";
import { getPoint } from "../../utils/point";
import { useDistance } from "../services/distance.service";
import type { Track } from "../tracks/track.model";

export interface TrackSegmentParams {
  name: string;
  length: number;
  arc?: number;
  radius?: number;
  finish?: boolean;
  start?: boolean;
}

export class TrackSegment {
  public id = uniqueId();

  public distance = 0;
  public drawPosition: Phaser.Math.Vector2;
  public endPosition: { x: number, y: number, direction: number };

  public get isCorner() {
    return !!this.params.arc;
  }

  private distanceService = useDistance();

  private get directionOffset() {
    return 90 * this.directionModifier;
  }

  private get directionModifier() {
    return this.params.arc && this.params.arc > 0 ? 1 : -1;
  }

  constructor(
    public params: TrackSegmentParams,
    public position: Phaser.Math.Vector2,
    public direction: number,
    track: Track
  ) {
    this.drawPosition = new Phaser.Math.Vector2(this.position);

    if (this.isCorner) {
      this.drawPosition = new Phaser.Math.Vector2(getPoint(
        this.position,
        this.direction + this.directionOffset,
        this.params.radius! * this.distanceService.meter
      ));
      this.endPosition = {
        ...getPoint(
          this.drawPosition,
          this.direction - this.directionOffset + this.params.arc!,
          this.params.radius! * this.distanceService.meter
        ),
        direction: this.direction + this.params.arc!,
      };
    } else if (this.params.finish) {
      this.endPosition = { x: track.x, y: track.y, direction: track.direction };
    } else {
      this.endPosition = {
        ...getPoint(this.position, this.direction, this.params.length * this.distanceService.meter),
        direction: this.direction,
      };
    }

    this.setDistance();
  }

  public getPositionFromDistance(distance: number) {
    return this.isCorner ? this.getPositionFromDistanceCorner(distance) : this.getPositionFromDistanceStraight(distance);
  }

  private setDistance() {
    this.distance =
      this.isCorner
        ? Math.abs(Phaser.Math.DegToRad(this.params.arc!) * this.params.radius! * this.distanceService.meter)
        : Phaser.Math.Distance.BetweenPoints(this.position, this.endPosition);
	}

  private getPositionFromDistanceCorner(distance: number) {
    return this.drawPosition;
  }

  private getPositionFromDistanceStraight(distance: number) {
    return getPoint(this.position, this.direction, distance);
  }
}
