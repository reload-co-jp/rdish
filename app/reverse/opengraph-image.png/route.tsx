import { buildOgImage } from "../../../lib/og"

export const dynamic = "force-static"
export const contentType = "image/png"

export async function GET() {
  return buildOgImage({
    title: "逆引き検索",
    subtitle: "「白くてとろっとしたチーズ」「緑色で渦巻きの野菜」",
  })
}
