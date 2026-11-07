import Link from "next/link"
import { Breadcrumb } from "../../components/elements/Breadcrumb"
import {
  openRestaurants,
  restaurantLocation,
  restaurantPath,
  restaurantsByPrefecture,
} from "../../lib/restaurants"

const SITE_URL = "https://rdish.reload.co.jp"

const title = `料理が食べられるお店（全${openRestaurants.length}件）`
const description =
  "RDishの料理図鑑で紹介している料理を実際に食べられる飲食店の一覧。料理名からお店を、お店から料理を探せます。"

export const metadata = {
  title,
  description,
  alternates: { canonical: "/restaurants/" },
  openGraph: { title, description, url: "/restaurants/" },
}

export default function RestaurantsPage() {
  const groups = restaurantsByPrefecture()
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "料理が食べられるお店",
    url: `${SITE_URL}/restaurants/`,
    numberOfItems: openRestaurants.length,
    itemListElement: openRestaurants.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}${restaurantPath(r.id)}`,
      name: r.name,
    })),
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb items={[{ label: "お店", href: "/restaurants/" }]} />
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          marginBottom: "0.375rem",
        }}
      >
        料理が食べられるお店
      </h1>
      <p
        style={{
          color: "var(--c-text-sub)",
          fontSize: "0.875rem",
          marginBottom: "0.75rem",
        }}
      >
        全{openRestaurants.length}件
      </p>
      <p
        style={{
          color: "var(--c-text-2)",
          fontSize: "0.9375rem",
          lineHeight: 1.8,
          margin: "0 0 1.5rem",
        }}
      >
        図鑑で紹介している料理を実際に食べられるお店をまとめています。各店舗ページから提供されている料理の解説へ移動できます。
      </p>
      {groups.length === 0 ? (
        <p style={{ color: "var(--c-text-sub)" }}>掲載店舗は準備中です。</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {groups.map((group) => (
            <section key={group.prefecture}>
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "var(--c-text-2)",
                  borderBottom: "2px solid var(--c-border)",
                  paddingBottom: "0.375rem",
                  marginBottom: "0.75rem",
                }}
              >
                {group.prefecture}
              </h2>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {group.restaurants.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={restaurantPath(r.id)}
                      className="story"
                      style={{ display: "block", textDecoration: "none" }}
                    >
                      <span className="meta">
                        {r.cuisines.join("・")} — {restaurantLocation(r)}
                      </span>
                      <span
                        className="story__title"
                        style={{ display: "block" }}
                      >
                        {r.name}
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.875rem",
                          color: "var(--c-text-sub)",
                        }}
                      >
                        {r.dishes.length}品の料理を掲載
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
