import Phaser from 'phaser';
import { ref } from 'vue';
import { Car } from './cars/car.model';
import { useGameInputs } from './game.inputs';
import { InputNode, InputNodeType } from './input-nodes/input-node.model';
import { Track } from './tracks/track.model';
import { useDeltatime } from './services/deltatime.service';
import { usePublicApi } from './services/public-api.service';
import { randomRange } from '../utils/random';

export const scene = ref<GameScene | undefined>(undefined);

export class GameScene extends Phaser.Scene {
  public track!: Track;
  public cars!: Car[];
  public playerCar!: Car;
  public nodes = [] as InputNode[];

  private publicApi = usePublicApi();
  private delta = useDeltatime();
  private inputManager: any;

  private nodesMarkedForDestruction = [] as InputNode[];

  constructor() {
    super("GameScene");
  }

  public preload() {
    this.load.image("inputNode", "/assets/input-node.sprite.png");
  }

  public create() {
    scene.value = this;
    this.inputManager = useGameInputs();
    this.delta.reset();

    this.track = new Track();
    this.cars = [new Car()];
    this.playerCar = this.cars[0];
  }

  public update() {
    this.inputManager.update();
    this.delta.update();
    this.updateCars();
    this.updateNodes();
    this.cleanInputs();
    this.publicApi.updateFromGame(this);
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

  public onCorrection() {
    this.onKeyPress("correction");
  }

  public onIncreaseTargetPace() {
    this.playerCar.targetPace = Math.min(1, this.playerCar.targetPace + 0.025);
  }

  public onDecreaseTargetPace() {
    this.playerCar.targetPace = Math.max(0.6, this.playerCar.targetPace - 0.025);
  }

  private updateCars() {
    this.cars.forEach((car) => car.update());
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
        if (n.type === "correction") {
          this.onPlayerCrash();
        } else {
          this.onPlayerMistake();
        }

        n.markForDestruction();
      }

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
      if (node.type !== "correction") {
        this.playerCar.incPace(0.02 * node.getPercentRelativeToTargetWithModifier(2));
      }
      node.markForDestruction();
    } else {
      if (type !== "correction") {
        this.onPlayerMistake();
      }
    }
  }

  private onPlayerMistake() {
    if (!this.nodes.find(n => n.type === "correction")) {
      this.playerCar.mistake();

      const targetTime = randomRange(200, 600);
      this.nodes.push(new InputNode("correction", targetTime));
    }
  }

  private onPlayerCrash() {
    this.playerCar.crashed = true;
  }
}
