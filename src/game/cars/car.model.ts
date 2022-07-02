import { useDeltatime } from "../utils/deltatime.service";
import { useDistance } from "../utils/distance.service";

export class Car {
  public trackDistance = 0;
  public pace = 0.7;
  public targetPace = 1;

  private distance = useDistance();
  private delta = useDeltatime();

  public update() {
    this.trackDistance += this.distance.kphToPixelsPerSecond(180 * this.pace) * this.delta.elapsed.value;
  }

  public incPace(amt: number) {
    this.pace = Math.max(Math.min(this.targetPace, this.pace + amt), 0.6);
    console.log(this.pace);
  }
}
