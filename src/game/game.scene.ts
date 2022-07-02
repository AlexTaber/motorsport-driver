import Phaser from 'phaser';
import { useCanvas } from './canvas/canvas.service';
import { Car } from './cars/car.model';
import { InputNode } from './input-nodes/input-node.model';
import { useInputNodesFactory } from './input-nodes/input-nodes.factory';
import { Track } from './tracks/track.model';
import { useDeltatime } from './utils/deltatime.service';

export class GameScene extends Phaser.Scene {
  private inputNodesFactory = useInputNodesFactory();
  private canvas = useCanvas();
  private delta = useDeltatime();

  private track = new Track();
  private cars = [new Car()];
  private playerCar = this.cars[0];
  private nodes = [] as InputNode[];
  private nodesMarkedForDestruction = [] as InputNode[];

  constructor() {
    super("GameScene");
  }

  public preload() {
    this.load.image("inputNode", "/assets/input-node.sprite.png");
  }

  public create() {
    this.delta.reset();
  }

  public update() {
    this.delta.update();
    this.updateCars();
    this.updatePlayerInputs();
    this.cleanInputs();
  }

  private updateCars() {
    this.cars.forEach((car) => {
      car.update();

      if (car.trackDistance > this.track.distance) {
        car.trackDistance -= this.track.distance;
        this.track.nodeIndex = 0;
      }
    });
  }

  private updatePlayerInputs() {
    const currentNode = this.track.nodes[this.track.nodeIndex];
    if (currentNode && currentNode.distance < this.playerCar.trackDistance) {
      this.nodes.push(this.inputNodesFactory.create(new Phaser.Math.Vector2(this.canvas.getCenter())));
      this.track.nodeIndex ++;
    }

    this.nodes.forEach(n => {
      n.update()
      if (n.destroyed) this.nodesMarkedForDestruction.push(n);
    });
  }

  private cleanInputs() {
    this.nodesMarkedForDestruction.forEach(n => {
      const index = this.nodes.findIndex(node => node.id === n.id);
      this.nodes.splice(index, 1);
    });

    this.nodesMarkedForDestruction = [];
  }
}
