import { buildOgImage } from "../../../lib/og"

export const dynamic = "force-static"
export const contentType = "image/png"

export async function GET() {
  return buildOgImage({
    title: "カテゴリ別 料理一覧",
    subtitle: "料理・食材・調理法などから探す",
  })
}
