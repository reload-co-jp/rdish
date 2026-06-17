"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

const AdSense = () => {
  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (_e) {
      // adsbygoogle push errors are non-fatal
    }
  }, [])

  if (process.env.NODE_ENV !== "production") return null

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", padding: ".5rem" }}
      data-ad-client="ca-pub-6542845006087970"
      data-ad-slot="7749597693"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}

export default AdSense
