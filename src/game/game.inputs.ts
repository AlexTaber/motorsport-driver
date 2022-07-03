import { useGameFactory } from "./game.factory";

export function useGameInputs() {
  const scene = useGameFactory().getScene();
  
  const brake = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false);
  const throttle = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, false);
  const steer = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false);

  const increaseTargetPace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP, false);
  const decreaseTargetPace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN, false);

  const update = () => {
    if (Phaser.Input.Keyboard.JustDown(brake)) {
      scene.onBrake();
    } else if (Phaser.Input.Keyboard.JustDown(steer)) {
      scene.onSteer();
    } else if (Phaser.Input.Keyboard.JustDown(throttle)) {
      scene.onThrottle();
    }

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
