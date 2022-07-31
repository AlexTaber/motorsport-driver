import { useDistance } from "../services/distance.service";
import { Car } from "./car.model";

export class CarBattle {
  public static distance = useDistance().meter * 5;

  public progress = 0;
  public outcome: "success" | "failed" | undefined;

  constructor(
    public attacker: Car,
    public defender: Car,
  ) {}

  public update() {
    let progress = this.attacker.pace - this.defender.pace;

    if (this.attacker.currentSegment.isCorner) {
      progress = Math.min(progress, progress * 0.5);
    }

    this.progress += progress;

    if (this.progress > 5) {
      this.outcome = "success";
    } else if (this.progress < -5) {
      this.outcome = "failed";
    }
  }
}
