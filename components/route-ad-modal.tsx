"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import AdSense from "./elements/AdSense"

type Props = {
  links: { href: string; title: string }[]
  heading: string
}

// native <dialog>.showModal() は子の adsbygoogle.push より後に走り枠幅0になる → 条件付き div
export const RouteAdModal = ({ links, heading }: Props) => {
  const pathname = usePathname()
  const prev = useRef(pathname)
  const count = useRef(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (prev.current === pathname) return
    prev.current = pathname
    count.current += 1
    if (count.current % 2 === 0) setOpen(true)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  if (!open) return null

  const close = () => setOpen(false)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Advertisement"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          width: "2.5rem",
          height: "2.5rem",
          borderRadius: "50%",
          border: "none",
          background: "#fff",
          fontSize: "1.25rem",
          cursor: "pointer",
        }}
      >
        ×
      </button>
      <div style={{ width: "100%", maxWidth: "728px", background: "#fff" }}>
        <AdSense key={pathname} />
      </div>
      <nav
        aria-label={heading}
        style={{
          width: "100%",
          maxWidth: "728px",
          maxHeight: "40dvh",
          overflowY: "auto",
          background: "#fff",
          padding: "1rem",
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{heading}</p>
        <ul>
          {links.map((l) => (
            <li key={l.href} style={{ padding: "0.25rem 0" }}>
              <Link href={l.href} onClick={close}>
                {l.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
