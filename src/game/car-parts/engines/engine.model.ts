import { useDeltatime } from "@/game/services/deltatime.service";
import { CarPart } from "../car-part.model";

export class Engine extends CarPart {
  public get accelerationRate() {
    return this.maxAccelerationRate * this.condition * this.performance;
  }

  private deltaService = useDeltatime();

  private get maxAccelerationRate() {
    return 100 / this.deltaService.elapsed.value;
  }
}
