import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "料理を検索",
  description: "料理名・食材名・調理法をキーワードやタグで検索。外食メニューで役立つ料理図鑑 RDish。",
  robots: { index: false, follow: true },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
