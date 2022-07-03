import { uuid } from "../../utils/uuid";
import { useGameFactory } from "../game.factory";
import { useDeltatime } from "../services/deltatime.service";
import { useDistance } from "../services/distance.service";
import { randomRange } from "../../utils/random";

interface Lap {
  time: number;
}

export class Car {
  public id = uuid();
  public trackDistance = 0;
  public pace = 0.7;
  public targetPace = 1;
  public mistakes = 0;
  public lastMistake = 0;
  public laps = [] as Lap[];

  public get speed() {
    return 180 * this.pace;
  }

  private distance = useDistance();
  private delta = useDeltatime();
  private lapStart = Date.now();

  private scene = useGameFactory().getScene();

  public update() {
    this.trackDistance += this.distance.kphToPixelsPerSecond(this.speed) * this.delta.elapsed.value;

    if (this.trackDistance > this.scene.track.distance) {
      this.addLap();
      this.trackDistance -= this.scene.track.distance;
      this.scene.track.nodeIndex = 0;
    }
  }

  public mistake() {
    if (Date.now() - this.lastMistake > 50) {
      this.mistakes ++;
      this.incPace(-0.1);
      this.lastMistake = Date.now();
    }
  }

  public incPace(amt: number) {
    const randomizedTargetPace = this.targetPace - randomRange(0, 0.05);
    this.pace = Math.max(Math.min(randomizedTargetPace, this.pace + amt), 0.6);
  }

  private addLap() {
    const now = Date.now();
    const interpolatedTimeRatio = (this.trackDistance - this.scene.track.distance) / this.speed;
    const interpolatedTime = (1 - interpolatedTimeRatio) * this.delta.elapsed.value;
    this.laps.push({ time: now - this.lapStart + interpolatedTime });
    this.lapStart = Date.now() - (this.delta.elapsed.value * interpolatedTimeRatio);
  }
}
