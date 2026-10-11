import Image from "next/image"
import { FC } from "react"
import Link from "next/link"
import type {
  ArticleCallout,
  ArticleComparisonRow,
  ArticleDishEntry,
  ArticleHistoryEntry,
  ArticleRegion,
  ArticleSource,
} from "../../../types/article"
import type { DishItem } from "../../../types/dish"

export const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: "var(--fs-xl)",
  fontWeight: 600,
  color: "var(--c-text)",
  marginBottom: "var(--sp-6)",
  paddingBottom: "var(--sp-3)",
  borderBottom: "1px solid var(--c-text)",
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 700,
  color: "var(--c-text-sub)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  minWidth: "4.5rem",
  paddingTop: "0.125rem",
  flexShrink: 0,
}

const valueStyle: React.CSSProperties = {
  fontSize: "var(--fs-md)",
  color: "var(--c-text)",
  lineHeight: 1.6,
}

const PropertyList: FC<{ items: { label: string; value: string }[] }> = ({
  items,
}) => (
  <dl
    style={{
      margin: "0.5rem 0 0",
      display: "flex",
      flexDirection: "column",
      gap: "0.375rem",
    }}
  >
    {items.map((item) => (
      <div key={item.label} style={{ display: "flex", gap: "0.75rem" }}>
        <dt style={labelStyle}>{item.label}</dt>
        <dd style={{ ...valueStyle, margin: 0 }}>{item.value}</dd>
      </div>
    ))}
  </dl>
)

