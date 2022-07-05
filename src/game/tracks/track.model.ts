import { useCanvas } from "../canvas/canvas.service";
import { GameScene } from "../game.scene";
import { TrackSegment, TrackSegmentParams } from "../track-segments/track-segment.model";
import { useTrackSpriteGenerator } from "./track-sprite-generator";

export class Track {
  private canvas = useCanvas();

  public x = this.canvas.getCenter().x;
  public y = this.canvas.getCenter().y;
  public direction = 0;
  public distance = 0;
  public segments = [] as TrackSegment[];

  private segmentData = [
		{
			name: "S1",
			length: 600,
			start: true,
		},
		{
			name: "T1",
			radius: 70,
			arc: 120,
		},
		{
			name: "S2",
			length: 140
		},
		{
			name: "T2",
			radius: 60,
			arc: 120
		},
		{
			name: "T3",
			radius: 30,
			arc: 60
		},
		{
			name: "S4",
			length: 100
		},
		{
			name: "T4",
			radius: 40,
			arc: -120
		},
		{
			name: "S5",
			length: 50
		},
		{
			name: "T5",
			radius: 40,
			arc: -80
		},
		{
			name: "T6",
			radius: 140,
			arc: 70
		},
		{
			name: "S7",
			length: 500
		},
		{
			name: "T7",
			radius: 15,
			arc: 170
		},
		{
			name: "S7",
			length: 10
		},
		{
			name: "S7",
			radius: 20,
			arc: -50
		},
		{
			name: "S8",
			length: 212
		},
		{
			name: "T8",
			radius: 20,
			arc: -70
		},
		{
			name: "T9",
			radius: 10,
			arc: 140
		},
		{
			name: "S11",
			finish: true,
		},
	] as TrackSegmentParams[];

  constructor() {
    this.generateSegments();
		this.setDistance();
  }

  public setSprite(scene: GameScene) {
    const sprite = useTrackSpriteGenerator(this, scene).generate();
  }

	public getNextSegment(segment: TrackSegment) {
		const index = this.segments.findIndex(s => s.id === segment.id);
		return this.segments[(index + 1) % this.segments.length];
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

	private setDistance() {
		this.distance = this.segments.reduce((d, s) => d + s.distance, 0);
	}
}
