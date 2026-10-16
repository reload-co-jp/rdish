import { notFound } from "next/navigation"
import {
  ComboListPage,
  comboDescription,
} from "../../../../../components/features/ComboListPage"
import { findTagPair, tagPairPath, tagPairs } from "../../../../../lib/tagPairs"

export function generateStaticParams() {
  return tagPairs.map(({ baseId, subId }) => ({ tag: baseId, sub: subId }))
}

async function loadPair(params: Promise<{ tag: string; sub: string }>) {
  const { tag, sub } = await params
  const pair = findTagPair(tag, sub)
  if (!pair) notFound()
  return pair
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string; sub: string }>
}) {
  const pair = await loadPair(params)
  const path = tagPairPath(pair)
  const heading = `${pair.baseLabel}の${pair.subLabel}一覧`
  const title = `${heading}（全${pair.dishes.length}件）`
  const description = comboDescription(heading, pair.dishes)
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
  }
}

export default async function TagPairPage({
  params,
}: {
  params: Promise<{ tag: string; sub: string }>
}) {
  const pair = await loadPair(params)
  const path = tagPairPath(pair)
  return (
    <ComboListPage
      heading={`${pair.baseLabel}の${pair.subLabel}一覧`}
      path={path}
      breadcrumbs={[
        { label: "タグ", href: "/tags/" },
        { label: pair.baseLabel, href: `/tags/${pair.baseId}/` },
        { label: pair.subLabel, href: path },
      ]}
      lead={`${pair.baseLabel}を使った${pair.subLabel}を国を問わず集めました。各国の似た料理を比べながら、味の特徴・注文のコツを調べられます。`}
      dishes={pair.dishes}
    />
  )
}