const DifferenceList: FC<{ items: { label: string; value: string }[] }> = ({
  items,
}) => (
  <div style={{ marginTop: "0.75rem" }}>
    <p
      style={{
        fontSize: "0.7rem",
        fontWeight: 700,
        color: "var(--c-text-sub)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: "0.375rem",
      }}
    >
      他との違い
    </p>
    <dl style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      {items.map((item) => (
        <div
          key={item.label}
          style={{ display: "flex", gap: "0.625rem", alignItems: "baseline" }}
        >
          <dt
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "var(--c-accent)",
              minWidth: "5rem",
              flexShrink: 0,
            }}
          >
            {item.label}
          </dt>
          <dd
            style={{
              fontSize: "var(--fs-md)",
              color: "var(--c-text-2)",
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  </div>
)

const DishEntry: FC<{ entry: ArticleDishEntry; allDishes: DishItem[] }> = ({
  entry,
  allDishes,
}) => {
  const dish = entry.dishId
    ? allDishes.find((d) => d.id === entry.dishId)
    : null
  const image = dish?.images?.[0]

  return (
    <div
      style={{
        marginBottom: "1.5rem",
        paddingBottom: "1.5rem",
        borderBottom: "1px solid var(--c-border)",
      }}
    >
      <div
        style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}
      >
        {image && (
          <div style={{ flexShrink: 0 }}>
            <Link
              href={`/dishes/${entry.dishId}/`}
              style={{ display: "block" }}
            >
              <Image
                src={image}
                alt={dish?.name ?? entry.heading}
                width={96}
                height={72}
                style={{
                  borderRadius: "var(--radius)",
                  objectFit: "cover",
                  display: "block",
                  border: "1px solid var(--c-border)",
                }}
              />
            </Link>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--fs-lg)",
              fontWeight: 600,
              color: "var(--c-text)",
              marginBottom: "0.25rem",
            }}
          >
            {entry.dishId ? (
              <Link
                href={`/dishes/${entry.dishId}/`}
                style={{
                  color: "var(--c-text)",
                  textDecoration: "underline",
                  textDecorationColor: "var(--c-border)",
                }}
              >
                {entry.heading}
              </Link>
            ) : (
              entry.heading
            )}
          </h3>
          <PropertyList items={entry.properties} />
        </div>
      </div>

      {entry.differences && entry.differences.length > 0 && (
        <DifferenceList items={entry.differences} />
      )}

      {entry.note && (
        <p
          style={{
            marginTop: "0.625rem",
            fontSize: "var(--fs-md)",
            color: "var(--c-text-2)",
            lineHeight: 1.65,
            borderLeft: "2px solid var(--c-border)",
            paddingLeft: "0.75rem",
          }}
        >
          {entry.note}
        </p>
      )}
    </div>
  )
}

export const RegionSection: FC<{
  region: ArticleRegion
  allDishes: DishItem[]
}> = ({ region, allDishes }) => (
  <section style={{ marginBottom: "var(--sp-12)" }}>
    <h2 style={sectionHeadingStyle}>{region.heading}</h2>
    {region.intro && (
      <p
        style={{
          fontSize: "var(--fs-md)",
          color: "var(--c-text-2)",
          lineHeight: 1.75,
          marginBottom: "1.25rem",
        }}
      >
        {region.intro}
      </p>
    )}
    {region.dishes.map((dish) => (
      <DishEntry key={dish.heading} entry={dish} allDishes={allDishes} />
    ))}
  </section>
)

export const HistorySection: FC<{ entries: ArticleHistoryEntry[] }> = ({
  entries,
}) => (
  <section style={{ marginBottom: "var(--sp-12)" }}>
    <h2 style={sectionHeadingStyle}>歴史と伝播</h2>
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {entries.map((entry) => (
        <div
          key={entry.period}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem 1rem",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: "7rem",
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "var(--c-accent)",
              paddingTop: "0.2rem",
              lineHeight: 1.4,
            }}
          >
            {entry.period}
          </div>
          <div
            style={{
              flex: "1 1 16rem",
              borderLeft: "2px solid var(--c-border)",
              paddingLeft: "1rem",
            }}
          >
            <p
              style={{
                fontSize: "var(--fs-md)",
                fontWeight: 700,
                color: "var(--c-text)",
                marginBottom: "0.25rem",
              }}
            >
              {entry.heading}
            </p>
            <p
              style={{
                fontSize: "var(--fs-md)",
                color: "var(--c-text-2)",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {entry.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  </section>
)

export const ComparisonSection: FC<{ rows: ArticleComparisonRow[] }> = ({
  rows,
}) => (
  <section style={{ marginBottom: "var(--sp-12)" }}>
    <h2 style={sectionHeadingStyle}>比較まとめ</h2>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {rows.map((row) => (
        <div
          key={row.name}
          style={{
            background: row.soupInside ? "var(--c-bg)" : "var(--c-bg)",
            border: `1px solid ${row.soupInside ? "var(--c-border)" : "var(--c-border)"}`,
            borderRadius: "var(--radius)",
            padding: "0.625rem 0.875rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.375rem 1.25rem",
            alignItems: "baseline",
          }}
        >
          <span
            style={{ fontWeight: 700, fontSize: "0.9375rem", minWidth: "7rem" }}
          >
            {row.dishId ? (
              <Link
                href={`/dishes/${row.dishId}/`}
                style={{
                  color: "var(--c-text)",
                  textDecoration: "underline",
                  textDecorationColor: "var(--c-border)",
                }}
              >
                {row.name}
              </Link>
            ) : (
              row.name
            )}
            {row.soupInside && (
              <span
                style={{
                  marginLeft: "0.375rem",
                  fontSize: "0.65rem",
                  color: "var(--c-accent)",
                  fontWeight: 700,
                  background: "var(--c-tint)",
                  padding: "0.05rem 0.4rem",
                  borderRadius: "var(--radius)",
                }}
              >
                スープ封入
              </span>
            )}
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--c-text-2)",
              background: "var(--c-tint)",
              padding: "0.1rem 0.5rem",
              borderRadius: "var(--radius)",
            }}
          >
            {row.region}
          </span>
          {row.details ? (
            row.details.map((d) => (
              <span
                key={d.label}
                style={{ fontSize: "var(--fs-md)", color: "var(--c-text-2)" }}
              >
                {d.label}: {d.value}
              </span>
            ))
          ) : (
            <>
              {row.skin && (
                <span
                  style={{ fontSize: "var(--fs-md)", color: "var(--c-text-2)" }}
                >
                  皮: {row.skin}
                </span>
              )}
              {row.filling && (
                <span
                  style={{ fontSize: "var(--fs-md)", color: "var(--c-text-2)" }}
                >
                  具: {row.filling}
                </span>
              )}
              {row.cooking && (
                <span
                  style={{ fontSize: "var(--fs-md)", color: "var(--c-text-2)" }}
                >
                  調理: {row.cooking}
                </span>
              )}
              {row.eatStyle && (
                <span
                  style={{ fontSize: "var(--fs-md)", color: "var(--c-text-2)" }}
                >
                  食べ方: {row.eatStyle}
                </span>
              )}
            </>
          )}
        </div>
      ))}
    </div>
    {rows.some((row) => row.soupInside) && (
      <p
        style={{
          marginTop: "0.625rem",
          fontSize: "0.75rem",
          color: "var(--c-text-sub)",
        }}
      >
        ★ オレンジ背景＝スープが皮の内側に封じ込められている
      </p>
    )}
  </section>
)

export const CalloutSection: FC<{ callout: ArticleCallout }> = ({
  callout,
}) => (
  <section
    style={{
      marginBottom: "1.5rem",
      background: "var(--c-bg)",
      border: "1px solid var(--c-border)",
      borderRadius: "var(--radius)",
      padding: "1.25rem",
    }}
  >
    <h2
      style={{
        fontFamily: "var(--font-serif)",
        fontSize: "var(--fs-lg)",
        fontWeight: 600,
        color: "var(--c-text)",
        marginBottom: "var(--sp-3)",
      }}
    >
      {callout.heading}
    </h2>
    <p
      style={{
        fontSize: "var(--fs-md)",
        color: "var(--c-text-2)",
        lineHeight: 1.7,
        margin: 0,
      }}
    >
      {callout.body}
    </p>
    {callout.items && callout.items.length > 0 && (
      <ul
        style={{
          margin: "0.75rem 0 0",
          paddingLeft: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: "0.375rem",
        }}
      >
        {callout.items.map((item) => (
          <li
            key={item.name}
            style={{
              fontSize: "var(--fs-md)",
              color: "var(--c-text-2)",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <span style={{ fontWeight: 700, minWidth: "6rem", flexShrink: 0 }}>
              {item.name}
            </span>
            <span>{item.description}</span>
          </li>
        ))}
      </ul>
    )}
  </section>
)

export const SourcesSection: FC<{ sources: ArticleSource[] }> = ({
  sources,
}) => (
  <section
    style={{
      marginTop: "2.5rem",
      paddingTop: "1.5rem",
      borderTop: "1px solid var(--c-border)",
    }}
  >
    <h2
      style={{
        fontSize: "0.75rem",
        fontWeight: 700,
        color: "var(--c-text-sub)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: "0.75rem",
      }}
    >
      参考資料
    </h2>
    <ol
      style={{
        margin: 0,
        paddingLeft: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      {sources.map((source, i) => (
        <li
          key={i}
          style={{
            fontSize: "var(--fs-md)",
            color: "var(--c-text-2)",
            lineHeight: 1.6,
          }}
        >
          {source.author && (
            <span style={{ color: "var(--c-text-2)" }}>{source.author}. </span>
          )}
          {source.url ? (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--c-accent)",
                textDecoration: "underline",
                textDecorationColor: "var(--c-border)",
              }}
            >
              {source.title}
            </a>
          ) : (
            <span style={{ color: "var(--c-text-2)", fontStyle: "italic" }}>
              {source.title}
            </span>
          )}
          {source.note && (
            <span style={{ color: "var(--c-text-sub)" }}> — {source.note}</span>
          )}
        </li>
      ))}
    </ol>
  </section>
)
