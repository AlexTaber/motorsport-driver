import { computed, ComputedRef } from "vue";

import { StoreOptions } from "./store";
import { useStore } from "./store";
import {
  arrayAdd,
  arrayConcat,
  arrayPrepend,
  arrayRemoveItemByProperty,
  arrayUpdateItemByProperty,
} from "./utils";

export type EntityStore = ReturnType<typeof useEntityStore>;

export interface EntityStoreOptions<T> extends StoreOptions {
  idKey: keyof T;
}

export interface EntityState<T> {
  entities: T[];
  activeId?: ID;
}

export interface Entity {
  id?: ID;
}

export type EntityMap<T> = { [key: string]: T };

export type ID = string | number;

type Unarray<T> = T extends Array<infer U> ? U : T;

export function useEntityStore<S extends EntityState<Unarray<S["entities"]>>>(
  name: string,
  state: S,
  optionsInput?: Partial<EntityStoreOptions<Unarray<S["entities"]>>>
) {
  type T = Entity & Unarray<S["entities"]>;

  const store = useStore(name, state, {
    idKey: "id",
    ...optionsInput,
  } as EntityStoreOptions<T>);

  const entitiesMap: ComputedRef<EntityMap<T>> = computed(() =>
    store.entities.value.reduce((map: EntityMap<T>, entity: T) => {
      map[entity[store.$options.idKey as keyof Entity] as string] = entity;
      return map;
    }, {} as EntityMap<T>)
  );

  const isEmpty: ComputedRef<boolean> = computed(
    () => store.entities.value.length === 0
  );

  function setEntities(entities: T[], actionName = "setEntities") {
    store.patch({ entities } as Partial<S>, actionName);
  }

  function findById(id: ID | undefined): T | undefined {
    return entitiesMap.value[id as ID];
  }

  function findByIds(ids: ID[]): T[] {
    return ids.reduce((entities, id) => {
      const entity = findById(id);
      if (entity) {
        entities.push(entity);
      }

      return entities;
    }, [] as T[]);
  }

  function add(entity: T): void {
    setEntities(arrayAdd(store.entities.value, entity), "add");
  }

  function prepend(entity: T): void {
    setEntities(arrayPrepend(store.entities.value, entity), "prepend");
  }

  function concat(entities: T[]): void {
    setEntities(arrayConcat(store.entities.value, entities), "concat");
  }

  function deduplicate(): void {
    setEntities(
      Object.keys(entitiesMap.value).map(
        (key) => entitiesMap.value[key as keyof typeof entitiesMap.value]
      ),
      "deduplicate"
    );
  }

  function update(id: ID, diff: Partial<T>): void {
    setEntities(
      arrayUpdateItemByProperty(
        store.entities.value,
        store.$options.idKey,
        id as never,
        diff
      ),
      "update"
    );
  }

  function upsert(entity: T): void {
    setEntities(
      arrayUpdateItemByProperty(
        store.entities.value,
        store.$options.idKey,
        entity[store.$options.idKey],
        entity,
        true
      ),
      "upsert"
    );
  }

  function remove(id: ID): void {
    setEntities(
      arrayRemoveItemByProperty(
        store.entities.value,
        store.$options.idKey,
        id as never
      ),
      "remove"
    );
  }

  function setActive(activeId: ID | undefined, actionName = "setActive"): void {
    store.patch({ activeId } as Partial<S>, actionName);
  }

  function setNextActive(): void {
    setActive(
      next.value?.[store.$options.idKey as keyof Entity],
      "setNextActive"
    );
  }

  function setPreviousActive(): void {
    setActive(
      previous.value?.[store.$options.idKey as keyof Entity],
      "setPreviousActive"
    );
  }

  const active = computed(() => {
    return findById(store.$state.activeId);
  });

  const previous = computed(() => {
    const entities = store.entities.value as T[];
    const currentIndex = entities.findIndex(
      (entity) =>
        entity[store.$options.idKey as keyof Entity] === store.$state.activeId
    );

    return entities[currentIndex - 1];
  });

  const next = computed(() => {
    const entities = store.entities.value as T[];
    const currentIndex = entities.findIndex(
      (entity) =>
        entity[store.$options.idKey as keyof Entity] === store.$state.activeId
    );

    return entities[currentIndex + 1];
  });

  return {
    ...store,
    entities: store.entities,
    entitiesMap,
    isEmpty,
    active,
    previous,
    next,
    setEntities,
    add,
    prepend,
    concat,
    deduplicate,
    update,
    upsert,
    remove,
    setActive,
    setNextActive,
    setPreviousActive,
    findById,
    findByIds,
  };
}
