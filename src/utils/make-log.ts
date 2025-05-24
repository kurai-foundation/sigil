import { DebugOptions } from "~/sigil/types"

let colorsModule: any
try {
  colorsModule = require("colors")
}
catch {
  // pass
}

export interface ILogOptions {
  level: "warning" | "error" | "info" | "success"
  message: string[] | string | ((dim: (payload: string) => string) => string)
  json?: any
  module: string
  condition?: any
}

const callColorsFn = (fn: string, payload: string) => colorsModule?.[fn] ? colorsModule[fn](payload) : payload

const cache: Record<any, any> = {}

export default function makeLog(debug: Partial<DebugOptions> | undefined, {
  message,
  level,
  condition,
  ...rest
}: ILogOptions) {
  colorsModule?.enable()
  const _msg_r = typeof message === "function" ? message(callColorsFn.bind({}, "dim")) : message
  const _msg = Array.isArray(_msg_r) ? _msg_r.join(" ") : _msg_r

  const isFancy = cache.isFancy ?? (debug?.fancyOutput === undefined ? process.env?.NODE_ENV !== "production" : debug?.fancyOutput)
  cache.isFancy ??= isFancy

  const _moduleName = isFancy ? (rest.module[0].toUpperCase() + rest.module.slice(1)) : rest.module
  let _logger = debug?.moduleLogger ? debug.moduleLogger(_moduleName) : debug?.logger as any
  if (!_logger && _logger !== null) _logger = console

  const _ct = {
    module: _moduleName,
    level: level,
    timestamp: Date.now(),
    data: rest.json ?? { message: _msg }
  }
  const _res_msg = !isFancy ? JSON.stringify(_ct) : _msg

  const _infoLog = cache.infoLog ?? (_logger?.["debug"] || _logger?.["log"] || _logger?.["info"])
  const _warnLog = cache.warningLog ?? (_logger?.["warn"] || _logger?.["warning"])
  const _successLog = cache.successLog ?? (_logger?.["success"] || _infoLog)

  cache.infoLog ??= _infoLog
  cache._warnLog ??= _warnLog
  cache._successLog ??= _successLog

  const fn = _logger?.[level] || _infoLog || _warnLog

  let _exec_res: any
  if (typeof condition !== "undefined") {
    if (condition) _exec_res = isFancy ? fn?.(_res_msg) : _infoLog?.(_res_msg)
  }
  else _exec_res = isFancy ? fn?.(_res_msg) : _infoLog?.(_res_msg)

  if (rest.json && _exec_res) {
    if ("json" in _exec_res) _exec_res.json = {
      __module: _ct.module,
      __level: _ct.level,
      ..._ct.data
    }
  }
}