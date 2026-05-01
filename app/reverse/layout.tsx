import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "逆引き検索 — 特徴から料理名を調べる",
  description: "料理名がわからないとき、見た目・味・特徴から料理名を逆引き検索。「白くてとろっとしたチーズ」など自然な言葉で調べられます。",
  alternates: { canonical: "/reverse/" },
  openGraph: {
    title: "逆引き検索 — 特徴から料理名を調べる",
    description: "料理名がわからないとき、見た目・味・特徴から料理名を逆引き検索。",
    url: "/reverse/",
  },
}

export default function ReverseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
