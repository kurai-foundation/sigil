export default function nonNullable<T>(array: T[]): NonNullable<T>[] {
  return array.filter(Boolean) as any
}
