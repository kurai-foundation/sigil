import { IncomingHttpHeaders } from "node:http"

type RawHeaders = readonly string[]

type Dict = NodeJS.Dict<string | string[]>

type KeyOf<H, S> = keyof (H & S)

/**
 * Container for HTTP headers with easy access and mutation methods.
 * Provides a normalized map of header names (lowercased) to values.
 *
 * @template Schema known header keys and their expected value types.
 * @template H raw header dictionary type (e.g., IncomingHttpHeaders).
 */
export default class IncomingHeaders<
  Schema extends Record<string, string> = Record<string, string>,
  H extends Dict = IncomingHttpHeaders
> {
  /** Internal map of header names to their string values. */
  #map: Record<string, string> = Object.create(null)

  /**
   * Constructs headers container from raw headers array or dictionary.
   *
   * @param rawHeaders either an array of alternating header names and values,
   * or a dictionary of header names to values or arrays of values.
   */
  constructor(rawHeaders: RawHeaders | Dict = []) {
    if (Array.isArray(rawHeaders)) {
      // Array format: [name1, value1, name2, value2, ...]
      for (let i = 0; i < rawHeaders.length; i += 2) {
        this.#map[rawHeaders[i].toLowerCase()] = rawHeaders[i + 1]
      }
    }
    else {
      // Dictionary format: { name: value, ... }
      for (const k in rawHeaders) {
        const v = (rawHeaders as any)[k]
        if (v !== undefined) {
          this.#map[k.toLowerCase()] = Array.isArray(v) ? v.join(",") : v
        }
      }
    }
  }

  /**
   * Returns a copy of the internal header map.
   */
  public get link(): Record<string, string> {
    return this.#map
  }

  /**
   * Sets or replaces the header with the given name and value.
   *
   * @param name header name (typed if using a Schema).
   * @param value header value.
   * @returns instance for chaining.
   */
  public set<T extends KeyOf<Schema, H>>(name: T, value: string): this {
    this.#map[String(name).toLowerCase()] = value
    return this
  }

  /**
   * Appends a value to an existing header or creates it if absent.
   *
   * @param name header name.
   * @param value value to append.
   * @returns instance for chaining.
   */
  public append<T extends KeyOf<Schema, H>>(name: T, value: string): this {
    const key = String(name).toLowerCase()
    const prev = this.#map[key]
    this.#map[key] = prev ? `${ prev },${ value }` : value
    return this
  }

  /**
   * Deletes a header by name.
   *
   * @param name header name to delete.
   * @returns instance for chaining.
   */
  public delete<T extends KeyOf<Schema, H>>(name: T): this {
    delete this.#map[String(name).toLowerCase()]
    return this
  }

  /**
   * Checks whether a header exists.
   *
   * @param name header name.
   * @returns true if the header is present.
   */
  public has<T extends KeyOf<Schema, H>>(name: T): boolean {
    return String(name).toLowerCase() in this.#map
  }

  /**
   * Retrieves the header value or null if not present.
   *
   * @param name header name.
   * @returns header value or null.
   */
  public get<T extends KeyOf<Schema, H>>(name: T): string | null {
    return this.#map[String(name).toLowerCase()] ?? null
  }

  /**
   * Retrieves a known header value with type safety based on Schema.
   *
   * @param name key defined in Schema.
   * @returns typed header value or null.
   */
  public getKnown<T extends keyof Schema>(name: T): Schema[T] | null {
    return (this.#map[String(name).toLowerCase()] as Schema[T]) ?? null
  }

  /**
   * Iterates over header entries as [name, value] pairs.
   */
  public* entries(): IterableIterator<[string, string]> {
    for (const k in this.#map) {
      yield [k, this.#map[k]]
    }
  }

  /**
   * Returns a shallow copy of all headers as a plain object.
   */
  public toObject(): Record<string, string> {
    return { ...this.#map }
  }
}
