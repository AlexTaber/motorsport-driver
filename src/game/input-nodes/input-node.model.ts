import { useGameFactory } from "../game.factory";

export class InputNode {
  public id = Math.random();
  public object: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  public created = Date.now();
  public destroyed = false;

  private scene = useGameFactory().getScene();

  constructor(
    private position: Phaser.Math.Vector2,
  ) {
    this.object = this.scene.physics.add.sprite(this.position.x, this.position.y, "inputNode");
    this.object.scale = 0;
  }

  public update() {
    this.object.setScale(this.object.scale + 0.015);

    if (Date.now() - this.created > 400) {
      this.object.destroy();
      this.destroyed = true;
    }
  }
}
