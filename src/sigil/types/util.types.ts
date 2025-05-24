import { BaseSchema, ObjectSchema } from "@sigiljs/seal"
import { InferSchema } from "@sigiljs/seal/types"
import http from "node:http"
import https from "node:https"
import { SigilOptions } from "~/sigil/types/common.types"
import { Internal } from "~/types"

export type RequestValidator = { [key: string]: BaseSchema<any> }

export type InferMeta<Schema extends RequestValidator> = Partial<Internal.Route.RouteDescriptor<InferSchema<ObjectSchema<Schema>>>>

export type MaybeInferMeta<Schema extends RequestValidator> = InferMeta<Schema> | undefined

export type MaybePromise<R> = R extends Promise<any> ? Promise<Awaited<R> | null> : R | null

export type ServerDefinition<T extends Partial<SigilOptions>> = T extends Record<string, any> ? (T extends {
  serverless: true
} ? undefined : (T["server"] extends {
  https: https.ServerOptions<any>
} ? https.Server : http.Server)) : http.Server