import { InputNodesScene } from "./input-nodes.scene";

export type InputNodesInputs = ReturnType<typeof useInputNodesInputs>;

export function useInputNodesInputs(scene: InputNodesScene) {
  const brake = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false);
  const throttle = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, false);
  const steer = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false);
  const correction = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, false);

  const update = () => {
    if (Phaser.Input.Keyboard.JustDown(brake)) {
      scene.onBrake();
    } else if (Phaser.Input.Keyboard.JustDown(steer)) {
      scene.onSteer();
    } else if (Phaser.Input.Keyboard.JustDown(throttle)) {
      scene.onThrottle();
    } else if (Phaser.Input.Keyboard.JustDown(correction)) {
      scene.onCorrection();
    }
  }

  return {
    update
  }
}
