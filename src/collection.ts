export interface CollectionOptions<K, V> {
    interval?: IntervalOptions,
    expire?: number, // = Infinity
    limit?: number, // = Infinity
    values?: Map<K, V>
}

export interface IntervalOptions {
    interval?: number, // = 5000
    shouldReset?: boolean, // = false
}

export class Collection<K, V> {
    public readonly cache: Map<K, V> = new Map<K, V>();
    public readonly intervalType: IntervalOptions
    public readonly expire: number
    public readonly limit: number
    private _interval!: NodeJS.Timer
    private _lastUsed: Map<K, number> = new Map<K, number>()

    constructor (options: CollectionOptions<K, V> = {}) {
      this.intervalType = {
        shouldReset: options.interval?.shouldReset || false,
        interval: options.interval?.interval || 5000
      };
      this.expire = options.expire ? Math.min(options.expire, <number> this.intervalType.interval) : Infinity;
      this.limit = options.limit || Infinity;
      if (options.values) this.cache = options.values;
      if (this.shouldStartInterval) this.initInterval();
    }

    get size (): number {
      return this.cache.size;
    }

    get [Symbol.toStringTag] (): string {
      return `Collection (${this.size.toLocaleString()} items)`;
    }

    get shouldStartInterval () {
      return this.size > 0 && (this._interval ? this._interval.hasRef : true) && isFinite(this.expire);
    }

    public array (): [K, V][] {
      return Array.from(this.cache);
    }

    public clear (): void {
      this._lastUsed.clear();
      this.cache.clear();
    }

    clone (): Collection<K, V> {
      return new Collection<K, V>({ values: this.cache });
    }

    public delete (key: K): boolean {
      const deleted = this.cache.delete(key);
      this._lastUsed.delete(key);
      if (this.cache.size === 0) {
        this.stopInterval();
      }
      return deleted;
    }

    public forEach (func: (v: V, k: K, map: Map<K, V>) => void, thisArg?: any): void {
      return this.cache.forEach(func, thisArg);
    }

    filter (func: (v: V, k: K) => boolean): Array<V> {
      const map = [];
      for (const [key, value] of this) {
        if (func(value, key)) {
          map.push(value);
        }
      }
      return map;
    }

    find (func: (v: V, k: K) => boolean): V | undefined {
      for (const [key, value] of this) {
        if (func(value, key)) {
          return value;
        }
      }
      return undefined;
    }

    first (): V | undefined {
      for (const [, value] of this) {
        return value;
      }
    }

    public get (key: K) {
      this._lastUsed.set(key, Date.now());
      return this.cache.get(key);
    }

    has (key: K): boolean {
      return this.cache.has(key);
    }

    private initInterval (): void {
      this._interval = <NodeJS.Timer> <unknown> /* thanks ts */ setInterval(() => {
        const expire = this.expire;
        const now = Date.now();
        for (const [key] of this.cache) {
          const lastUsed = this._lastUsed.get(key);
          if (lastUsed && expire < now - lastUsed) {
            this.delete(key);
          }
        }
      }, this.intervalType.interval);
    }

    keys (): IterableIterator<K> {
      return this.cache.keys();
    }

    map (func: (v: V, k: K) => any): Array<any> {
      const map = [];
      for (const [key, value] of this) {
        map.push(func(value, key));
      }
      return map;
    }

    reduce (func: (intial: any, v: V) => any, initialValue?: any): any {
      let reduced = initialValue;
      for (const [, value] of this) {
        reduced = func(reduced, value);
      }
      return reduced;
    }

    some (func: (v: V, k: K) => boolean): boolean {
      for (const [key, value] of this) {
        if (func(value, key)) {
          return true;
        }
      }
      return false;
    }

    private startInterval (): void {
      if (!this._interval) {
        return this.initInterval();
      }
      setImmediate(() => {
        this._interval.ref();
      });
    }

    private stopInterval (): void {
      this._interval.unref();
    }

    public set (key: K, value: V): void {
      if (this.size === this.limit) {
        const firstEntry = this.array()[0];
        const firstKey = firstEntry[0];
        this.delete(firstKey);
      }
      this.cache.set(key, value);
      this._lastUsed.set(key, Date.now());
      if (this.shouldStartInterval) this.startInterval();
    }

    toString (): string {
      return this[Symbol.toStringTag];
    }

    public values (): IterableIterator<V> {
      return this.cache.values();
    }

    public [Symbol.iterator] (): IterableIterator<[K, V]> {
      return this.cache[Symbol.iterator]();
    }
}
