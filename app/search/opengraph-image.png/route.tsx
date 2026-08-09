import { buildOgImage } from "../../../lib/og"

export const dynamic = "force-static"
export const contentType = "image/png"

export async function GET() {
  return buildOgImage({
    title: "料理名・食材名を検索",
    titleSize: 72,
    subtitle: "コンフィ、ブッラータ、アヒージョ…",
  })
}
