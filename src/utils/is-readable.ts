import { Readable } from "node:stream"

export const isReadable = (x: any): x is Readable =>
  x && typeof x.pipe === "function" && typeof x.read === "function"
