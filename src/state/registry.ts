import { reactive, ref } from "vue";

import { StateTree } from "./types";

const registry = ref({} as Record<string, StateTree>);

export function useStateRegistry() {
  function registerState<T extends StateTree>(name: string, state: T) {
    const reactiveState = reactive(state);
    registry.value[name] = reactiveState;
    return reactiveState;
  }

  return {
    registry,
    registerState,
  };
}
