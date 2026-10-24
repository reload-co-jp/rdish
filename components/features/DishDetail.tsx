import Link from "next/link"
import { CSSProperties, FC, ReactNode } from "react"
import { articlesForDish } from "../../lib/articles"
import {
  comparisonBySlug,
  comparisonPath,
  comparisonSlug,
} from "../../lib/comparisons"
import {
  DIM4_TAG_LABELS,
  combosForDish,
  comboHref,
  comboTagName,
} from "../../lib/countryTagCombos"
import { articleCover, CATEGORY_EN, formatDate } from "../../lib/editorial"
import { regionLabel } from "../../lib/region"
import { dishesUsingSpice, isSpiceOrCondiment } from "../../lib/spiceUsage"
import { FLAVOR_TAGS, PRIMARY_INGREDIENT_TAGS } from "../../lib/tagVocabulary"
import { categoryPath, countryPath } from "../../lib/taxonomy"
import type { DishCategory, DishItem } from "../../types/dish"
import { LinkedText } from "../elements/LinkedText"
import { Photo } from "../elements/Photo"
import AdSense from "../elements/AdSense"
import { FavoriteButton } from "./FavoriteButton"
import { TagList } from "./TagList"

type Props = {
  dish: DishItem
  allDishes: DishItem[]
  updatedAt?: string
}

// 関連用語のグループ分け（カテゴリ → 見出し）
const RELATED_GROUPS: { title: string; categories: DishCategory[] }[] = [
  { title: "関連する料理", categories: ["料理", "デザート"] },
  {
    title: "関連する食材",
    categories: ["食材", "野菜", "肉", "魚介", "チーズ"],
  },
  { title: "関連する調理法", categories: ["調理法"] },
  {
    title: "関連するソース・香辛料・飲み物",
    categories: ["ソース", "香辛料", "飲み物"],
  },
]

// 既存スコアの向き。値の意味は変えず、両端の言葉だけ添える
const SCORES: {
  key: keyof Pick<
    DishItem,
    | "beginnerFriendlyScore"
    | "uniquenessScore"
    | "heavinessScore"
    | "spicinessScore"
  >
  label: string
  low: string
  high: string
}[] = [
  {
    key: "beginnerFriendlyScore",
    label: "初心者向け",
    low: "上級者向け",
    high: "初心者向け",
  },
  { key: "uniquenessScore", label: "個性", low: "定番", high: "個性的" },
  { key: "heavinessScore", label: "重さ", low: "軽い", high: "重い" },
  { key: "spicinessScore", label: "辛さ", low: "辛くない", high: "辛い" },
]

const SOURCE_LABELS: [string, string][] = [
  ["ja.wikipedia.org", "Wikipedia（日本語）"],
  ["en.wikipedia.org", "Wikipedia（英語）"],
  ["it.wikipedia.org", "Wikipedia（イタリア語）"],
  ["britannica.com", "Britannica"],
  ["tasteatlas.com", "TasteAtlas"],
]

function sourceLabel(url: string): string {
  const known = SOURCE_LABELS.find(([host]) => url.includes(host))
  if (known) return known[1]
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

const cardGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 16rem), 1fr))",
  gap: "var(--sp-3)",
}

const card: CSSProperties = {
  background: "var(--c-bg)",
  border: "1px solid var(--c-border)",
  borderRadius: "var(--radius)",
  padding: "var(--sp-3)",
  display: "grid",
  gridTemplateColumns: "4.5rem minmax(0, 1fr)",
  gap: "var(--sp-3)",
  alignItems: "start",
}

const clamp2: CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  fontSize: "var(--fs-sm)",
  color: "var(--c-text-sub)",
  lineHeight: 1.6,
  marginTop: "var(--sp-1)",
}

const textLink: CSSProperties = {
  color: "var(--c-accent)",
  textDecoration: "underline",
  textDecorationColor: "var(--c-border)",
  textUnderlineOffset: "3px",
}

const Section: FC<{ id?: string; title: string; children: ReactNode }> = ({
  id,
  title,
  children,
}) => (
  <section className="dish-section" id={id}>
    <h2>{title}</h2>
    {children}
  </section>
)

// カード群など本文幅を超える領域の見出し
const WideSection: FC<{
  eyebrow: string
  title: string
  children: ReactNode
}> = ({ eyebrow, title, children }) => (
  <section style={{ marginTop: "var(--sp-12)" }}>
    <div className="section-head" style={{ marginBottom: "var(--sp-4)" }}>
      <div className="section-head__title">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
    </div>
    {children}
  </section>
)

