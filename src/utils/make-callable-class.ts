export type CallableClass<T extends new (...args: any[]) => any> =
  { new(...args: ConstructorParameters<T>): InstanceType<T> }
  & { (...args: ConstructorParameters<T>): InstanceType<T> }
  & T;

export default function makeCallableClass<
  T extends new (...args: any[]) => any
>(
  Ctor: T
): CallableClass<T> {
  const proxy = new Proxy(Ctor, {
    construct(target, args, newTarget) {
      return Reflect.construct(target, args, newTarget)
    },
    apply(target, thisArg, args) {
      return Reflect.construct(target, args, target)
    }
  })
  return proxy as CallableClass<T>
}