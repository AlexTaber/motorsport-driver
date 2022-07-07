import { Car } from "./car.model";

export class CarAI {
  constructor(private car: Car) {
    this.car.pace = 0.6
    this.car.trackDistance = -20;
    this.car.currentSegmentDistance = this.car.trackDistance;
    this.car.object.setFillStyle(0x0335fc);
  }

  public update() {
    this.car.pace = Math.min(this.car.pace + 0.01, 0.83)
  }
}
