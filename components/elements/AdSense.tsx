"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

// pathname を <ins> の key と effect 依存にする → 遷移毎に枠を作り直して再リクエスト
const useAdPush = () => {
  const pathname = usePathname()
  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (_e) {
      // adsbygoogle push errors are non-fatal
    }
  }, [pathname])
  return pathname
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

const AdSense = () => {
  const pathname = useAdPush()

  if (process.env.NODE_ENV !== "production") return null

  return (
    <ins
      key={pathname}
      className="adsbygoogle"
      style={{ display: "block", padding: ".5rem", minHeight: "100px" }}
      data-ad-client="ca-pub-6542845006087970"
      data-ad-slot="7749597693"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}

export default AdSense

export const InArticleAd = () => {
  const pathname = useAdPush()

  if (process.env.NODE_ENV !== "production") return null

  return (
    <ins
      key={pathname}
      className="adsbygoogle"
      style={{ display: "block", textAlign: "center" }}
      data-ad-layout="in-article"
      data-ad-format="fluid"
      data-ad-client="ca-pub-6542845006087970"
      data-ad-slot="4625326006"
    />
  )
}

export const RouteAd = AdSense
