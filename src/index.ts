import { RouteParams } from "@sigiljs/pathfinder"
import { seal } from "@sigiljs/seal"
import { InferSchema } from "@sigiljs/seal/types"
import { MergePayloads, Modifier, ModifierConstructor, Route } from "~/route"
import { SigilPlugin } from "~/sigil/misc"
import Sigil from "~/sigil/sigil"
import { DebugOptions, InferMeta, SigilOptions } from "~/sigil/types"
import { Internal, RequestMeta } from "~/types"
import Cookie from "~/utils/cookie"
import CookieBuilder from "~/utils/cookie-builder"

type ResponseTemplateCallback = Internal.ResponseTemplateCallback
type AbstractLogger = Internal.AbstractLogger
type ClientRequest<
  PathParams extends Record<string, string> = Record<string, string>,
  Body = unknown,
  Headers = unknown,
  SearchParams = unknown
> = Internal.Requests.ClientRequest<PathParams, Body, Headers, SearchParams>

type RequestWithModifiers<
  Request extends ClientRequest,
  Modifiers extends Modifier[] | undefined = undefined
> = Request & (Modifiers extends Modifier<infer U>[] ? MergePayloads<ModifierConstructor<U>[]> : {})

export {
  Sigil,
  seal,
  Route,
  SigilPlugin,
  Modifier,
  Cookie,
  CookieBuilder,

  type ResponseTemplateCallback,
  type AbstractLogger,
  type ClientRequest,
  type SigilOptions,
  type DebugOptions,
  type RouteParams,
  type InferMeta,
  type InferSchema,
  type RequestMeta,
  type RequestWithModifiers
}