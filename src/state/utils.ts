import _ from "lodash";

export function arrayAdd<T>(array: T[], item: T): T[] {
  return [...array, item];
}

export function arrayConcat<T>(array: T[], items: T[]): T[] {
  return [...array, ...items];
}

export function arrayPrepend<T>(array: T[], item: T): T[] {
  return [item, ...array];
}

export function arrayUpdateItemByProperty<T, K extends keyof T>(
  array: T[],
  property: K,
  propertyValue: T[K],
  payload: Partial<T>,
  upsert = false
): T[] {
  let itemFound = false;
  const mappedArray = array.map((item: T) => {
    itemFound = itemFound || item[property] === propertyValue;
    return item[property] === propertyValue ? { ...item, ...payload } : item;
  });

  return itemFound || !upsert ? mappedArray : [...array, payload as T];
}

export function arrayRemoveByIndex<T>(array: T[], index: number): T[] {
  return index === -1
    ? array
    : [...array.slice(0, index), ...array.slice(index + 1)];
}

export function arrayRemoveItemByProperty<T, K extends keyof T>(
  array: T[],
  property: K,
  propertyValue: T[K]
): T[] {
  const index = array.findIndex((item) => item[property] === propertyValue);
  return arrayRemoveByIndex(array, index);
}

export function arrayRemove<T>(array: T[], value: T): T[] {
  const index = array.findIndex((checkedValue) =>
    _.isEqual(checkedValue, value)
  );
  return arrayRemoveByIndex(array, index);
}

export function arrayLast<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

export function arrayHasValues<T>(array: T[] | undefined): boolean {
  return !!array && array.length > 0;
}
