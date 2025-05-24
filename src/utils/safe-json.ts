interface CommonOptions {
  fallback?: string
  throw?: boolean
}

interface StringifyOptions extends CommonOptions {
  replacer?: (this: any, key: string, value: any) => any
  space?: string | number
}

type FnResponse<K extends CommonOptions> = K extends string ? string : (K["fallback"] extends string ? string : (K["throw"] extends true ? string : string | null))

export function jsonStringify<K extends StringifyOptions>(payload: any, options?: K): FnResponse<K> {
  if (typeof payload === "string") return payload as any

  try {
    return JSON.stringify(payload, options?.replacer, options?.space) as any
  }
  catch (err: any) {
    if (options?.throw) throw new Error("Cannot serialize json: " + err?.message)

    return options?.fallback ? String(options?.fallback) as any : null as any
  }
}

export function jsonParse<T = any, E extends boolean = boolean>(payload: string, throwExceptions?: E): E extends true ? T : T | null {
  try {
    return JSON.parse(payload)
  }
  catch (err: any) {
    if (throwExceptions) throw new Error("Cannot deserialize json: " + err?.message)

    return null as any
  }
}
