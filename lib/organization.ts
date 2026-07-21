const SITE_URL = "https://rdish.reload.co.jp"
const CORP_URL = "https://reload.co.jp"

export const ORGANIZATION_ID = `${CORP_URL}/#organization`

export const organizationJsonLd = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: "株式会社Reload",
  url: CORP_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/icon.svg`,
  },
  sameAs: ["https://twitter.com/r_dish_reload"],
}

export const organizationRef = { "@id": ORGANIZATION_ID }
