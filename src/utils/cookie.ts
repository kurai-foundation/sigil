type SameSite = "strict" | "lax" | "none"
type Priority = "low" | "medium" | "high"

type NoSemicolon<T extends string> = T extends `${ string };${ string }` ? never : T
type NonEmpty<T extends string> = T extends "" ? never : T

/** RFC6265 */
export type CookieName<T extends string> =
  NonEmpty<T> extends never ? never :
    T extends `${ string };${ string }` | `${ string }=${ string }` ? never : T

export type CookieValue<T extends string | null> =
  T extends string ? (
    NonEmpty<T> extends never ? never :
      NoSemicolon<T>
    ) : null

export interface CookieOptions {
  /** Absolute expiration date */
  expires?: Date
  /** Max-Age in seconds (integer) */
  maxAge?: number
  domain?: string
  path?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: SameSite
  priority?: Priority
  /** Chromium Partitioned cookies */
  partitioned?: boolean
}

export default class Cookie<N extends string, V extends string | null> {
  private _precompiled?: string

  constructor(name: CookieName<N>, value: CookieValue<V>, options: Readonly<CookieOptions> = {}) {
    this._name = name
    this._value = value
    this._options = options

    this.compile()
  }

  private _name: CookieName<N>

  public get name(): CookieName<N> {
    return this._name
  }

  private _value: CookieValue<V>

  public get value(): CookieValue<V> {
    return this._value
  }

  private _options: Readonly<CookieOptions>

  public get options(): Readonly<CookieOptions> {
    return { ...this._options }
  }

  public compile() {
    if (this._precompiled) return this._precompiled

    const segments: string[] = []

    segments.push(`${ this._name }=${ this._value === null ? "" : this.encodeCookieValue(this._value) }`)

    if (this._options.expires) {
      segments.push(`Expires=${ this._options.expires.toUTCString() }`)
    }
    if (typeof this._options.maxAge === "number") {
      if (!Number.isFinite(this._options.maxAge) || !Number.isInteger(this._options.maxAge)) {
        throw new TypeError("maxAge must be a finite integer (seconds).")
      }
      segments.push(`Max-Age=${ this._options.maxAge }`)
    }
    if (this._options.domain) segments.push(`Domain=${ this._options.domain }`)
    if (this._options.path) segments.push(`Path=${ this._options.path }`)
    if (this._options.secure) segments.push("Secure")
    if (this._options.httpOnly) segments.push("HttpOnly")
    if (this._options.sameSite) segments.push(`SameSite=${ this.capitalize(this._options.sameSite) }`)
    if (this._options.priority) segments.push(`Priority=${ this.capitalize(this._options.priority) }`)
    if (this._options.partitioned) segments.push("Partitioned")

    const result = segments.join("; ")

    this._precompiled = result
    return result
  }

  public setOptions(options: Readonly<Partial<CookieOptions>>) {
    this._options = { ...this._options, ...options }
    this.compile()
  }

  public setValue(value: CookieValue<V>) {
    this._value = value
    this.compile()
  }

  public setName(name: CookieName<N>) {
    this._name = name
    this.compile()
  }

  private encodeCookieValue(value: string): string {
    return encodeURIComponent(value).replace(/%20/g, "+")
  }

  private capitalize<T extends string>(s: T): Capitalize<T> {
    return (s.charAt(0).toUpperCase() + s.slice(1)) as Capitalize<T>
  }
}
