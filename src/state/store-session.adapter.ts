export interface StoreSessionAdapter<T> {
  set(state: T): void;
  get(): T | undefined;
}

export interface StoreSessionOptionsInput extends Partial<StoreSessionOptions> {
  key: string;
}

export interface StoreSessionOptions {
  key: string;
  type: StoreSessionType;
  includes: string[];
  excludes: string[];
}

export enum StoreSessionType {
  local,
  session,
}

export const DEFAULT_OPTIONS: Partial<StoreSessionOptions> = {
  type: StoreSessionType.local,
  includes: [],
  excludes: [],
};

export function useStoreSessionAdapter<T>(
  config: StoreSessionOptionsInput
): StoreSessionAdapter<T> {
  const options = { ...DEFAULT_OPTIONS, ...config } as StoreSessionOptions;

  function set(state: T): void {
    getStorageClass().setItem(options.key, getStateToSave(state));
  }

  function get(): T | undefined {
    const stringifiedState = getStorageClass().getItem(options.key);
    return stringifiedState ? parseState(stringifiedState) : undefined;
  }

  return {
    set,
    get,
  };

  function getStorageClass(): Storage {
    return options.type === StoreSessionType.local
      ? localStorage
      : sessionStorage;
  }

  function getStateToSave(state: T): string {
    return JSON.stringify(stripState(state));
  }

  function stripState(state: T): Partial<T> {
    const parsedState = removeExcludedProperties(state);
    return checkGetIncludedProperties(parsedState);
  }

  function removeExcludedProperties(initialState: T): Partial<T> {
    return options.excludes.reduce(
      (state: Partial<T>, property: string) =>
        removeExcludedProperty(state, property),
      initialState
    );
  }

  function removeExcludedProperty(
    state: Partial<T>,
    property: string
  ): Partial<T> {
    delete state[property as keyof T];
    return state;
  }

  function checkGetIncludedProperties(state: Partial<T>): Partial<T> {
    const shouldSetIncludedProperties = options.includes.length > 0;
    return shouldSetIncludedProperties ? getIncludedProperties(state) : state;
  }

  function getIncludedProperties(initialState: Partial<T>): Partial<T> {
    return options.includes.reduce((state: Partial<T>, property: string) => {
      state[property as keyof T] = initialState[property as keyof T];
      return state;
    }, {});
  }

  function parseState(stringifiedState: string): T {
    return JSON.parse(stringifiedState);
  }
}
