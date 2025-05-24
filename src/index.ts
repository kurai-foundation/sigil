import { seal } from "@sigiljs/seal"
import { Modifier, Route } from "~/route"
import { Sigil } from "~/sigil"
import { SigilPlugin } from "~/sigil/misc"
import { DebugOptions, SigilOptions } from "~/sigil/types"
import { Internal } from "~/types"

type ResponseTemplateCallback = Internal.ResponseTemplateCallback
type AbstractLogger = Internal.AbstractLogger
type ClientRequest<
  PathParams extends Record<string, string>,
  Body = unknown,
  Headers = unknown,
  SearchParams = unknown
> = Internal.Requests.ClientRequest<PathParams, Body, Headers, SearchParams>

export {
  Sigil,
  seal,
  Route,
  SigilPlugin,
  Modifier,

  type ResponseTemplateCallback,
  type AbstractLogger,
  type ClientRequest,
  type SigilOptions,
  type DebugOptions
}