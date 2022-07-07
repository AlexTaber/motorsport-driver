import Phaser from 'phaser';
import { ref } from 'vue';
import { Car } from './cars/car.model';
import { GameInputs, useGameInputs } from './game.inputs';
import { InputNode } from './input-nodes/input-node.model';
import { Track } from './tracks/track.model';
import { useDeltatime } from './services/deltatime.service';
import { usePublicApi } from './services/public-api.service';

export const scene = ref<GameScene | undefined>(undefined);

export class GameScene extends Phaser.Scene {
  public track!: Track;
  public cars!: Car[];
  public playerCar!: Car;
  public nodes = [] as InputNode[];

  private publicApi = usePublicApi();
  private delta = useDeltatime();
  private inputManager!: GameInputs;

  constructor() {
    super("GameScene");
  }

  public preload() {
    this.load.image("inputNode", "/assets/input-node.sprite.png");
  }

  public create() {
    scene.value = this;
    this.inputManager = useGameInputs(this);
    this.track = new Track();
    this.cars = [new Car(this, true), new Car(this)];
    this.playerCar = this.cars[0];
    this.cameras.main.startFollow(this.playerCar.object);

    this.track.setSprite(this);
    this.events.emit("setupComplete");
  }

  public update(time: number, delta: number) {
    this.cars.sort((c1, c2) => c1.trackDistance < c2.trackDistance ? 1 : -1);
    this.delta.update(delta);
    this.inputManager.update();
    this.updateCars();
    this.publicApi.updateFromGame(this);
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
}
