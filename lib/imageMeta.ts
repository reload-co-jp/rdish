import path from "path"
import sharp from "sharp"

export type ImageMeta = { path: string; width: number; height: number }

export async function getImageMeta(
  imagePath: string
): Promise<ImageMeta | null> {
  try {
    const filePath = path.join(process.cwd(), "public", imagePath)
    const metadata = await sharp(filePath).metadata()
    if (!metadata.width || !metadata.height) return null
    return { path: imagePath, width: metadata.width, height: metadata.height }
  } catch {
    return null
  }
}

export async function getImagesMeta(
  imagePaths: string[]
): Promise<ImageMeta[]> {
  const results = await Promise.all(imagePaths.map(getImageMeta))
  return results.filter((meta): meta is ImageMeta => meta !== null)
}