// history は「本文\n\n（出典: ...）」形式。出典URLは%エンコードのままだと読めないのでデコードする
const parseHistory = (history?: string) => {
  if (!history) return undefined
  const [body, source] = history.split(/\n+(?=（出典)/)
  let decoded = source
  try {
    decoded = source && decodeURI(source)
  } catch {
    // 不正な%シーケンスは原文のまま表示
  }
  return { body: body.trim(), source: decoded }
}

const Thumb: FC<{ src?: string; alt: string }> = ({ src, alt }) => (
  <Photo
    src={src}
    alt={alt}
    sizes="72px"
    className="dish-card__photo"
    style={{ aspectRatio: "1 / 1", borderRadius: "var(--radius)" }}
  />
)

const DishMiniCard: FC<{ dish: DishItem }> = ({ dish }) => (
  <Link href={`/dishes/${dish.id}/`} className="story" style={card}>
    <Thumb src={dish.images?.[0]} alt={dish.name} />
    <div style={{ minWidth: 0 }}>
      <span className="meta">
        {dish.category}
        {dish.regions[0] ? ` — ${regionLabel(dish.regions[0])}` : ""}
      </span>
      <span
        className="story__title"
        style={{ display: "block", fontSize: "var(--fs-md)" }}
      >
        {dish.name}
      </span>
      <p style={clamp2}>{dish.summary}</p>
    </div>
  </Link>
)

const ScoreMeter: FC<{
  label: string
  low: string
  high: string
  score: number
}> = ({ label, low, high, score }) => (
  <div>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "var(--fs-sm)",
        marginBottom: "var(--sp-1)",
      }}
    >
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span style={{ color: "var(--c-text-2)" }}>{score} / 5</span>
    </div>
    <div
      aria-hidden="true"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "2px",
      }}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{
            height: "6px",
            background: n <= score ? "var(--c-accent)" : "var(--c-border)",
          }}
        />
      ))}
    </div>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "var(--fs-xs)",
        color: "var(--c-text-sub)",
        marginTop: "var(--sp-1)",
      }}
    >
      <span>{low}</span>
      <span>{high}</span>
    </div>
  </div>
)

// 地域リンク。同じ都道府県の複数地域は「県（A・B）」にまとめる
const RegionLinks: FC<{ regions: DishItem["regions"] }> = ({ regions }) => {
  const groups: { key: string; prefecture?: string; items: typeof regions }[] =
    []
  for (const r of regions) {
    const key = `${r.country}|${r.prefecture}|${r.area}`
    const g = groups.find((x) => x.key === key)
    if (g) g.items.push(r)
    else groups.push({ key, prefecture: r.prefecture, items: [r] })
  }
  return (
    <>
      {groups.map((g, gi) => (
        <span key={g.key}>
          {gi > 0 && "、"}
          {g.prefecture && g.items.length > 1 ? (
            <>
              {g.prefecture}（
              {g.items.map((r, i) => (
                <span key={`${r.locality}-${i}`}>
                  {i > 0 && "・"}
                  <Link href={countryPath(regionLabel(r))} style={textLink}>
                    {r.locality}
                  </Link>
                </span>
              ))}
              ）
            </>
          ) : (
            <Link href={countryPath(regionLabel(g.items[0]))} style={textLink}>
              {regionLabel(g.items[0])}
            </Link>
          )}
        </span>
      ))}
    </>
  )
}

