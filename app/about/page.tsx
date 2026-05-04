import type { Metadata } from "next"
import Link from "next/link"
import { Breadcrumb } from "../../components/elements/Breadcrumb"

export const metadata: Metadata = {
  title: "RDishについて",
  description:
    "RDishは、メニューで見かけた料理名をその場でさっと調べられる、飾らない料理図鑑です。",
  alternates: { canonical: "/about/" },
}

const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <section style={{ marginBottom: "2rem" }}>
    <h2
      style={{
        fontSize: "0.75rem",
        fontWeight: 700,
        color: "#a89080",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: "0.75rem",
      }}
    >
      {title}
    </h2>
    {children}
  </section>
)

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "株式会社Reload",
  url: "https://reload.co.jp",
  publishingPrinciples: "https://rdish.reload.co.jp/about/",
}

export default function AboutPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <Breadcrumb items={[{ label: "about" }]} />
      <div style={{ marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            marginBottom: "0.5rem",
            lineHeight: 1.3,
          }}
        >
          いつでも聞ける、
          <br />
          飾らない料理図鑑。
        </h1>
        <p style={{ color: "#a89080", fontSize: "0.875rem" }}>RDish について</p>
      </div>

      <Section title="つくった理由">
        <p
          style={{
            fontSize: "0.95rem",
            lineHeight: 1.8,
            color: "#5a3e2b",
            marginBottom: "0.75rem",
          }}
        >
          レストランのメニューに知らない料理名が並んでいても、
          となりの人に聞くのはちょっと恥ずかしい。
          スマホで調べると長い解説が出てきて、結局よくわからない。
        </p>
        <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "#5a3e2b" }}>
          RDish は「これ頼んでいいの？」をその場で一瞬で解決するためにあります。
          難しい言葉は使わず、食べてみた感覚に近い言葉で書きました。
        </p>
      </Section>

      <Section title="こんな人に">
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.625rem",
          }}
        >
          {[
            "メニューの料理名が読めなくて困ったことがある",
            "頼んだら想像と全然違うものが来た経験がある",
            "辛いの苦手だけど、これ辛いの？と確認したい",
            "食材アレルギーがあって、何が入っているか気になる",
            "外国料理のお店で何を頼めばいいかわからない",
          ].map((text) => (
            <li
              key={text}
              style={{
                fontSize: "0.9rem",
                color: "#5a3e2b",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
              }}
            >
              <span style={{ color: "#b45309", flexShrink: 0 }}>—</span>
              {text}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="できること">
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {[
            {
              label: "料理名から検索",
              desc: "「コンフィ」「ブッラータ」など、料理名・食材名・調理法で調べられる。",
              href: "/",
            },
            {
              label: "特徴から逆引き",
              desc: "「白くてとろっとしたチーズ」「緑色で渦巻きの野菜」など、見た目や食感で探せる。",
              href: "/reverse/",
            },
            {
              label: "お気に入り登録",
              desc: "気になった料理をブックマーク。次のお店でも参考にできる。",
              href: "/favorites/",
            },
          ].map(({ label, desc, href }) => (
            <Link
              key={label}
              href={href}
              style={{
                background: "#fffdf8",
                border: "1px solid #e8ddd0",
                borderRadius: "0.5rem",
                padding: "0.875rem 1rem",
                textDecoration: "none",
                color: "inherit",
                display: "block",
              }}
            >
              <p
                style={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  marginBottom: "0.25rem",
                  color: "#b45309",
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#7a6655",
                  lineHeight: 1.6,
                }}
              >
                {desc}
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="掲載データについて">
        <p style={{ fontSize: "0.875rem", lineHeight: 1.8, color: "#7a6655" }}>
          掲載している料理・食材情報は一般的な特徴をまとめたものです。
          店舗や地域・シェフによって内容は異なります。
          アレルギーに関わる確認はお店のスタッフに直接お尋ねください。
        </p>
      </Section>

      <Section title="制作">
        <p style={{ fontSize: "0.875rem", lineHeight: 1.8, color: "#7a6655" }}>
          RDish は{" "}
          <a
            href="https://reload.co.jp"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#b45309", textDecoration: "none" }}
          >
            株式会社Reload
          </a>{" "}
          が制作・運営しています。
        </p>
      </Section>
    </div>
  )
}
