import { useDeltatime } from "@/game/services/deltatime.service";
import { useDistance } from "@/game/services/distance.service";
import { CarPart } from "../car-part.model";

export class Brake extends CarPart {
  public get decelerationRate() {
    return this.maxDecelerationRate * this.condition * this.performance;
  }

  private deltaService = useDeltatime();
  private distanceService = useDistance();

  private get maxDecelerationRate() {
    return (2 * this.distanceService.meter) * this.deltaService.elapsed.value;
  }
}
