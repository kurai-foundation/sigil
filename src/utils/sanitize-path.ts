export default function sanitizePath(path: string, joinWith = ""): string {
  return path
    .split("/")
    .map(segment => segment.startsWith(":") ? segment.slice(1) : segment)
    .filter(Boolean)
    .map(segment => segment[0].toUpperCase() + segment.slice(1))
    .join(joinWith)
    .replace(/\s+/g, " ")
    .trim()
}