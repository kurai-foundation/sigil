import { Pathfinder, RouteParams } from "@sigiljs/pathfinder"
import attachModifierContext from "~/route/modifier/attach-modifier-context"
import Sigil from "~/sigil/sigil"
import { type Internal } from "~/types"
import makeLog, { ILogOptions } from "~/utils/make-log"
import { ModifierConstructor } from "./modifier"
import Route, { RouteOptions } from "./route"

type X<Middleware> = Middleware extends readonly ModifierConstructor<any, any>[]
  ? InstanceType<Middleware[number]>
  : never

/**
 * Core router class that serves as a higher-level abstraction over the
 * underlying HTTP router (pathfinder). Provides foundational logic for:
 * - Mounting child routers
 * - Storing request metadata and validation schemas
 * - Managing middleware modifiers and debug logging
 *
 * @template Middleware A tuple of modifier constructors applied to this route.
 */
export default class RouteCore<
  Middleware extends (readonly ModifierConstructor<any, any>[]) | undefined
> {
  /**
   * Internal container for route validation schemas.
   * Populated by route definitions.
   * @internal
   */
  public __$schemas: Partial<Internal.Route.SchemasContainer> = {}

  /**
   * Bound logger function configured with route-level debug options.
   */
  public readonly logger: (options: ILogOptions) => void

  /**
   * Router-level configuration options (e.g., debug settings).
   */
  protected __$options?: RouteOptions<any>

  protected __$sigil?: Sigil

  /**
   * Reference to the root Route when chaining definitions.
   * Used to aggregate child request metadata.
   * @protected
   */
  protected __initialParent?: Route<any>

  /**
   * Map of registered request descriptors for this router.
   * Keyed by a unique identifier.
   * @protected
   */
  protected $registeredRequests: Map<string, Internal.Route.RequestDescriptor> = new Map()

  /**
   * Instantiated middleware modifiers for this router.
   * @protected
   */
  protected $modifierInstances: X<Middleware>[] = []

  /**
   * @protected
   */
  protected $modifierConstructors: readonly ModifierConstructor<any, any>[] = []

  /**
   * Callback invoked whenever the router's structure is updated.
   * @protected
   */
  protected $updateCallback?: () => any

  /**
   * Map of mounted child routers by mount path.
   * @private
   */
  private $mounted: Map<string, Route<any>> = new Map()

  /**
   * Initializes the RouteCore.
   *
   * @param modifiers array of modifier constructors to apply, or undefined.
   * @param $pathfinder underlying pathfinder router instance.
   * @param $options optional router settings (excluding modifiers).
   * @protected
   */
  protected constructor(
    modifiers: (readonly ModifierConstructor<any, any>[]) | undefined,
    protected readonly $pathfinder: Pathfinder,
    $options?: RouteOptions<Middleware>
  ) {
    this.__$options = $options
    this.logger = makeLog.bind({}, $options?.debug)

    if (modifiers) {
      this.$modifierConstructors = modifiers
      this.initializeModifiers()
    }
  }

  /**
   * Retrieve route options
   */
  public get routeOptions() {
    return this.__$options
  }

  /**
   * Internal accessor for the underlying pathfinder router.
   * @internal
   */
  public get __$pathfinder(): Pathfinder {
    return this.$pathfinder
  }

  /**
   * Accessor for all registered request descriptors,
   * including those from mounted child routers with full paths.
   */
  public get exportRequests(): Internal.Route.RequestDescriptor[] {
    const mountedRequests = Array.from(this.$mounted.entries())
      .flatMap(([basePath, childRoute]) =>
        childRoute.exportRequests.map(request => ({
          ...request,
          path: basePath + request.path
        }))
      )

    return [
      ...this.$registeredRequests.values(),
      ...mountedRequests
    ]
  }

  /**
   * Mounts a child router at the specified sub-path.
   * Propagates update callbacks to maintain global request metadata.
   *
   * @param path sub-path at which to mount the child router.
   * @param route child Route instance.
   */
  public mount(path: string, route: Route<any>) {
    this.$mounted.set(path, route)
    this.__$pathfinder.mount(path, route.__$pathfinder)

    if (this.$updateCallback) {
      route.__$connectToSigil(
        this.__$sigil,
        () => this.$updateCallback?.(),
        this.__$options
      )
    }
    this.$updateCallback?.()
  }

  /**
   * Connects the router to the Sigil framework internals.
   * Merges new router options and registers the structure update callback.
   *
   * @param sigil sigil instance
   * @param updateCallback callback to invoke on structural changes.
   * @param optionsRequest partial router options to merge (excluding modifiers).
   * @internal
   */
  public __$connectToSigil(sigil: Sigil | undefined, updateCallback: () => any, optionsRequest?: Omit<Partial<RouteOptions<any>>, "modifiers">) {
    this.$updateCallback = updateCallback
    this.__$sigil = sigil

    this.initializeModifiers()

    if (!optionsRequest) return

    if (!this.__$options) this.__$options = {}
    for (const [key, value] of Object.entries(optionsRequest)) {
      if (key === "middleware") continue
      if ((this.__$options as any)[key] !== undefined) continue
      (this.__$options as any)[key] = value
    }
  }

  /**
   * Applies all middleware modifiers to the incoming client request.
   * Merges each modifier's output into the request object.
   *
   * @param req - The parsed client request to modify.
   * @returns The modified request with merged modifier payloads.
   * @protected
   */
  protected async $injectModifier(req: Internal.Requests.ClientRequest<RouteParams<string>>) {
    let nextRequest = Object.assign({}, req)

    for (const instance of this.$modifierInstances) {
      const result = instance.onRequest(req)
      const payload = result instanceof Promise ? await result : result
      nextRequest = { ...nextRequest, ...payload }
    }

    return nextRequest
  }

  /**
   * Initialize or re-initialize modifier instances
   * @private
   */
  private initializeModifiers() {
    this.$modifierInstances = this.$modifierConstructors.map(modifier => {
      attachModifierContext(modifier, {
        sigilApi: this.__$sigil,
        debugOpts: this.routeOptions?.debug || {}
      })

      return new modifier()
    }) as X<Middleware>[]
  }
}