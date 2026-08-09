import { buildOgImage } from "../../../lib/og"

export const dynamic = "force-static"
export const contentType = "image/png"

export async function GET() {
  return buildOgImage({
    title: ["いつでも聞ける、", "飾らない料理図鑑。"],
    subtitle: "株式会社Reload 制作・運営",
  })
}
