import { useCanvas } from "../canvas/canvas.service";
import { InputNodesScene } from "./input-nodes.scene";

export type InputNodeType = "brake" | "throttle" | "gearUp" | "gearDown" | "steer" | "correction";

export interface InputNodeParams {
  type: InputNodeType;
  distance: number;
}

export class InputNode {
  public id = Math.random();
  public object: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  public created = Date.now();
  public markedForDestruction = false;

  public get pastMaxLife() {
    return this.life > this.maxLife
  }

  public get percentRelativeToTarget() {
    return 1 - (Math.abs(this.targetTime - this.life) / this.targetTime)
  }

  private canvas = useCanvas();

  private get life() {
    return Date.now() - this.created;
  }

  private get maxLife() {
    return this.targetTime * 2;
  }

  constructor(
    public type: InputNodeType,
    public targetTime: number,
    private scene: InputNodesScene
  ) {
    const position = this.getPosition();
    this.object = this.scene.physics.add.sprite(position.x, position.y, "inputNode");
    this.object.scale = 0;
    this.object.setTint(this.getTint());
  }

  public update() {
    this.setPosition(this.object.body.position.x, this.object.body.position.y - 2);
    this.object.setScale(Math.max(0, 0.5 * this.percentRelativeToTarget));
  }

  public markForDestruction() {
    this.markedForDestruction = true;
  }

  public destroy() {
    this.object.destroy();
  }

  public getPercentRelativeToTargetWithModifier(modifier: number) {
    return -(modifier * 0.5) + (this.percentRelativeToTarget * modifier);
  }

  public setPosition(x: number, y: number) {
    this.object.setPosition(
      x + this.object.body.width / 2,
      y + this.object.body.height / 2
    );
  }

  private getPosition() {
    const positionMap: Record<InputNodeType, any> = {
      brake: { x: this.canvas.getPercentageWidth(25) },
      throttle: { x: this.canvas.getPercentageWidth(75) },
      steer: {},
      gearDown: { x: this.canvas.getPercentageWidth(25) },
      gearUp: { x: this.canvas.getPercentageWidth(75) },
      correction: { y: this.canvas.getPercentageHeight(25) },
    };

    const position = {
      x: this.canvas.getCenter().x,
      y: this.canvas.getCenter().y,
      ...positionMap[this.type],
    };

    return new Phaser.Math.Vector2(position.x, position.y);
  }

  private getTint() {
    const tintMap: Record<InputNodeType, number> = {
      brake: 0xff0000,
      throttle: 0xff0000,
      steer: 0xff0000,
      gearDown: 0xff0000,
      gearUp: 0xff0000,
      correction: 0xff0000,
    }

    return tintMap[this.type];
  }
}
