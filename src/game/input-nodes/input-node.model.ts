import { useCanvas } from "../canvas/canvas.service";
import { useGameFactory } from "../game.factory";

export type InputNodeType = "brake" | "throttle" | "gearUp" | "gearDown" | "steer";

export class InputNode {
  public id = Math.random();
  public object: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  public created = Date.now();
  public markedForDestruction = false;

  private maxLife = 400;
  private scene = useGameFactory().getScene();
  private canvas = useCanvas();

  constructor(
    public type: InputNodeType,
  ) {
    const position = this.getPosition();
    this.object = this.scene.physics.add.sprite(position.x, position.y, "inputNode");
    this.object.scale = 0;
  }

  public update() {
    const life = Date.now() - this.created;
    const halfMaxLife = this.maxLife * 0.5;
    this.object.setScale(0.4 * (1 - (Math.abs(halfMaxLife - life) / halfMaxLife)));

    if (life > this.maxLife) {
      this.markedForDestruction = true;
    }
  }

  public markForDestruction() {
    this.markedForDestruction = true;
  }

  public destroy() {
    this.object.destroy();
  }

  private getPosition() {
    const xPostionMap: Record<InputNodeType, number> = {
      brake: this.canvas.getPercentageWidth(25),
      throttle: this.canvas.getPercentageWidth(75),
      steer: this.canvas.getPercentageWidth(50),
      gearDown: this.canvas.getPercentageWidth(25),
      gearUp: this.canvas.getPercentageWidth(75),
    };

    return new Phaser.Math.Vector2(xPostionMap[this.type], this.canvas.getCenter().y);
  }
}
