type KV = Record<string, string[]>

type KeyOf<S, Q> = keyof (S & Q)

/**
 * Container for URL query parameters with typed accessors.
 * Supports initialization from multiple formats (string, array, object, URLSearchParams).
 *
 * @template QuerySchema Known query parameter keys and their expected value types.
 */
export default class IncomingSearchParams<
  QuerySchema extends Record<string, string> = Record<string, string>
> {
  /**
   * Read any known query parameter as a string or null.
   */
  public getAny = this.getKnown as <T extends KeyOf<QuerySchema, any>>(key: T) => string | null

  /** Internal map of parameter names to array of values. */
  #map: KV = Object.create(null)

  /**
   * Constructs a new IncomingSearchParams instance.
   *
   * @param init initial parameters
   */
  constructor(init?: string | string[][] | Record<string, string> | URLSearchParams) {
    if (!init) return

    if (typeof init === "string") {
      const str = init.charAt(0) === "?" ? init.slice(1) : init
      for (const pair of str.split("&")) {
        if (!pair) continue
        const [k, v = ""] = pair.split("=", 2)
        this.append(decodeURIComponent(k), decodeURIComponent(v))
      }
      return
    }

    if (Array.isArray(init)) {
      for (const [k, v] of init) this.append(k, v)
      return
    }

    if (init instanceof URLSearchParams) {
      for (const [k, v] of init) this.append(k, v)
      return
    }

    // Record<string,string>
    for (const k in init) this.append(k, init[k])
  }

  /**
   * Returns a JSON-like object of parameters, taking the first value for each key.
   * @returns object mapping each key to its first value.
   */
  public json(): QuerySchema {
    return Object.fromEntries(
      Object.entries(this.#map).map(([k, v]) => [k, v[0]])
    ) as any
  }

  /**
   * Retrieves the first value for a known parameter or null if missing.
   *
   * @param key parameter key to retrieve.
   * @returns first parameter value or null.
   */
  public getKnown<T extends keyof QuerySchema>(key: T): QuerySchema[T] | null {
    const arr = this.#map[this.#key(String(key))]
    return (arr && arr[0]) as QuerySchema[T] ?? null
  }

  /**
   * Retrieves all values for a known parameter key.
   *
   * @param key parameter key to retrieve.
   * @returns array of all values for the key.
   */
  public getAll<T extends keyof QuerySchema>(key: T): string[] {
    return this.#map[this.#key(String(key))] ?? []
  }

  /**
   * Checks if a known parameter key is present.
   *
   * @param key parameter key to check.
   * @returns true if the key exists.
   */
  public has<T extends keyof QuerySchema>(key: T): boolean {
    return this.#key(String(key)) in this.#map
  }

  /**
   * Sets a parameter to a single value, replacing existing values.
   *
   * @param key parameter key to set.
   * @param value value to assign.
   * @returns instance for chaining.
   */
  public set<T extends keyof QuerySchema>(key: T, value: any): this {
    this.#map[this.#key(String(key))] = [String(value)]
    return this
  }

  /**
   * Appends a value to a parameter key, preserving existing values.
   *
   * @param key parameter key to append to.
   * @param value value to append.
   * @returns instance for chaining.
   */
  public append<T extends keyof QuerySchema>(key: T, value: any): this {
    const k = this.#key(String(key))
    const arr = this.#map[k]
    if (arr) arr.push(String(value))
    else this.#map[k] = [String(value)]
    return this
  }

  /**
   * Deletes all values for a parameter key.
   *
   * @param key parameter key to delete.
   * @returns instance for chaining.
   */
  public delete<T extends keyof QuerySchema>(key: T): this {
    delete this.#map[this.#key(String(key))]
    return this
  }

  /**
   * Returns a simple object of parameters taking the first value for each key.
   *
   * @returns plain object of key->firstValue.
   */
  public getObject(): Record<string, string> {
    const obj: Record<string, string> = {}
    for (const k in this.#map) obj[k] = this.#map[k][0]
    return obj
  }

  /**
   * Iterator over [key, value] pairs for each parameter value.
   * Works like URLSearchParams[Symbol.iterator].
   */
  public* [Symbol.iterator](): IterableIterator<[string, string]> {
    for (const k in this.#map) {
      for (const v of this.#map[k]) yield [k, v]
    }
  }

  /** Internal helper to normalize key names. */
  #key(name: string) {
    return name.toString()
  }
}
