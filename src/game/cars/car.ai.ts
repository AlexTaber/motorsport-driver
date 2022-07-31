import { randomRange } from "@/utils/random";
import { GameScene } from "../game.scene";
import { Car } from "./car.model";

export class CarAI {
  private pace = randomRange(0.75, 0.85);

  constructor(private car: Car, private scene: GameScene) {
    this.car.pace = 0.6
    this.car.object.setFillStyle(0x0335fc);
  }

  public update() {
    this.car.pace = Math.min(this.car.pace + 0.01, this.pace);
  }
}
