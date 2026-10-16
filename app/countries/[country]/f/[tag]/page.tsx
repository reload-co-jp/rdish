import { notFound } from "next/navigation"
import {
  ComboListPage,
  comboDescription,
} from "../../../../../components/features/ComboListPage"
import {
  comboHref,
  comboTagName,
  combosOfKind,
  findComboOf,
} from "../../../../../lib/countryTagCombos"

export function generateStaticParams() {
  return combosOfKind("flavor").map(({ countryId, tagId }) => ({
    country: countryId,
    tag: tagId,
  }))
}

async function loadCombo(params: Promise<{ country: string; tag: string }>) {
  const { country, tag } = await params
  const combo = findComboOf("flavor", country, tag)
  if (!combo) notFound()
  return combo
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; tag: string }>
}) {
  const combo = await loadCombo(params)
  const path = comboHref(combo)
  const heading = `${combo.countryLabel}の${comboTagName(combo)}一覧`
  const title = `${heading}（全${combo.dishes.length}件）`
  const description = comboDescription(heading, combo.dishes)
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
  }
}

export default async function CountryFlavorPage({
  params,
}: {
  params: Promise<{ country: string; tag: string }>
}) {
  const combo = await loadCombo(params)
  const path = comboHref(combo)
  const name = comboTagName(combo)
  return (
    <ComboListPage
      heading={`${combo.countryLabel}の${name}一覧`}
      path={path}
      breadcrumbs={[
        { label: "国・地域", href: "/countries/" },
        { label: combo.countryLabel, href: `/countries/${combo.countryId}/` },
        { label: name, href: path },
      ]}
      lead={`${combo.countryLabel}の${name}を集めました。メニューで見かけたときに、どんな料理か・味の特徴・注文のコツをすぐ調べられます。`}
      dishes={combo.dishes}
    />
  )
}
