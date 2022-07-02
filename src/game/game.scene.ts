import Phaser from 'phaser';
import { useCanvas } from './canvas/canvas.service';
import { Car } from './cars/car.model';
import { InputNode } from './input-nodes/input-node.model';
import { useInputNodesFactory } from './input-nodes/input-nodes.factory';
import { Track } from './tracks/track.model';

export class GameScene extends Phaser.Scene {
  private deltatime = {
    last: 0,
    elapsed: 0,
  }
  private inputNodesFactory = useInputNodesFactory();
  private canvas = useCanvas();
  private track = new Track();
  private car = new Car();
  private nodes = [] as InputNode[];
  private nodesMarkedForDestruction = [] as InputNode[];

  constructor() {
    super("GameScene");
  }

  public preload() {
    this.load.image("inputNode", "/assets/input-node.sprite.png");
  }

  public create() {
    this.deltatime.last = Date.now();
  }

  public update() {
    const now = Date.now();
    this.deltatime.elapsed = (now - this.deltatime.last) / 1000;
    this.deltatime.last = now;
    this.car.distance += 15 * this.deltatime.elapsed;

    if (this.car.distance > this.track.distance) {
      this.car.distance -= this.track.distance;
      this.track.nodeIndex = 0;
    }

    const currentNode = this.track.nodes[this.track.nodeIndex];
    if (currentNode && currentNode.distance < this.car.distance) {
      this.nodes.push(this.inputNodesFactory.create(new Phaser.Math.Vector2(this.canvas.getCenter())));
      this.track.nodeIndex ++;
    }

    this.nodes.forEach(n => {
      n.update()
      if (n.destroyed) this.nodesMarkedForDestruction.push(n);
    });

    this.nodesMarkedForDestruction.forEach(n => {
      const index = this.nodes.findIndex(node => node.id === n.id);
      this.nodes.splice(index, 1);
    });

    this.nodesMarkedForDestruction = [];
  }
}
