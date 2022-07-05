import { useDeltatime } from "@/game/services/deltatime.service";
import { CarPart } from "../car-part.model";

export class Brake extends CarPart {
  public get decelerationRate() {
    return this.maxDecelerationRate * this.condition * this.performance;
  }

  private deltaService = useDeltatime();

  private get maxDecelerationRate() {
    return 300 / this.deltaService.elapsed.value;
  }
}
