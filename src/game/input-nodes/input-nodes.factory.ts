import { InputNode, InputNodeType } from "./input-node.model"

export function useInputNodesFactory() {
  const create = (type: InputNodeType) => {
    return new InputNode(type);
  }

  return {
    create,
  }
}
