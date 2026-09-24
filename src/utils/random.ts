export interface RandomSource { next(): number; int(min: number, max: number): number; pick<T>(values: readonly T[]): T }
export interface StatefulRandomSource extends RandomSource { getState(): number }

/** Mulberry32 provides lightweight reproducible generation for tests and resumable runs. */
export function createSeededRandom(seed: number): StatefulRandomSource {
  let state = seed >>> 0;
  const next = (): number => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    getState: () => state >>> 0,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T>(values: readonly T[]) => {
      if (!values.length) throw new Error("Cannot pick from an empty collection");
      return values[Math.floor(next() * values.length)] as T;
    },
  };
}

export function randomSeed(): number { return Math.floor(Math.random() * 0xffffffff); }
