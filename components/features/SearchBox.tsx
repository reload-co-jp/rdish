"use client"

import { useRouter } from "next/navigation"
import { FC, FormEvent, useState } from "react"

type Props = {
  initialQuery?: string
  placeholder?: string
}

export const SearchBox: FC<Props> = ({
  initialQuery = "",
  placeholder = "コンフィ、ブッラータ、フムス...",
}) => {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search/?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", gap: "0.5rem", width: "100%" }}
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="料理名・食材名・調理法を検索"
        style={{
          flex: 1,
          background: "var(--c-bg)",
          border: "1px solid var(--c-border)",
          borderRadius: "var(--radius)",
          color: "var(--c-text)",
          fontSize: "1rem",
          padding: "0.625rem 0.75rem",
          outline: "none",
        }}
      />
      <button
        type="submit"
        style={{
          background: "var(--c-accent)",
          border: "none",
          borderRadius: "var(--radius)",
          color: "#fff",
          cursor: "pointer",
          fontSize: "1rem",
          padding: "0.625rem 1rem",
          whiteSpace: "nowrap",
        }}
      >
        検索
      </button>
    </form>
  )
}
