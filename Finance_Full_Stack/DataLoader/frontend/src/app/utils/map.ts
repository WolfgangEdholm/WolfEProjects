

export class CaseInsensitiveMap<TKey, VKey> extends Map<TKey, VKey> {
  private keysMap = new Map<TKey, TKey>();

  constructor(iterable?: Iterable<[TKey, VKey]>){
    super();
    if (iterable) {
      for (const [key, value] of iterable) {
        this.set(key, value);
      }
    }
  }

  set(key: TKey, value: VKey): this {
    const keyLowerCase = typeof key === 'string'
      ? key.toLocaleLowerCase() as any as TKey
      // ? key.toLowerCase() as any as TKey
      : key;
    this.keysMap.set(keyLowerCase, key);
    return super.set(keyLowerCase, value);
  }

  get(key: TKey): VKey | undefined {
    return typeof key === 'string'
      ? super.get(key.toLocaleLowerCase() as any as TKey)
      // ? super.get(key.toLowerCase() as any as TKey)
      : super.get(key);
  }

  has(key: TKey): boolean {
    return typeof key === 'string'
      ? super.has(key.toLocaleLowerCase() as any as TKey)
      // ? super.has(key.toLowerCase() as any as TKey)
      : super.has(key);
  }

  delete(key: TKey): boolean {
    const keyLowerCase = typeof key === 'string'
      ? key.toLocaleLowerCase() as any as TKey
      // ? key.toLowerCase() as any as TKey
      : key;
    this.keysMap.delete(keyLowerCase);
    return super.delete(keyLowerCase);
  }

  clear(): void {
    this.keysMap.clear();
    super.clear();
  }

  keys(): IterableIterator<TKey> {
    return this.keysMap.values();
  }

  *entries(): IterableIterator<[TKey, VKey]> {
    const keys = this.keysMap.values();
    const values = super.values();
    for (let i = 0; i < super.size; i++) {
      yield [keys.next().value, values.next().value];
    }
  }

  forEach(
    callbackfn: (
      value: VKey,
      key: TKey,
      map: Map<TKey, VKey>,
    ) => void,
  ): void {
    const keys = this.keysMap.values();
    const values = super.values();
    for (let i = 0; i < super.size; i++) {
      callbackfn(values.next().value, keys.next().value, this);
    }
  }

  [Symbol.iterator](): IterableIterator<[TKey, VKey]> {
    return this.entries();
  }
}
