import { buildOgImage } from "../../../lib/og"

export const dynamic = "force-static"
export const contentType = "image/png"

export async function GET() {
  return buildOgImage({
    title: "国・地域別 料理一覧",
    subtitle: "フランス・イタリア・スペインほか世界各国の料理",
  })
}
