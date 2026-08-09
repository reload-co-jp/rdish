import { buildOgImage } from "../../../lib/og"

export const dynamic = "force-static"
export const contentType = "image/png"

export async function GET() {
  return buildOgImage({
    title: "お気に入り",
    titleSize: 72,
    subtitle: "気になった料理をブックマーク",
  })
}
