import { useDeltatime } from "@/game/services/deltatime.service";
import { useDistance } from "@/game/services/distance.service";
import { CarPart } from "../car-part.model";

export class Engine extends CarPart {
  public get accelerationRate() {
    return this.maxAccelerationRate * this.condition * this.performance;
  }

  private deltaService = useDeltatime();
  private distanceService = useDistance();

  private get maxAccelerationRate() {
    return (0.5 * this.distanceService.meter) * this.deltaService.elapsed.value;
  }
}
