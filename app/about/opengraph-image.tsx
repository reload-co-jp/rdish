import { buildOgImage, ogContentType, ogSize } from "../../lib/og"

export const dynamic = "force-static"
export const alt = "RDishについて | RDish"
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return buildOgImage({
    title: ["いつでも聞ける、", "飾らない料理図鑑。"],
    subtitle: "株式会社Reload 制作・運営",
  })
}
