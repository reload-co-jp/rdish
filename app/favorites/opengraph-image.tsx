import { buildOgImage, ogContentType, ogSize } from "../../lib/og"

export const dynamic = "force-static"
export const alt = "お気に入り | RDish"
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return buildOgImage({
    title: "お気に入り",
    titleSize: 72,
    subtitle: "気になった料理をブックマーク",
  })
}
