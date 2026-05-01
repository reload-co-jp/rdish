import Link from "next/link"
import { FC } from "react"

type Item = { label: string; href?: string }

type Props = { items: Item[] }

export const Breadcrumb: FC<Props> = ({ items }) => {
  const all = [{ label: "ホーム", href: "/" }, ...items]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `https://rdish.reload.co.jp${item.href}` } : {}),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="パンくず"
        style={{
          fontSize: "0.75rem",
          color: "#a89080",
          marginBottom: "1.25rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.25rem",
        }}
      >
        {all.map((item, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            {i > 0 && <span aria-hidden="true" style={{ color: "#e8ddd0" }}>/</span>}
            {item.href && i < all.length - 1 ? (
              <Link href={item.href} style={{ color: "#a89080", textDecoration: "none" }}>
                {item.label}
              </Link>
            ) : (
              <span style={{ color: "#7a6655" }}>{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  )
}
