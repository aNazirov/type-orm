export function mapFromArray<T>(
  array: T[],
  keyStrategy: (v: T) => string | number,
) {
  const map: Record<string | number, T | undefined> = {};

  for (const item of array) map[keyStrategy(item)] = item;

  return map;
}

export function mapFromArrayWithItemModification<T, V>(
  array: T[],
  keyStrategy: (v: T) => string | number,
  itemStrategy: (v: T) => V,
) {
  const map: Record<string | number, V | undefined> = {};

  for (const item of array) map[keyStrategy(item)] = itemStrategy(item);

  return map;
}

export function mapFromArrayWithArrayValue<T>(
  array: T[],
  keyStrategy: (v: T) => string | number,
) {
  const map: Record<string | number, T[]> = {};

  for (const item of array) {
    const key = keyStrategy(item);

    if (!map[key]) {
      map[key] = [item];
      continue;
    }

    map[key].push(item);
  }

  return map;
}

export function mapFromArrayWithArrayValueAndItemModification<T, V>(
  array: T[],
  keyStrategy: (v: T) => string | number,
  itemStrategy: (v: T) => V,
) {
  const map: Record<string | number, V[]> = {};

  for (const item of array) {
    const key = keyStrategy(item);
    const value = itemStrategy(item);

    if (!map[key]) {
      map[key] = [value];
      continue;
    }

    map[key].push(value);
  }

  return map;
}
