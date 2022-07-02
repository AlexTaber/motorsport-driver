import { InputNode } from "./input-node.model"

export function useInputNodesFactory() {
  const create = (position: Phaser.Math.Vector2) => {
    return new InputNode(position);
  }

  return {
    create,
  }
}
