import { buildOgImage } from "../../../lib/og"

export const dynamic = "force-static"
export const contentType = "image/png"

export async function GET() {
  return buildOgImage({
    title: "タグ別 料理一覧",
    subtitle: "料理ジャンル・食材・味・調理法から探す",
  })
}