export const DishDetail: FC<Props> = ({ dish, allDishes, updatedAt }) => {
  const relatedDishes = dish.relatedIds
    .map((id) => allDishes.find((d) => d.id === id))
    .filter(Boolean) as DishItem[]
  const relatedGroups = RELATED_GROUPS.map((g) => ({
    title: g.title,
    dishes: relatedDishes.filter((d) => g.categories.includes(d.category)),
  })).filter((g) => g.dishes.length > 0)
  const articles = articlesForDish(dish.id)
  const combos = combosForDish(dish).slice(0, 4)
  const usedInDishes = isSpiceOrCondiment(dish)
    ? dishesUsingSpice(dish, allDishes)
    : []
  const [mainImage, ...subImages] = dish.images ?? []
  const isDish = dish.category === "料理" || dish.category === "デザート"
  const history = parseHistory(dish.history)

  const names = [
    dish.kana,
    dish.englishName,
    dish.originalName !== dish.englishName ? dish.originalName : undefined,
  ].filter(Boolean)

  const ingredients = dish.tags.filter((t) =>
    PRIMARY_INGREDIENT_TAGS.includes(t)
  )
  const methods = dish.tags.filter((t) => DIM4_TAG_LABELS.includes(t))
  const flavors = dish.tags.filter((t) => FLAVOR_TAGS.includes(t))
  const facts: { label: string; value: ReactNode }[] = [
    {
      label: "分類",
      value: (
        <Link href={categoryPath(dish.category)} style={textLink}>
          {dish.category}
        </Link>
      ),
    },
    ...(dish.regions.length > 0
      ? [
          {
            label: isDish ? "発祥・地域" : "地域",
            value: <RegionLinks regions={dish.regions} />,
          },
        ]
      : []),
    ...(ingredients.length > 0
      ? [{ label: "主な食材", value: ingredients.join("・") }]
      : []),
    ...(methods.length > 0
      ? [{ label: "調理法", value: methods.join("・") }]
      : []),
    ...(flavors.length > 0
      ? [{ label: "風味", value: flavors.join("・") }]
      : []),
  ]

  const webSources = (dish.source ?? []).filter((s) => s.startsWith("http"))
  const textSources = (dish.source ?? []).filter((s) => !s.startsWith("http"))

  return (
    <article>
      {/* ---------- ファーストビュー ---------- */}
      <header
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 22rem), 1fr))",
          gap: "var(--sp-8)",
          alignItems: "center",
          marginBottom: "var(--sp-8)",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <span className="eyebrow" style={{ marginBottom: "var(--sp-3)" }}>
            {CATEGORY_EN[dish.category] ?? "Dictionary"}
            <span style={{ color: "var(--c-text-sub)", letterSpacing: 0 }}>
              {dish.category}
              {dish.regions[0] ? ` ・ ${regionLabel(dish.regions[0])}` : ""}
            </span>
          </span>
          <h1
            className="serif"
            style={{
              fontSize: "var(--fs-3xl)",
              lineHeight: 1.25,
              overflowWrap: "anywhere",
              marginBottom: "var(--sp-2)",
            }}
          >
            {dish.name}
          </h1>
          {names.length > 0 && (
            <p
              style={{
                color: "var(--c-text-sub)",
                fontSize: "var(--fs-sm)",
                overflowWrap: "anywhere",
              }}
            >
              {names.join(" / ")}
            </p>
          )}
          {dish.aliases && dish.aliases.length > 0 && (
            <p
              style={{
                color: "var(--c-text-sub)",
                fontSize: "var(--fs-sm)",
                marginTop: "var(--sp-1)",
              }}
            >
              別名：{dish.aliases.join("、")}
            </p>
          )}
          <div
            style={{
              borderLeft: "2px solid var(--c-accent)",
              paddingLeft: "var(--sp-4)",
              margin: "var(--sp-6) 0",
              maxWidth: "40em",
            }}
          >
            <h2 className="meta" style={{ marginBottom: "var(--sp-1)" }}>
              ひとことで
            </h2>
            <p style={{ fontSize: "var(--fs-lg)", lineHeight: 1.8 }}>
              <LinkedText
                text={dish.summary}
                dishes={allDishes}
                currentId={dish.id}
              />
            </p>
          </div>
          <FavoriteButton id={dish.id} />
        </div>
        {mainImage && (
          <div style={{ minWidth: 0 }}>
            <Photo
              src={mainImage}
              alt={`${dish.name}の料理写真`}
              sizes="(max-width: 48rem) 100vw, 32rem"
              priority
            />
            {subImages.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "var(--sp-2)",
                  marginTop: "var(--sp-2)",
                }}
              >
                {subImages.map((src, i) => (
                  <Photo
                    key={src}
                    src={src}
                    alt={`${dish.name}の料理写真 ${i + 2}`}
                    sizes="(max-width: 48rem) 33vw, 11rem"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* ---------- 基本情報 ---------- */}
      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 9rem), 1fr))",
          gap: "var(--sp-4) var(--sp-6)",
          padding: "var(--sp-4) 0",
          borderTop: "1px solid var(--c-text)",
          borderBottom: "1px solid var(--c-border)",
          marginBottom: "var(--sp-8)",
        }}
      >
        {facts.map((f) => (
          <div key={f.label} style={{ minWidth: 0 }}>
            <dt className="meta" style={{ marginBottom: "var(--sp-1)" }}>
              {f.label}
            </dt>
            <dd style={{ fontSize: "var(--fs-sm)", lineHeight: 1.6 }}>
              {f.value}
            </dd>
          </div>
        ))}
      </dl>

      <AdSense />

      {/* ---------- 本文 ---------- */}
      <div style={{ maxWidth: "var(--w-content)" }}>
        <Section title="メニューで見たら">
          <p style={{ lineHeight: 1.9, color: "var(--c-text-2)" }}>
            <LinkedText
              text={dish.menuDescription}
              dishes={allDishes}
              currentId={dish.id}
            />
          </p>
        </Section>

        <Section title={isDish ? "何が出てくるか" : "どんな形で出てくるか"}>
          <ul style={{ paddingLeft: "1.25rem", lineHeight: 1.8 }}>
            {dish.whatComesOut.map((item) => (
              <li key={item} style={{ color: "var(--c-text-2)" }}>
                <LinkedText
                  text={item}
                  dishes={allDishes}
                  currentId={dish.id}
                />
              </li>
            ))}
          </ul>
        </Section>

        <Section title="味・食感">
          <ul style={{ paddingLeft: "1.25rem", lineHeight: 1.8 }}>
            {dish.tasteAndTexture.map((t) => (
              <li key={t} style={{ color: "var(--c-text-2)" }}>
                {t}
              </li>
            ))}
          </ul>
        </Section>

        {history && (
          <Section title="歴史・由来">
            <p style={{ lineHeight: 1.9, color: "var(--c-text-2)" }}>
              <LinkedText
                text={history.body}
                dishes={allDishes}
                currentId={dish.id}
              />
            </p>
            {history.source && (
              <p
                className="meta"
                style={{ marginTop: "var(--sp-2)", wordBreak: "break-all" }}
              >
                {history.source}
              </p>
            )}
          </Section>
        )}

        <Section title="頼む判断">
          <div>
            <h3
              style={{
                fontSize: "var(--fs-md)",
                fontWeight: 700,
                marginBottom: "var(--sp-1)",
              }}
            >
              {dish.name}を注文するときのコツは？
            </h3>
            <p style={{ lineHeight: 1.9, color: "var(--c-text-2)" }}>
              <LinkedText
                text={dish.orderAdvice}
                dishes={allDishes}
                currentId={dish.id}
              />
            </p>
            {dish.caution && (
              <aside
                style={{
                  background: "var(--c-tint)",
                  borderLeft: "3px solid var(--c-text-sub)",
                  borderRadius: "var(--radius)",
                  marginTop: "var(--sp-4)",
                  padding: "var(--sp-3) var(--sp-4)",
                }}
              >
                <h3
                  style={{
                    fontSize: "var(--fs-sm)",
                    fontWeight: 700,
                    marginBottom: "var(--sp-1)",
                  }}
                >
                  <span aria-hidden="true">⚠︎ </span>
                  {dish.name}を食べるときの注意点は？
                </h3>
                <p
                  style={{
                    fontSize: "var(--fs-sm)",
                    lineHeight: 1.8,
                    color: "var(--c-text-2)",
                  }}
                >
                  <LinkedText
                    text={dish.caution}
                    dishes={allDishes}
                    currentId={dish.id}
                  />
                </p>
              </aside>
            )}
          </div>
        </Section>

        <Section title="スコア">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(100%, 12rem), 1fr))",
              gap: "var(--sp-4) var(--sp-6)",
            }}
          >
            {SCORES.map((s) => (
              <ScoreMeter
                key={s.key}
                label={s.label}
                low={s.low}
                high={s.high}
                score={dish[s.key]}
              />
            ))}
          </div>
        </Section>
      </div>

      <AdSense />

      {/* ---------- 比較・関連 ---------- */}
      {dish.similarItems.length > 0 && (
        <WideSection eyebrow="Compare" title="似ているものとの違い">
          <div style={cardGrid}>
            {dish.similarItems.map((s) => {
              const similarDish = s.id
                ? allDishes.find((d) => d.id === s.id)
                : undefined
              const slug = similarDish
                ? comparisonSlug(dish.id, similarDish.id)
                : undefined
              const hasComparison = slug && comparisonBySlug(slug)
              return (
                <div key={s.name} style={card}>
                  <Thumb src={similarDish?.images?.[0]} alt={s.name} />
                  <div style={{ minWidth: 0 }}>
                    {similarDish ? (
                      <Link
                        href={`/dishes/${similarDish.id}/`}
                        className="story__title"
                        style={{
                          color: "var(--c-accent)",
                          textDecoration: "none",
                        }}
                      >
                        {s.name}
                      </Link>
                    ) : (
                      <span className="story__title">{s.name}</span>
                    )}
                    <p
                      style={{
                        fontSize: "var(--fs-sm)",
                        color: "var(--c-text-2)",
                        lineHeight: 1.7,
                        marginTop: "var(--sp-1)",
                      }}
                    >
                      {s.difference}
                    </p>
                    {hasComparison && (
                      <Link
                        href={comparisonPath(slug)}
                        className="more-link"
                        style={{
                          display: "inline-block",
                          marginTop: "var(--sp-2)",
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
        </WideSection>
      )}

      {usedInDishes.length > 0 && (
        <WideSection eyebrow="Used in" title={`${dish.name}が使われている料理`}>
          <div style={cardGrid}>
            {usedInDishes.map((d) => (
              <DishMiniCard key={d.id} dish={d} />
            ))}
          </div>
        </WideSection>
      )}

      {relatedGroups.map((g) => (
        <WideSection key={g.title} eyebrow="Related" title={g.title}>
          <div style={cardGrid}>
            {g.dishes.map((d) => (
              <DishMiniCard key={d.id} dish={d} />
            ))}
          </div>
        </WideSection>
      ))}

      {articles.length > 0 && (
        <WideSection eyebrow="Stories" title="特集記事">
          <div style={cardGrid}>
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}/`}
                className="story"
                style={card}
              >
                <Thumb src={articleCover(article)?.src} alt="" />
                <div style={{ minWidth: 0 }}>
                  <span className="meta">
                    {formatDate(article.updatedAt ?? article.publishedAt)}
                  </span>
                  <span
                    className="story__title"
                    style={{ display: "block", fontSize: "var(--fs-md)" }}
                  >
                    {article.title}
                  </span>
                  <p style={clamp2}>
                    {article.subtitle ?? article.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </WideSection>
      )}

      {/* ---------- タグ・出典 ---------- */}
      <div style={{ maxWidth: "var(--w-content)", marginTop: "var(--sp-12)" }}>
        {dish.tags.length > 0 && (
          <Section title="タグ">
            <TagList tags={dish.tags} />
          </Section>
        )}

        {(dish.source?.length || updatedAt) && (
          <Section title="参考・出典">
            <div>
              {dish.source && dish.source.length > 0 && (
                <ul
                  style={{
                    listStyle: "none",
                    fontSize: "var(--fs-sm)",
                    lineHeight: 1.8,
                  }}
                >
                  {webSources.map((url) => (
                    <li key={url}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--c-text-2)" }}
                      >
                        {sourceLabel(url)}
                        <span aria-hidden="true"> ↗</span>
                        <span className="visually-hidden">
                          （外部サイト・新しいタブで開く）
                        </span>
                      </a>
                    </li>
                  ))}
                  {textSources.map((s) => (
                    <li key={s} style={{ color: "var(--c-text-2)" }}>
                      {s}
                    </li>
                  ))}
                </ul>
              )}
              {updatedAt && (
                <p
                  style={{
                    color: "var(--c-text-sub)",
                    fontSize: "var(--fs-xs)",
                    marginTop: "var(--sp-2)",
                  }}
                >
                  最終更新：
                  <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
                </p>
              )}
            </div>
          </Section>
        )}
      </div>

      <AdSense />

      {/* ---------- もっと見る ---------- */}
      <WideSection eyebrow="Explore" title="もっと見る">
        <nav aria-label="関連一覧" style={cardGrid}>
          {[
            ...(dish.regions.length > 0
              ? [
                  {
                    href: countryPath(regionLabel(dish.regions[0])),
                    label: `${regionLabel(dish.regions[0])}の他の料理`,
                  },
                ]
              : []),
            {
              href: categoryPath(dish.category),
              label: `${dish.category}の一覧`,
            },
            ...combos.map((combo) => ({
              href: comboHref(combo),
              label: `${combo.countryLabel}の${comboTagName(combo)}一覧`,
            })),
            { href: "/compare/", label: "似た料理の違いを比較" },
            { href: "/reverse/", label: "名前がわからない料理を逆引き検索" },
            { href: "/dishes/", label: "すべての料理を一覧で見る" },
          ].map((l) => (
            <Link
              key={l.href + l.label}
              href={l.href}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "var(--sp-2)",
                padding: "var(--sp-3) var(--sp-4)",
                border: "1px solid var(--c-border)",
                borderRadius: "var(--radius)",
                color: "var(--c-text)",
                fontSize: "var(--fs-sm)",
                textDecoration: "none",
              }}
            >
              {l.label}
              <span aria-hidden="true" style={{ color: "var(--c-accent)" }}>
                →
              </span>
            </Link>
          ))}
        </nav>
      </WideSection>
    </article>
  )
}
