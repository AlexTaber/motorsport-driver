import { uuid } from "../../utils/uuid";
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

export interface CarInputState {
  throttle: boolean;
  brake: boolean;
  steering: boolean;
  correction: boolean;
}

const defaultInputs: CarInputState = {
  throttle: false,
  brake: false,
  steering: false,
  correction: false,
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
  public speed = 0;
  public targetPace = 0.7;
  public mistakes = 0;
  public crashed = false;

  public inputs = { ...defaultInputs };

  public laps = [] as Lap[];

  private distance = useDistance();
  private delta = useDeltatime();
  private lapStart = Date.now();

  private get nextSegment() {
    return this.scene.track.getNextSegment(this.currentSegment);
  }

  private get accelerationRate() {
    return this.engine.accelerationRate * this.pace;
  }

  private get decelerationRate() {
    return this.brakes.decelerationRate * this.pace;
  }

  constructor(private scene: GameScene) {
    this.object = scene.add.circle(0, 0, this.distance.meter * 4, 0xff0000);
    scene.cameras.main.startFollow(this.object);
    scene.cameras.main.zoom = 2;
    this.currentSegment = scene.track.segments[0];
  }

  public update() {
    this.inputs = { ...defaultInputs, brake: this.inputs.brake };
    this.updateSpeed();
    this.trackDistance += this.speed;
    this.currentSegmentDistance += this.speed;

    if (this.currentSegmentDistance > this.currentSegment.distance) {
      this.onNextSegment();
    }

    this.updatePosition();
  }

  public mistake() {
    this.mistakes ++;
    this.incPace(-0.1);
    this.inputs.correction = true;
  }

  public incPace(amt: number) {
    const randomizedTargetPace = this.targetPace - randomRange(0, 0.02);
    this.pace = Math.max(Math.min(randomizedTargetPace, this.pace + amt), 0.6);
  }

  private updateSpeed() {
    if (this.inputs.brake) {
      this.speed -= this.decelerationRate;
    } else if (this.shouldBrake()) {
      this.speed -= this.decelerationRate;
      this.inputs.brake = true;
    } else {
      this.inputs.brake = false;

      if (this.currentSegment.isCorner) {
        this.speed = Math.min(
          this.currentSegment.getSpeedFromDistance(this.currentSegmentDistance),
          this.speed + this.accelerationRate,
        );

        if (this.currentSegmentDistance > this.currentSegment.distance * 0.5) {
          this.inputs.throttle = true;
        }
      } else {
        this.speed += this.accelerationRate;
        this.inputs.throttle = true;
      }
    }
  }

  private shouldBrake() {
    const requiredBrakingDistance = (Math.pow(this.nextSegment.entrySpeed, 2) - Math.pow(this.speed, 2)) / (-this.decelerationRate * 2);
    const distanceToNextSegment = this.currentSegment.distance - this.currentSegmentDistance;
    return requiredBrakingDistance > distanceToNextSegment;
  }

  private updatePosition() {
    const newPosition = this.currentSegment.getPositionFromDistance(this.currentSegmentDistance);
    this.object.setPosition(newPosition.x, newPosition.y);
  }

  private onNextSegment() {
    this.currentSegmentDistance -= this.currentSegment.distance;
    this.currentSegment = this.nextSegment;

    if (this.currentSegment.params.start) {
      this.onNextLap();
    }

    if (this.currentSegment.isCorner) {
      this.inputs.steering = true;
      this.inputs.brake = false;
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
