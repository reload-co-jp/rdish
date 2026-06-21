import { buildOgImage, ogContentType, ogSize } from "../../lib/og"

export const dynamic = "force-static"
export const alt = "料理名・食材名を検索 | RDish"
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return buildOgImage({
    title: "料理名・食材名を検索",
    titleSize: 72,
    subtitle: "コンフィ、ブッラータ、アヒージョ…",
  })
}
