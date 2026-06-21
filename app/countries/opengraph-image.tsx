import { buildOgImage, ogContentType, ogSize } from "../../lib/og"

export const dynamic = "force-static"
export const alt = "国・地域別 料理一覧 | RDish"
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
  return buildOgImage({
    title: "国・地域別 料理一覧",
    subtitle: "フランス・イタリア・スペインほか世界各国の料理",
  })
}
