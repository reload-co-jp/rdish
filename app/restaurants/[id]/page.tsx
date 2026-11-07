import { notFound } from "next/navigation"
import { Breadcrumb } from "../../../components/elements/Breadcrumb"
import AdSense from "../../../components/elements/AdSense"
import { DishCard } from "../../../components/features/DishCard"
import {
  allRestaurants,
  dishesForRestaurant,
  restaurantById,
  restaurantLocation,
  restaurantPath,
} from "../../../lib/restaurants"

const SITE_URL = "https://rdish.reload.co.jp"

// output: "export" は空配列を許さないため、未掲載時はダミーidで404ページだけ生成する
const EMPTY_PLACEHOLDER_ID = "_"

export const dynamicParams = false

export function generateStaticParams() {
  if (allRestaurants.length === 0) return [{ id: EMPTY_PLACEHOLDER_ID }]
  return allRestaurants.map(({ id }) => ({ id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const restaurant = restaurantById(id)
  if (!restaurant) return {}
  const path = restaurantPath(restaurant.id)
  const dishNames = dishesForRestaurant(restaurant)
    .slice(0, 3)
    .map(({ dish }) => dish.name)
    .join("、")
  const title = `${restaurant.name}（${restaurantLocation(restaurant)}）で食べられる料理`
  const description =
    `${restaurant.description} ${dishNames}など${restaurant.dishes.length}品の料理解説。`
      .slice(0, 160)
      .trimEnd()
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
    ...(restaurant.closed ? { robots: { index: false } } : {}),
  }
}

const label: React.CSSProperties = {
  color: "var(--c-text-sub)",
  fontSize: "0.8125rem",
  fontWeight: 700,
  whiteSpace: "nowrap",
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const restaurant = restaurantById(id)
  if (!restaurant) notFound()
  const path = restaurantPath(restaurant.id)
  const items = dishesForRestaurant(restaurant)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    url: `${SITE_URL}${path}`,
    servesCuisine: restaurant.cuisines,
    description: restaurant.description,
    address: {
      "@type": "PostalAddress",
      addressCountry: "JP",
      addressRegion: restaurant.prefecture,
      ...(restaurant.area ? { addressLocality: restaurant.area } : {}),
      ...(restaurant.address ? { streetAddress: restaurant.address } : {}),
    },
    ...(restaurant.url ? { sameAs: [restaurant.url] } : {}),
    hasMenu: {
      "@type": "Menu",
      hasMenuItem: items.map(({ dish, entry }) => ({
        "@type": "MenuItem",
        name: entry.menuName ?? dish.name,
        description: dish.summary,
        url: `${SITE_URL}/dishes/${dish.id}/`,
      })),
    },
  }

  const facts: [string, React.ReactNode][] = [
    ["ジャンル", restaurant.cuisines.join("・")],
    ["エリア", restaurantLocation(restaurant)],
    ...(restaurant.address
      ? [["住所", restaurant.address] as [string, string]]
      : []),
    ...(restaurant.nearestStation
      ? [["最寄り駅", restaurant.nearestStation] as [string, string]]
      : []),
    ...(restaurant.url
      ? [
          [
            "公式サイト",
            <a
              key="url"
              href={restaurant.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--c-accent)" }}
            >
              {restaurant.url}
            </a>,
          ] as [string, React.ReactNode],
        ]
      : []),
    ...(restaurant.links ?? []).map(
      (link) =>
        [
          link.label,
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--c-accent)" }}
          >
            {link.url}
          </a>,
        ] as [string, React.ReactNode]
    ),
  ]

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "お店", href: "/restaurants/" },
          { label: restaurant.name, href: path },
        ]}
      />
      {restaurant.kana && (
        <p style={{ color: "var(--c-text-sub)", fontSize: "0.8125rem" }}>
          {restaurant.kana}
        </p>
      )}
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          marginBottom: "0.75rem",
        }}
      >
        {restaurant.name}
      </h1>
      {restaurant.closed && (
        <p
          style={{
            color: "var(--c-text-2)",
            fontWeight: 700,
            marginBottom: "0.75rem",
          }}
        >
          ※ この店舗は閉店しています。
        </p>
      )}
      <p
        style={{
          color: "var(--c-text-2)",
          fontSize: "0.9375rem",
          lineHeight: 1.8,
          margin: "0 0 1.25rem",
        }}
      >
        {restaurant.description}
      </p>
      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "auto minmax(0, 1fr)",
          gap: "0.5rem 1rem",
          margin: "0 0 0.75rem",
          fontSize: "0.9375rem",
          overflowWrap: "anywhere",
        }}
      >
        {facts.map(([k, v]) => (
          <div key={k} style={{ display: "contents" }}>
            <dt style={label}>{k}</dt>
            <dd style={{ margin: 0 }}>{v}</dd>
          </div>
        ))}
      </dl>
      {restaurant.checkedAt && (
        <p
          style={{
            color: "var(--c-text-sub)",
            fontSize: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          情報確認日: {restaurant.checkedAt}
          （メニュー・営業状況は変わることがあります。来店前に公式情報をご確認ください）
        </p>
      )}

      {restaurant.sources && restaurant.sources.length > 0 && (
        <details
          style={{
            color: "var(--c-text-sub)",
            fontSize: "0.75rem",
            margin: "0 0 1.5rem",
          }}
        >
          <summary>情報元</summary>
          <ul style={{ margin: "0.25rem 0 0", paddingLeft: "1.25rem" }}>
            {restaurant.sources.map((src) => (
              <li key={src} style={{ overflowWrap: "anywhere" }}>
                <a href={src} target="_blank" rel="noopener noreferrer">
                  {decodeURI(src)}
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}

      <h2
        style={{
          fontSize: "1.125rem",
          fontWeight: 700,
          borderBottom: "2px solid var(--c-border)",
          paddingBottom: "0.375rem",
          margin: "1.5rem 0 0.75rem",
        }}
      >
        このお店で食べられる料理（{items.length}品）
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {items.map(({ dish, entry }) => (
          <div key={dish.id}>
            {(entry.menuName || entry.note) && (
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--c-text-sub)",
                  margin: "0 0 0.25rem",
                }}
              >
                {entry.menuName && <>メニュー名: {entry.menuName}</>}
                {entry.menuName && entry.note && " / "}
                {entry.note}
              </p>
            )}
            <DishCard dish={dish} />
          </div>
        ))}
      </div>
      <AdSense />
    </div>
  )
}
