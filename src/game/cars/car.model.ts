import { uuid } from "../../utils/uuid";
import { useDeltatime } from "../services/deltatime.service";
import { useDistance } from "../services/distance.service";
import { randomRange } from "../../utils/random";
import { Engine } from "../car-parts/engines/engine.model";
import { Brake } from "../car-parts/brakes/brake.model";
import { GameScene } from "../game.scene";
import { TrackSegment } from "../track-segments/track-segment.model";
import { CarAI } from "./car.ai";
import { CarBattle } from "./car-battle.model";

interface Lap {
  time: number;
}

export interface CarInputState {
  throttle: boolean;
  brake?: number;
  steering: boolean;
  correction: boolean;
}

const defaultInputs: CarInputState = {
  throttle: false,
  brake: undefined,
  steering: false,
  correction: false,
}

export class Car {
  public id = uuid();
  public ai?: CarAI;
  public object: Phaser.GameObjects.Arc;
  public currentSegment: TrackSegment;
  public currentSegmentDistance = 0;
  public battle?: CarBattle;

  public engine = new Engine(0.7);
  public brakes = new Brake(0.7);

  public trackDistance = 0;
  public pace = 0.7;
  public speed = 0;
  public targetPace = 1;
  public mistakes = 0;
  public crashed = false;

  public inputs = { ...defaultInputs };

  public laps = [] as Lap[];

  private distanceService = useDistance();
  private delta = useDeltatime();
  private lapStart = Date.now();

  private get carAhead() {
    const index = this.scene.cars.findIndex(c => c.id === this.id);
    return this.scene.cars[(index + 1) % this.scene.cars.length];
  }

  private get distanceToCarAhead() {
    const distanceDiff = this.carAhead.trackDistance - this.trackDistance;
    return distanceDiff > 0 ? distanceDiff : this.scene.track.distance - distanceDiff;
  }

  private get nextSegment() {
    return this.scene.track.getNextSegment(this.currentSegment);
  }

  private get accelerationRate() {
    return this.engine.accelerationRate * this.pace;
  }

  private get decelerationRate() {
    return this.brakes.decelerationRate * this.pace;
  }

  constructor(private scene: GameScene, isPlayer = false) {
    this.object = scene.add.circle(0, 0, this.distanceService.meter * 4, 0xff0000);
    scene.cameras.main.zoom = 2;
    this.currentSegment = scene.track.segments[0];

    if (!isPlayer) {
      this.ai = new CarAI(this);
    }
  }

  public update() {
    this.inputs = { ...defaultInputs, brake: this.inputs.brake };
    this.updateSpeed();
    this.trackDistance += this.speed;
    this.currentSegmentDistance += this.speed;

    if (this.currentSegmentDistance > this.currentSegment.distance) {
      this.onNextSegment();
    }

    const battleDistance = this.distanceService.meter * 5;
    if (!this.battle && this.distanceToCarAhead < battleDistance && this.pace > this.carAhead.pace) {
      this.battle = { defender: this.carAhead, progress: 0 };
    } else if (this.battle) {
      let progress = this.pace - this.battle.defender.pace;
      if (this.currentSegment.isCorner) {
        progress = Math.min(progress, progress * 0.5);
      }

      this.battle.progress += progress;

      if (this.battle.progress > 5) {
        this.trackDistance += battleDistance;
        this.currentSegmentDistance += battleDistance;

        const newTrackDistance = this.trackDistance - battleDistance;
        const newTrackDistanceDiff = this.battle.defender.trackDistance - newTrackDistance;
        this.battle.defender.trackDistance = newTrackDistance;
        this.battle.defender.currentSegmentDistance -= newTrackDistanceDiff;
        this.battle.defender.pace -= 0.1;
        this.battle = undefined;
      } else if (this.battle.progress < -5) {
        this.speed = Math.min(this.speed, this.battle.defender.speed - (this.accelerationRate * 5))
        this.pace = Math.min(this.pace, this.battle.defender.pace - 0.1);
        this.battle = undefined;
      }
    }

    this.ai?.update();

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
      this.speed -= this.inputs.brake;
    } else if (this.shouldBrake()) {
      this.inputs.brake = this.decelerationRate;
      this.speed -= this.inputs.brake;
    } else {
      this.inputs.brake = undefined;

      if (this.currentSegment.isCorner) {
        this.speed = Math.min(
          this.currentSegment.getSpeedFromDistance(this.currentSegmentDistance) * this.pace,
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

    if (this.battle) {
      this.speed = this.battle.defender.speed;
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
      this.inputs.brake = undefined;
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
