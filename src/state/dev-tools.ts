import * as jsan from "jsan";
import { computed, ref } from "vue";

import { useStateRegistry } from "./registry";
import { arrayAdd } from "./utils";

interface WindowWithDevtools extends Window {
  __REDUX_DEVTOOLS_EXTENSION__?: {
    connect(options?: {
      name?: string;
      trace?: boolean;
      traceLimit?: number;
      serialize?: boolean;
    }): DevTools;
  };
}

interface DevTools {
  send(action: any, state: any): void;
  subscribe: any;
}

export interface DevToolsUpdatePayload {
  name: string;
  action: StateDevToolsAction;
  diff?: any;
  debugStore?: boolean;
}

const { registry } = useStateRegistry();

const isDispatching = ref(false);
const debugStoreIds = ref([] as string[]);

const debugState = computed(() =>
  debugStoreIds.value.reduce(
    (debugState, id) => ({
      ...debugState,
      [id]: registry.value[id as keyof typeof registry.value],
    }),
    {}
  )
);

const devtools = ((window as unknown) as WindowWithDevtools)?.__REDUX_DEVTOOLS_EXTENSION__?.connect(
  { trace: true, traceLimit: 25, serialize: true }
);

devtools?.subscribe((message: { type: string; state: any }) => {
  if (message.type === "DISPATCH" && message.state) {
    isDispatching.value = true;
    const parsedState = jsan.parse(message.state) as any;
    Object.keys(parsedState).forEach((storeId: string) =>
      Object.assign(registry.value[storeId], parsedState[storeId])
    );
    isDispatching.value = false;
  }
});

const debugAllStores = false;

export type StateDevToolsAction =
  | "init"
  | "update"
  | "reset"
  | "setProperty"
  | "add"
  | "prepend"
  | "set"
  | "concat"
  | "deduplicate"
  | "remove"
  | "setActive"
  | "setNextActive"
  | "setPreviousActive"
  | string;

export function useStoreDevTools() {
  function updateStore(payload: DevToolsUpdatePayload): void {
    checkUpdate(payload);
  }

  return {
    updateStore,
    isDispatching,
  };

  function checkUpdate(payload: DevToolsUpdatePayload): void {
    const { name, action, debugStore, diff } = payload;

    if (debugAllStores || debugStore) {
      checkAppendDebugStoreId(payload);
      send(name, action, diff);
    }
  }

  function checkAppendDebugStoreId(payload: DevToolsUpdatePayload) {
    if (payload.action === "init") {
      debugStoreIds.value = arrayAdd(debugStoreIds.value, payload.name);
    }
  }

  function send(name: string, action: StateDevToolsAction, diff: any): void {
    devtools?.send(
      { type: `${name}: ${action}`, value: diff },
      debugState.value
    );
  }
}
