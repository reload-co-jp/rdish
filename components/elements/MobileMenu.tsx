"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FC, useEffect, useRef } from "react"

type Props = {
  items: { href: string; label: string; en: string }[]
}

// <details> ベースの軽量メニュー。ページ遷移時に閉じる
export const MobileMenu: FC<Props> = ({ items }) => {
  const ref = useRef<HTMLDetailsElement>(null)
  const pathname = usePathname()
  useEffect(() => {
    if (ref.current) ref.current.open = false
  }, [pathname])

  return (
    <details className="menu" ref={ref}>
      <summary aria-label="メニュー">
        <span className="menu__open">Menu</span>
        <span className="menu__close">Close</span>
      </summary>
      <nav className="menu__panel" aria-label="メイン">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
            <span>{item.en}</span>
          </Link>
        ))}
      </nav>
    </details>
  )
}
