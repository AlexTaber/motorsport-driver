import { useGameFactory } from "../game.factory";
import { useDeltatime } from "../utils/deltatime.service";
import { useDistance } from "../utils/distance.service";

interface Lap {
  time: number;
}

export class Car {
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
    this.pace = Math.max(Math.min(this.targetPace, this.pace + amt), 0.6);
  }

  private addLap() {
    const now = Date.now();
    const interpolatedTimeRatio = (this.trackDistance - this.scene.track.distance) / this.speed;
    const interpolatedTime = (1 - interpolatedTimeRatio) * this.delta.elapsed.value;
    this.laps.push({ time: now - this.lapStart + interpolatedTime });
    this.lapStart = Date.now() - (this.delta.elapsed.value * interpolatedTimeRatio);
    console.log(this.laps);
  }
}
