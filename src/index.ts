import { RouteParams } from "@sigiljs/pathfinder"
import { seal } from "@sigiljs/seal"
import { InferSchema } from "@sigiljs/seal/types"
import { Modifier, Route } from "~/route"
import { SigilPlugin } from "~/sigil/misc"
import Sigil from "~/sigil/sigil"
import { DebugOptions, InferMeta, SigilOptions } from "~/sigil/types"
import { Internal, RequestMeta } from "~/types"

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
  type DebugOptions,
  type RouteParams,
  type InferMeta,
  type InferSchema,
  type RequestMeta
}