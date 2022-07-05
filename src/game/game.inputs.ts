import { useGameFactory } from "./game.factory";
import { GameScene } from "./game.scene";

export type GameInputs = ReturnType<typeof useGameInputs>;

export function useGameInputs(scene: GameScene) {
  const increaseTargetPace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP, false);
  const decreaseTargetPace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN, false);

  const update = () => {
    if (Phaser.Input.Keyboard.JustDown(increaseTargetPace)) {
      scene.onIncreaseTargetPace();
    } else if (Phaser.Input.Keyboard.JustDown(decreaseTargetPace)) {
      scene.onDecreaseTargetPace();
    }
  }

  return {
    update
  }
}
