import Cookie, { CookieName, CookieOptions, CookieValue } from "./cookie"

export default class CookieBuilder {
  private readonly options: Readonly<CookieOptions>

  constructor(options?: Readonly<CookieOptions>) {
    this.options = { ...options || {} }
  }

  public create<V extends string, N extends string>(name: CookieName<N>, value: CookieValue<V>, options?: Readonly<Partial<CookieOptions>>) {
    return new Cookie(name, value, {
      ...this.options,
      ...options || {}
    })
  }
}
