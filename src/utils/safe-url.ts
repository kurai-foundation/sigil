export default function safeUrl(url: string) {
  try {
    return new URL(url)
  }
  catch {
    return null
  }
}