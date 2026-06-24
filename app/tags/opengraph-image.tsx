import { buildOgImage, ogContentType, ogSize } from "../../lib/og"

export const dynamic = "force-static"
export const alt = "タグ別 料理一覧 | RDish"
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return buildOgImage({
    title: "タグ別 料理一覧",
    subtitle: "料理ジャンル・食材・味・調理法から探す",
  })
}
