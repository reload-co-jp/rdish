import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "お気に入り",
  robots: { index: false, follow: false },
  openGraph: {
    title: "お気に入り",
    images: [
      {
        url: "/favorites/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "お気に入り | RDish",
      },
    ],
  },
}

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
