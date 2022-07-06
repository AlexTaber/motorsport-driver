import Phaser from 'phaser';
import { useDistance } from '../services/distance.service';
import { GameScene } from '../game.scene';
import { useGameFactory } from '../game.factory';
import { InputNode, InputNodeParams, InputNodeType } from './input-node.model';
import { randomRange } from '@/utils/random';
import { InputNodesInputs, useInputNodesInputs } from './input-nodes.inputs';
import { CarInputState } from '../cars/car.model';

export class InputNodesScene extends Phaser.Scene {
  public nodes = [] as InputNode[];

  private inputManager!: InputNodesInputs;
  private gameScene!: GameScene;
  private lastInputState!: CarInputState;

  private nodesMarkedForDestruction = [] as InputNode[];
  private initialized = false;

  private get playerCar() {
    return this.gameScene.playerCar;
  }

  constructor() {
    super({ key: "InputNodesScene", active: true });
  }

  public create() {
    this.gameScene = useGameFactory().getScene();
    this.inputManager = useInputNodesInputs(this);

    this.gameScene.events.on("setupComplete", () => {
      this.initialized = true;
      this.lastInputState = this.gameScene.playerCar.inputs;
    });
  }

  public update() {
    if (this.initialized) {
      this.inputManager.update();
      this.updateNodes();
      this.cleanInputs();
    }
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

  private updateNodes() {
    if (this.playerCar.inputs.throttle && !this.lastInputState.throttle) {
      this.pushNode("throttle");
    }

    if (this.playerCar.inputs.brake && !this.lastInputState.brake) {
      this.pushNode("brake");
    }

    if (this.playerCar.inputs.steering && !this.lastInputState.steering) {
      this.pushNode("steer");
    }

    if (this.playerCar.inputs.correction && !this.lastInputState.correction) {
      this.pushNode("correction");
    }

    this.lastInputState = this.playerCar.inputs;

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

  private pushNode(type: InputNodeType) {
    const maxLife = 200 + (1500 * (1 - Math.max(this.playerCar.pace, 0.6)));
    this.nodes.push(new InputNode(type, maxLife, this));
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
        this.playerCar.incPace(0.02 * node.getModifiedPercentValue(2));
      }
      node.markForDestruction();
    } else {
      this.playerCar.incPace(-0.02);
    }
  }

  private onPlayerMistake() {
    if (!this.nodes.find(n => n.type === "correction")) {
      this.playerCar.mistake();

      const maxLife = randomRange(400, 1200);
      this.nodes.push(new InputNode("correction", maxLife, this));
    }
  }

  private onPlayerCrash() {
    this.playerCar.crashed = true;
  }
}
