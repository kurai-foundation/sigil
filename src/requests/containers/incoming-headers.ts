import { IncomingHttpHeaders } from "node:http"

type RawHeaders = readonly string[]
type Dict = NodeJS.Dict<string | string[]>
type KeyOf<H, S> = keyof (H & S)

export default class IncomingHeaders<
  Schema extends Record<string, string | string[]> = Record<string, string | string[]>,
  H extends Dict = IncomingHttpHeaders
> {
  #map: Record<string, string[]> = Object.create(null)
  #cookies: Record<string, string> = Object.create(null)

  constructor(raw: RawHeaders | Dict = []) {
    if (Array.isArray(raw)) {
      for (let i = 0; i < raw.length; i += 2) this.append(raw[i], raw[i + 1])
    }
    else {
      for (const k in raw) {
        const v = (raw as any)[k]
        if (v === undefined) continue
        Array.isArray(v) ? v.forEach(val => this.append(k, val))
          : this.append(k, v)
      }
    }
  }

  /* ---------------------- 🔙 100 % совместимость ----------------------- */

  /**
   * Gets the link associated with the current map instance.
   *
   * @return link to the internal map.
   */
  get link() {
    return this.#map
  }

  /* ---------------------- Cookie-утилиты ----------------------- */

  /**
   * Retrieves all stored cookies as key-value pairs.
   *
   * @return {Record<string, string>} an object containing cookie names as keys and their corresponding values.
   */
  public get cookies(): Record<string, string> { return { ...this.#cookies } }

  /**
   * Retrieves the value of a cookie by its name.
   *
   * @param {string} name name of the cookie to retrieve.
   * @return {string | undefined} value of the cookie if found, or undefined if the cookie does not exist.
   */
  public getCookie(name: string): string | undefined { return this.#cookies[name] }

  /* ---------------------- Header-утилиты ----------------------- */

  /**
   * Returns an iterator for traversing the key-value pair entries stored in the internal map.
   * Each key-value pair is returned as a two-element array.
   *
   * @return {IterableIterator<[string, string]>} an iterator that yields key-value pairs as arrays.
   */
  * entries(): IterableIterator<[string, string]> {
    for (const k in this.#map) for (const v of this.#map[k]) yield [k, v]
  }

  /**
   * Returns a JSON-like object of parameters, taking the first value for each key.
   * @returns object mapping each key to its first value.
   */
  public json(): Schema {
    return Object.fromEntries(
      Object.entries(this.#map).map(([k, v]) => [k, v[0]])
    ) as any
  }

  /**
   * Checks if a given key exists in the internal map.
   *
   * @param name key to check for existence. It can either be a specific type parameter of `Schema` or any string.
   * @return {boolean} true if the key exists in the map, otherwise false.
   */
  public has<T extends KeyOf<Schema, H>>(name: T | string): boolean {
    return name.toString().toLowerCase() in this.#map
  }

  /**
   * Retrieves the first value associated with a given key.
   *
   * @param name key whose associated value needs to be retrieved.
   * @return {string | null} first value associated with the specified key if it exists, otherwise returns null.
   */
  get<T extends KeyOf<Schema, H>>(name: T): string | null {
    return this.#map[name.toString().toLowerCase()]?.[0] ?? null
  }

  /**
   * Retrieves all values associated with the specified key from the internal map.
   *
   * @param name key whose associated values are to be retrieved.
   * @return {string[]} array of strings containing the values associated with the specified key.
   * Returns an empty array if no values are found.
   */
  getAll<T extends KeyOf<Schema, H>>(name: T): string[] {
    return this.#map[name.toString().toLowerCase()] ?? []
  }

  /**
   * Sets or replaces the header with the given name and value.
   *
   * @param name header name (typed if using a Schema).
   * @param value header value.
   * @returns instance for chaining.
   */
  set<T extends KeyOf<Schema, H>>(name: T, value: string): this {
    const key = name.toString().toLowerCase()
    this.#map[key] = [value]
    if (key === "cookie") this.#parseCookie(value)
    return this
  }

  /**
   * Appends a value to an existing header or creates it if absent.
   *
   * @param name header name.
   * @param value value to append.
   * @returns instance for chaining.
   */
  append<T extends KeyOf<Schema, H>>(name: T, value: string): this {
    const key = name.toString().toLowerCase()
    ;(this.#map[key] ||= []).push(value)
    if (key === "cookie") this.#parseCookie(value)
    return this
  }

  /**
   * Deletes a header by name.
   *
   * @param name header name to delete.
   * @returns instance for chaining.
   */
  delete<T extends KeyOf<Schema, H>>(name: T): this {
    const key = name.toString().toLowerCase()
    delete this.#map[key]
    if (key === "cookie") this.#cookies = {}
    return this
  }

  #parseCookie(line: string): void {
    line.split(";").forEach(pair => {
      const [rawKey, ...rawVal] = pair.trim().split("=")
      if (!rawKey) return
      this.#cookies[rawKey] = decodeURIComponent(rawVal.join("=") || "")
    })
  }
}