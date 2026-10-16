import Image from "next/image"
import Link from "next/link"
import { FC } from "react"
import { articlesForDish } from "../../lib/articles"
import {
  comparisonBySlug,
  comparisonPath,
  comparisonSlug,
} from "../../lib/comparisons"
import {
  combosForDish,
  comboHref,
  comboTagName,
} from "../../lib/countryTagCombos"
import { regionLabel } from "../../lib/region"
import { dishesUsingSpice, isSpiceOrCondiment } from "../../lib/spiceUsage"
import { categoryPath, countryPath } from "../../lib/taxonomy"
import type { DishItem } from "../../types/dish"
import { LinkedText } from "../elements/LinkedText"
import { CATEGORY_EN } from "../../lib/editorial"
import { FavoriteButton } from "./FavoriteButton"
import { ScoreBadge } from "./ScoreBadge"
import { TagList } from "./TagList"
import AdSense from "../elements/AdSense"

type Props = {
  dish: DishItem
  allDishes: DishItem[]
  updatedAt?: string
}

const Section: FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="dish-section">
    <h2>{title}</h2>
    {children}
  </section>
)

export const DishDetail: FC<Props> = ({ dish, allDishes, updatedAt }) => {
  const relatedDishes = dish.relatedIds
    .map((id) => allDishes.find((d) => d.id === id))
    .filter(Boolean) as DishItem[]
  const articles = articlesForDish(dish.id)
  const combos = combosForDish(dish).slice(0, 4)
  const usedInDishes = isSpiceOrCondiment(dish)
    ? dishesUsingSpice(dish, allDishes)
    : []

  return (
    <article>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <span className="eyebrow" style={{ marginBottom: "var(--sp-3)" }}>
            {CATEGORY_EN[dish.category] ?? "Dictionary"}
          </span>
          <h1
            style={{
              fontSize: "var(--fs-2xl)",
              marginBottom: "var(--sp-2)",
            }}
          >
            {dish.name}
          </h1>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {dish.kana && (
              <span
                style={{ color: "var(--c-text-sub)", fontSize: "0.875rem" }}
              >
                {dish.kana}
              </span>
            )}
            {dish.englishName && (
              <span
                style={{ color: "var(--c-text-sub)", fontSize: "0.875rem" }}
              >
                / {dish.englishName}
              </span>
            )}
            {dish.originalName && dish.originalName !== dish.englishName && (
              <span
                style={{ color: "var(--c-text-sub)", fontSize: "0.875rem" }}
              >
                / {dish.originalName}
              </span>
            )}
            {dish.aliases &&
              dish.aliases.length > 0 &&
              dish.aliases.map((alias) => (
                <span
                  key={alias}
                  style={{ color: "var(--c-text-sub)", fontSize: "0.875rem" }}
                >
                  / {alias}
                </span>
              ))}
          </div>
          <div style={{ marginTop: "0.375rem" }}>
            <Link
              href={categoryPath(dish.category)}
              style={{
                fontSize: "0.75rem",
                color: "var(--c-text-2)",
                background: "var(--c-tint)",
                padding: "0.125rem 0.5rem",
                borderRadius: "var(--radius)",
                textDecoration: "none",
                marginRight: "0.375rem",
              }}
            >
              {dish.category}
            </Link>
            {(() => {
              const groups: {
                country?: string
                area?: string
                prefecture?: string
                items: typeof dish.regions
              }[] = []
              for (const r of dish.regions) {
                const g = groups.find(
                  (x) =>
                    x.country === r.country &&
                    x.prefecture === r.prefecture &&
                    x.area === r.area
                )
                if (g) g.items.push(r)
                else
                  groups.push({
                    country: r.country,
                    area: r.area,
                    prefecture: r.prefecture,
                    items: [r],
                  })
              }
              const linkStyle = {
                color: "var(--c-text-sub)",
                textDecoration: "underline",
                textDecorationColor: "var(--c-border)",
                textUnderlineOffset: "3px",
              } as const
              return groups.map((g, gi) => {
                if (g.prefecture && g.items.length > 1) {
                  return (
                    <span
                      key={`group-${gi}`}
                      style={{ marginRight: "0.375rem", fontSize: "0.75rem" }}
                    >
                      <span style={{ color: "var(--c-text-sub)" }}>
                        {g.prefecture}（
                      </span>
                      {g.items.map((r, i) => (
                        <span key={`${r.locality}-${i}`}>
                          {i > 0 && "・"}
                          <Link
                            href={countryPath(regionLabel(r))}
                            style={linkStyle}
                          >
                            {r.locality}
                          </Link>
                        </span>
                      ))}
                      <span style={{ color: "var(--c-text-sub)" }}>）</span>
                    </span>
                  )
                }
                const label = regionLabel(g.items[0])
                return (
                  <Link
                    key={`${label}-${gi}`}
                    href={countryPath(label)}
                    style={{
                      fontSize: "0.75rem",
                      marginRight: "0.375rem",
                      ...linkStyle,
                    }}
                  >
                    {label}
                  </Link>
                )
              })
            })()}
          </div>
        </div>
        <FavoriteButton id={dish.id} />
      </div>

      <AdSense />

      {dish.images && dish.images.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            overflowX: "auto",
            marginBottom: "var(--sp-12)",
            scrollSnapType: "x mandatory",
          }}
        >
          {dish.images.map((src, i) => (
            <div
              key={src}
              style={{
                flexShrink: 0,
                width: dish.images!.length === 1 ? "100%" : "85%",
                maxWidth: dish.images!.length === 1 ? "none" : "36rem",
                aspectRatio: "3/2",
                overflow: "hidden",
                position: "relative",
                scrollSnapAlign: "start",
                background: "var(--c-tint)",
              }}
            >
              <Image
                src={src}
                alt={
                  i === 0
                    ? `${dish.name}の料理写真`
                    : `${dish.name}の料理写真 ${i + 1}`
                }
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 85vw, 36rem"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      )}

      <Section title="ひとことで">
        <p style={{ fontSize: "1rem", lineHeight: 1.7 }}>
          <LinkedText
            text={dish.summary}
            dishes={allDishes}
            currentId={dish.id}
          />
        </p>
      </Section>

      <Section title="メニューで見たら">
        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--c-text-2)",
            lineHeight: 1.7,
          }}
        >
          <LinkedText
            text={dish.menuDescription}
            dishes={allDishes}
            currentId={dish.id}
          />
        </p>
      </Section>

      <Section title="何が出てくるか">
        <ul style={{ paddingLeft: "1rem" }}>
          {dish.whatComesOut.map((item) => (
            <li
              key={item}
              style={{
                fontSize: "0.9rem",
                color: "var(--c-text-2)",
                marginBottom: "0.25rem",
              }}
            >
              <LinkedText text={item} dishes={allDishes} currentId={dish.id} />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="味・食感">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
          {dish.tasteAndTexture.map((t) => (
            <span
              key={t}
              style={{
                background: "var(--c-tint)",
                color: "var(--c-accent)",
                borderRadius: "var(--radius)",
                padding: "0.25rem 0.625rem",
                fontSize: "0.875rem",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </Section>

      <Section title="頼む判断">
        <div
          style={{
            background: "var(--c-tint)",
            border: "1px solid var(--c-border)",
            borderRadius: "var(--radius)",
            padding: "0.75rem 1rem",
          }}
        >
          <p
            style={{
              color: "var(--c-accent)",
              fontSize: "0.9rem",
              fontWeight: 700,
              lineHeight: 1.5,
              marginBottom: "0.375rem",
            }}
          >
            {dish.name}を注文するときのコツは？
          </p>
          <p
            style={{
              color: "var(--c-accent)",
              fontSize: "0.9rem",
              lineHeight: 1.7,
            }}
          >
            <LinkedText
              text={dish.orderAdvice}
              dishes={allDishes}
              currentId={dish.id}
            />
          </p>
        </div>
        {dish.caution && (
          <div
            style={{
              background: "var(--c-tint)",
              border: "1px solid var(--c-text-sub)",
              borderRadius: "var(--radius)",
              marginTop: "0.5rem",
              padding: "0.75rem 1rem",
            }}
          >
            <p
              style={{
                color: "var(--c-accent)",
                fontSize: "0.875rem",
                fontWeight: 700,
                lineHeight: 1.5,
                marginBottom: "0.375rem",
              }}
            >
              {dish.name}を食べるときの注意点は？
            </p>
            <p
              style={{
                color: "var(--c-accent)",
                fontSize: "0.875rem",
                lineHeight: 1.7,
              }}
            >
              <LinkedText
                text={dish.caution}
                dishes={allDishes}
                currentId={dish.id}
              />
            </p>
          </div>
        )}
      </Section>

      <Section title="スコア">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <ScoreBadge label="初心者向け" score={dish.beginnerFriendlyScore} />
          <ScoreBadge label="個性" score={dish.uniquenessScore} />
          <ScoreBadge label="重さ" score={dish.heavinessScore} />
          <ScoreBadge label="辛さ" score={dish.spicinessScore} />
        </div>
      </Section>

      <AdSense />

      {dish.similarItems.length > 0 && (
        <Section title="似ているもの">
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {dish.similarItems.map((s) => {
              const similarDish = s.id
                ? allDishes.find((d) => d.id === s.id)
                : undefined
              const thumb = similarDish?.images?.[0]
              return (
                <div
                  key={s.name}
                  style={{
                    background: "var(--c-bg)",
                    border: "1px solid var(--c-border)",
                    borderRadius: "var(--radius)",
                    padding: "0.625rem 0.875rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  {thumb && (
                    <div
                      style={{
                        position: "relative",
                        flexShrink: 0,
                        width: "3rem",
                        height: "3rem",
                        borderRadius: "var(--radius)",
                        overflow: "hidden",
                        background: "var(--c-tint)",
                      }}
                    >
                      <Image
                        src={thumb}
                        alt={s.name}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="48px"
                      />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {s.id ? (
                      <Link
                        href={`/dishes/${s.id}/`}
                        style={{
                          color: "var(--c-accent)",
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        {s.name}
                      </Link>
                    ) : (
                      <span style={{ color: "var(--c-text)", fontWeight: 600 }}>
                        {s.name}
                      </span>
                    )}
                    <span
                      style={{
                        color: "var(--c-text-sub)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {" "}
                      — {s.difference}
                    </span>
                    {s.id &&
                      comparisonBySlug(comparisonSlug(dish.id, s.id)) && (
                        <Link
                          href={comparisonPath(comparisonSlug(dish.id, s.id))}
                          style={{
                            color: "var(--c-accent)",
                            display: "inline-block",
                            fontSize: "0.75rem",
                            marginLeft: "0.375rem",
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          違いを詳しく →
                        </Link>
                      )}
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {usedInDishes.length > 0 && (
        <Section title={`${dish.name}が使われている料理`}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {usedInDishes.map((d) => (
              <Link
                key={d.id}
                href={`/dishes/${d.id}/`}
                style={{
                  background: "var(--c-bg)",
                  border: "1px solid var(--c-border)",
                  borderRadius: "var(--radius)",
                  color: "var(--c-accent)",
                  fontSize: "0.875rem",
                  padding: "0.375rem 0.75rem",
                  textDecoration: "none",
                }}
              >
                {d.name}
              </Link>
            ))}
          </div>
        </Section>
      )}

      {relatedDishes.length > 0 && (
        <Section title="関連用語">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {relatedDishes.map((d) => (
              <Link
                key={d.id}
                href={`/dishes/${d.id}/`}
                style={{
                  background: "var(--c-tint)",
                  border: "1px solid var(--c-border)",
                  borderRadius: "var(--radius)",
                  color: "var(--c-accent)",
                  fontSize: "0.875rem",
                  padding: "0.375rem 0.75rem",
                  textDecoration: "none",
                }}
              >
                {d.name}
              </Link>
            ))}
          </div>
        </Section>
      )}

      {articles.length > 0 && (
        <Section title="特集記事">
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}/`}
                style={{
                  background: "var(--c-bg)",
                  border: "1px solid var(--c-border)",
                  borderRadius: "var(--radius)",
                  color: "var(--c-accent)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  padding: "0.625rem 0.875rem",
                  textDecoration: "none",
                }}
              >
                {article.title}
                {article.subtitle && (
                  <span style={{ color: "var(--c-text-sub)", fontWeight: 400 }}>
                    ——{article.subtitle}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section title="タグ">
        <TagList tags={dish.tags} />
      </Section>

      <AdSense />

      <Section title="もっと見る">
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {dish.regions.length > 0 && (
            <Link
              href={countryPath(regionLabel(dish.regions[0]))}
              style={{
                color: "var(--c-accent)",
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              → {regionLabel(dish.regions[0])}の他の料理を見る
            </Link>
          )}
          <Link
            href={categoryPath(dish.category)}
            style={{
              color: "var(--c-accent)",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            → {dish.category}の他の料理を見る
          </Link>
          {combos.map((combo) => (
            <Link
              key={`${combo.kind}-${combo.tagId}`}
              href={comboHref(combo)}
              style={{
                color: "var(--c-accent)",
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              → {combo.countryLabel}の{comboTagName(combo)}一覧を見る
            </Link>
          ))}
          <Link
            href="/dishes/"
            style={{
              color: "var(--c-accent)",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            → すべての料理を一覧で見る
          </Link>
          <Link
            href="/reverse/"
            style={{
              color: "var(--c-accent)",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            → 名前がわからない料理を逆引き検索
          </Link>
        </div>
      </Section>

      {updatedAt && (
        <p
          style={{
            color: "var(--c-text-sub)",
            fontSize: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          最終更新: {updatedAt}
        </p>
      )}

      {dish.source && dish.source.length > 0 && (
        <Section title="参考">
          <ul style={{ paddingLeft: 0, listStyle: "none" }}>
            {dish.source.map((url) => {
              const label = url.includes("ja.wikipedia.org")
                ? "Wikipedia（日本語）"
                : url.includes("en.wikipedia.org")
                  ? "Wikipedia（英語）"
                  : url.includes("it.wikipedia.org")
                    ? "Wikipedia（イタリア語）"
                    : url.includes("britannica.com")
                      ? "Britannica"
                      : url.includes("tasteatlas.com")
                        ? "TasteAtlas"
                        : url
              return (
                <li key={url} style={{ marginBottom: "0.25rem" }}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--c-text-2)", fontSize: "0.8rem" }}
                  >
                    {label}
                  </a>
                </li>
              )
            })}
          </ul>
        </Section>
      )}
    </article>
  )
}
