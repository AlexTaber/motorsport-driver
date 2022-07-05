import { uuid } from "../../utils/uuid";
import { useGameFactory } from "../game.factory";
import { useDeltatime } from "../services/deltatime.service";
import { useDistance } from "../services/distance.service";
import { randomRange } from "../../utils/random";
import { Engine } from "../car-parts/engines/engine.model";
import { Brake } from "../car-parts/brakes/brake.model";
import { GameScene } from "../game.scene";
import { TrackSegment } from "../track-segments/track-segment.model";

interface Lap {
  time: number;
}

export class Car {
  public id = uuid();
  public object: Phaser.GameObjects.Arc;
  public currentSegment: TrackSegment;
  public currentSegmentDistance = 0;

  public engine = new Engine(0.7);
  public brakes = new Brake(0.7);

  public trackDistance = 0;
  public pace = 0.7;
  public targetPace = 0.7;
  public mistakes = 0;
  public crashed = false;

  public laps = [] as Lap[];

  public get speed() {
    // return this.crashed ? 0 : 800 * this.pace;
    return 600 * this.pace;
  }

  private distance = useDistance();
  private delta = useDeltatime();
  private lapStart = Date.now();

  constructor(private scene: GameScene) {
    this.object = scene.add.circle(0, 0, this.distance.meter * 4, 0xff0000);
    scene.cameras.main.startFollow(this.object);
    this.currentSegment = scene.track.segments[0];
  }

  public update() {
    const dis = this.distance.kphToPixelsPerSecond(this.speed) * this.delta.elapsed.value;
    this.trackDistance += dis;
    this.currentSegmentDistance += dis;

    if (this.currentSegmentDistance > this.currentSegment.distance) {
      this.onNextSegment();
    }

    this.updatePosition();
  }

  public mistake() {
    this.mistakes ++;
    this.incPace(-0.1);
  }

  public incPace(amt: number) {
    const randomizedTargetPace = this.targetPace - randomRange(0, 0.02);
    this.pace = Math.max(Math.min(randomizedTargetPace, this.pace + amt), 0.6);
  }

  private updatePosition() {
    const newPosition = this.currentSegment.getPositionFromDistance(this.currentSegmentDistance);
    this.object.setPosition(newPosition.x, newPosition.y);
  }

  private onNextSegment() {
    this.currentSegmentDistance -= this.currentSegment.distance;
    this.currentSegment = this.scene.track.getNextSegment(this.currentSegment);

    if (this.currentSegment.params.start) {
      this.onNextLap();
    }
  }

  private onNextLap() {
    this.addLap();
    this.trackDistance = this.currentSegmentDistance;
    this.scene.events.emit("newLap");
  }

  private addLap() {
    const now = Date.now();
    const interpolatedTimeRatio = (this.trackDistance - this.scene.track.distance) / this.speed;
    const interpolatedTime = (1 - interpolatedTimeRatio) * this.delta.elapsed.value;
    this.laps.push({ time: now - this.lapStart + interpolatedTime });
    this.lapStart = Date.now() - (this.delta.elapsed.value * interpolatedTimeRatio);
  }
}
