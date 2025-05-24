import { RouteParams } from "@sigiljs/pathfinder"
import { Internal } from "~/types"

/**
 * Request content modifier.
 *
 * Installed on a specific router and can modify
 * the already processed request. The returned value
 * will be merged into the request object.
 *
 * > The modifier will not be invoked if the router
 * > fails to find a registered handler.
 *
 * To ensure correct typing, specify the return type
 * in the subclass definition:
 * ```typescript
 * class MyModifier extends Modifier<{ additionalData: number }> {}
 * ```
 *
 * @template T type of additional data to merge into the request.
 * @template Path route path string type (e.g., "/users/:id").
 */
export abstract class Modifier<
  T = any,
  Path extends string = string,
> {
  /**
   * Creates a new Modifier instance. No parameters.
   */
  protected constructor() {}

  /**
   * Lifecycle method called just before the request is passed
   * to the registered handler.
   *
   * @param request client request object already processed by the framework.
   * @returns additional data to merge into the request,
   * matching the type specified in the subclass.
   */
  public abstract onRequest(
    request: Internal.Requests.ClientRequest<RouteParams<Path>>
  ): T | Promise<T>
}

type PayloadOfConstructor<C> =
  C extends ModifierConstructor<infer Out, any> ? Awaited<Out> : never

/**
 * Converts a union of types to their intersection.
 * Used to merge payload types from multiple modifiers.
 * @template U union of types.
 */
type UnionToIntersection<U> =
  (U extends any ? (x: U) => 0 : never) extends (x: infer I) => 0 ? I : never

/**
 * Utility type to merge payloads of all modifiers in an array.
 * @template Arr array of modifier constructors.
 */
export type MergePayloads<Arr extends readonly ModifierConstructor<any, any>[]> =
  UnionToIntersection<PayloadOfConstructor<Arr[number]>>

/**
 * Constructor type for a Modifier subclass.
 * @template Out return type of onRequest.
 * @template P route path type.
 */
export type ModifierConstructor<
  Out,
  P extends string = string,
> = new () => Modifier<Out, P>
