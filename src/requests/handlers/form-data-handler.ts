import formidable from "formidable"
import { Writable } from "node:stream"
import { Internal } from "~/types"
import nonNullable from "~/utils/non-nullable"
import { IncomingBody, IncomingFile } from "../containers"

/**
 * Options to configure multipart/form-data parsing limits and behavior.
 */
interface FormDataHandlerOptions {
  /** Maximum total size of all uploaded files in MiB. */
  filesSizeLimit: number
  /** Maximum size of a single uploaded file in MiB. */
  singleFileSizeLimit: number

  /** Maximum cumulative size of all fields in bytes. */
  fieldsSizeLimit: number
  /** Maximum number of non-file fields. */
  fieldsLimit: number

  /** Maximum number of files allowed. */
  filesLimit: number
  /** Whether to allow uploading empty files. */
  allowEmptyFiles: boolean
}

/**
 * Parses multipart/form-data requests into JSON fields and file buffers.
 * Uses formidable under the hood with in-memory buffering.
 *
 * @param req verified incoming HTTP message to parse.
 * @param options optional limits for files and fields.
 * @returns promise resolving to a RequestProcessorResponse
 * containing parsed fields and an array of IncomingFile instances.
 */
export default async function formDataHandler(
  req: Internal.Requests.VerifiedIncomingMessage,
  options?: FormDataHandlerOptions
): Promise<Internal.Requests.RequestProcessorResponse> {
  // Temporary buffer storage for file data keyed by generated filename
  const buffers: Record<string, Buffer> = {}

  // Parse the request using formidable with custom options
  const [fields, files] = await formidable({
    maxTotalFileSize: (options?.filesSizeLimit ?? 100) * 1024 * 1024,
    maxFileSize: (options?.singleFileSizeLimit ?? 10) * 1024 * 1024,
    maxFiles: options?.filesLimit ?? 10,
    allowEmptyFiles: options?.allowEmptyFiles ?? false,
    maxFieldsSize: (options?.fieldsSizeLimit ?? 5) * 1024 * 1024,
    maxFields: options?.fieldsLimit,
    filename: () => crypto.randomUUID(),

    // Custom write stream to collect file chunks in memory
    fileWriteStreamHandler: (file: any) => {
      const chunks: Buffer[] = []

      return new Writable({
        write(chunk, _enc, cb) {
          chunks.push(chunk)
          cb()
        },
        final(cb) {
          buffers[file.newFilename] = Buffer.concat(chunks)
          cb()
        }
      })
    }
  }).parse(req)

  // Transform formidable file output into IncomingFile instances
  const incomingFiles = nonNullable(
    Object.entries(files).map(([key, fileArray]) =>
      fileArray
        ?.map(file => new IncomingFile({
          key,
          name: file.newFilename,
          originalName: file.originalFilename ?? "",
          mimeType: file.mimetype ?? "application/octet-stream",
          buffer: buffers[file.newFilename]
        }))
    )
  ).flat()

  // Return parsed fields and files
  return {
    body: new IncomingBody(fields),
    files: incomingFiles
  }
}
