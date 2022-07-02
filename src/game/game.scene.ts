import Phaser from 'phaser';
import { useCanvas } from './canvas/canvas.service';
import { useInputNodesFactory } from './input-nodes/input-nodes.factory';

export class GameScene extends Phaser.Scene {
  private inputNodesFactory = useInputNodesFactory();
  private canvas = useCanvas();

  constructor() {
    super("GameScene");
  }

  public preload() {
    this.load.image("inputNode", "/assets/input-node.sprite.png");
  }

  public create() {
    this.inputNodesFactory.create(new Phaser.Math.Vector2(this.canvas.getCenter()));
  }

  public update() {}
}
