import _ from "lodash";
import { reactive, toRefs, watch } from "vue";

import {
  DevToolsUpdatePayload,
  StateDevToolsAction,
  useStoreDevTools,
} from "./dev-tools";
import { useStateRegistry } from "./registry";
import {
  StoreSessionAdapter,
  StoreSessionOptionsInput,
  useStoreSessionAdapter,
} from "./store-session.adapter";

export interface StoreOptions {
  resettable?: boolean;
  storageConfig?: StoreSessionOptionsInput;
  debug?: boolean;
}

export type Store = ReturnType<typeof useStore>;

interface StoreAction<T = unknown> {
  name: StateDevToolsAction;
  diff?: T;
}

export function useStore<
  T extends Record<keyof T, T[keyof T]>,
  S extends StoreOptions = StoreOptions
>(name: string, initialState: T, optionsInput: S = {} as S) {
  const { registerState } = useStateRegistry();

  const {
    updateStore: updateDevToolsStore,
    isDispatching,
  } = useStoreDevTools();

  let lastAction: StoreAction = { name: "init" };
  let resetState: T | undefined = undefined;
  let sessionAdapter: StoreSessionAdapter<T> | undefined = undefined;

  const options = reactive(optionsInput);
  const state = registerState(name, initialState) as T;

  const stateRefs = toRefs(state);

  watch(state, () => checkSaveToSession(), {
    onTrigger: () => checkUpdateDevToolsStore(),
  });

  checkUpdateDevToolsStore();

  watch(options, () => configureFromOptions());

  configureFromOptions();

  function patch(payload: Partial<T>, actionName = "patch") {
    lastAction = { name: actionName, diff: payload };
    Object.assign(state, payload);
  }

  function mergeProperty<K extends keyof T>(
    key: K,
    diff: Partial<T[K]> & Record<string, unknown>,
    actionName?: StateDevToolsAction
  ): void {
    const existingState = state[key as keyof T];
    const updateDiff = {
      [key]: { ...existingState, ...(diff as Partial<T[K]>) },
    } as Partial<T>;
    patch(updateDiff, actionName);
  }

  function setter<K extends keyof T>(
    key: K,
    actionName?: StateDevToolsAction
  ): (value: T[K]) => void {
    return (value: T[K]): void => {
      const diff = {} as Partial<T>;
      diff[key as K] = value;
      patch(diff, actionName || `setter - ${String(key)}`);
    };
  }

  function reset(): void {
    resetState ? setResetState(resetState) : throwResettableErr();
  }

  function setResetState(resetState: T): void {
    patch(resetState, "reset");
  }

  function configureFromOptions() {
    resetState = resetState || getInitialState();
    sessionAdapter = getSessionAdapter();
    checkLoadFromSession();

    lastAction = { name: "configureOptions", diff: options };
    checkUpdateDevToolsStore();
  }

  function getInitialState(): T {
    return options.resettable ? (_.cloneDeep(state) as T) : ({} as T);
  }

  function checkSaveToSession() {
    if (sessionAdapter) {
      sessionAdapter.set(state);
    }
  }

  function checkUpdateDevToolsStore(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!isDispatching.value) {
      const payload: DevToolsUpdatePayload = {
        name,
        action: lastAction.name,
        diff: lastAction.diff,
        debugStore: options.debug,
      };
      updateDevToolsStore(payload);
    }

    lastAction = { name: "set" };
  }

  function getSessionAdapter(): StoreSessionAdapter<T> | undefined {
    return options.storageConfig
      ? useStoreSessionAdapter<T>(options.storageConfig)
      : undefined;
  }

  function checkLoadFromSession(): void {
    const state = sessionAdapter?.get();
    if (state) {
      patch(state, "loadFromSession");
    }
  }

  function throwResettableErr(): void {
    throw "Store is not resettable";
  }

  return {
    get $state() {
      return state;
    },
    set $state(v: T) {
      patch(v);
    },
    get $options() {
      return options as S & StoreOptions;
    },
    ...stateRefs,
    _resetState: resetState,
    patch,
    mergeProperty,
    setter,
    reset,
  };
}
