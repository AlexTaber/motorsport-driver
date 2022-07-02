import { useGameFactory } from "../game.factory";

export class InputNode {
  public object: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  private scene = useGameFactory().getScene();

  constructor(
    private position: Phaser.Math.Vector2,
  ) {
    this.object = this.scene.physics.add.sprite(this.position.x, this.position.y, "inputNode");
  }
}
