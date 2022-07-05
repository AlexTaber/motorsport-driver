import Phaser from 'phaser';
import { useDistance } from '../services/distance.service';
import { GameScene } from '../game.scene';
import { useGameFactory } from '../game.factory';
import { InputNode, InputNodeParams, InputNodeType } from './input-node.model';
import { randomInt, randomRange } from '@/utils/random';
import { sample } from 'lodash';
import { arrayLast } from '@/state/utils';
import { InputNodesInputs, useInputNodesInputs } from './input-nodes.inputs';

export class InputNodesScene extends Phaser.Scene {
  public nodes = [] as InputNode[];

  private inputManager!: InputNodesInputs;
  private gameScene!: GameScene;
  private distance = useDistance();

  private nodeParamsIndex = 0;
  private nodeParams = [] as InputNodeParams[];
  private nodesMarkedForDestruction = [] as InputNode[];

  private get track() {
    return this.gameScene.track;
  }

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
      this.generateRandomNodes();
    });

    this.gameScene.events.on("newLap", () => {
      this.nodeParamsIndex = 0;
    });
  }

  public update() {
    this.inputManager.update();
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

  public onCorrection() {
    this.onKeyPress("correction");
  }

  private generateRandomNodes() {
    let dis = this.distance.kilometer * 0.3;
    while(dis < this.track.distance) {
      dis += (this.distance.meter * 20) * sample([1, 2, 2, 2, 2, 4])!;
      this.nodeParams.push({
        type: sample(["brake", "throttle", "steer"].filter(i => i !== arrayLast(this.nodeParams)?.type)) as InputNodeType,
        distance: dis,
      });
    }
  }

  private updateNodes() {
    const currentNode = this.nodeParams[this.nodeParamsIndex];

    if (currentNode && currentNode.distance < this.playerCar.trackDistance) {
      const targetTime = 100 + (1000 * (1 - Math.max(this.playerCar.pace, 0.6)));

      this.nodes.push(new InputNode(currentNode.type, targetTime, this));
      this.nodeParamsIndex ++;
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
      this.nodes.push(new InputNode("correction", targetTime, this));
    }
  }

  private onPlayerCrash() {
    this.playerCar.crashed = true;
  }
}
