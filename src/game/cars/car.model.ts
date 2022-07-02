import { useDeltatime } from "../utils/deltatime.service";
import { useDistance } from "../utils/distance.service";

export class Car {
  public trackDistance = 0;

  private distance = useDistance();
  private delta = useDeltatime();

  public update() {
    this.trackDistance += this.distance.kphToPixelsPerSecond(180) * this.delta.elapsed.value;
  }
}
