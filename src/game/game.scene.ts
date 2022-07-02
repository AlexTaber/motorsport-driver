import Phaser from 'phaser';
import { Car } from './cars/car.model';
import { useGameInputs } from './game.inputs';
import { InputNode, InputNodeType } from './input-nodes/input-node.model';
import { Track } from './tracks/track.model';
import { useDeltatime } from './utils/deltatime.service';

export class GameScene extends Phaser.Scene {
  private delta = useDeltatime();
  private inputManager: any;

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
    this.inputManager = useGameInputs();
    this.delta.reset();
  }

  public update() {
    this.inputManager.update();
    this.delta.update();
    this.updateCars();
    this.updateNodes();
    this.cleanInputs();
  }

  public onBrake() {
    this.onKeyPress("brake");
  }

  public onThrottle() {
    this.onKeyPress("throttle");
  }

  public onSteer() {
    this.onKeyPress("steer");
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

  private updateNodes() {
    const currentNode = this.track.nodes[this.track.nodeIndex];

    if (currentNode && currentNode.distance < this.playerCar.trackDistance) {
      const targetTime = 100 + (1000 * (1 - Math.max(this.playerCar.pace, 0.6)));

      this.nodes.push(new InputNode(currentNode.type, targetTime));
      this.track.nodeIndex ++;
    }

    this.nodes.forEach(n => {
      n.update()

      if (n.pastMaxLife) {
        this.playerCar.mistake();
        n.markForDestruction();
      };

      if (n.markedForDestruction) {
        this.nodesMarkedForDestruction.push(n);
      }
    });
  }

  private cleanInputs() {
    this.nodesMarkedForDestruction.forEach(n => {
      n.destroy();
      const index = this.nodes.findIndex(node => node.id === n.id);
      this.nodes.splice(index, 1);
    });

    this.nodesMarkedForDestruction = [];
  }

  private onKeyPress(type: InputNodeType) {
    const node = this.nodes.find(n => n.type === type);

    if (node) {
      this.playerCar.incPace(0.02 * node.getPercentRelativeToTargetWithModifier(2));
      node.markForDestruction();
    } else {
      this.playerCar.mistake();
    }
  }
}
