import Link from "next/link"
import { FC } from "react"

type Props = {
  tags: string[]
}

export const TagList: FC<Props> = ({ tags }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
    {tags.map((tag) => (
      <Link
        key={tag}
        href={`/tags/${encodeURIComponent(tag)}/`}
        style={{
          display: "inline-block",
          padding: "0.125rem 0.5rem",
          borderRadius: "9999px",
          background: "#f0e6d6",
          color: "#7a4f2a",
          fontSize: "0.75rem",
          textDecoration: "none",
        }}
      >
        {tag}
      </Link>
    ))}
  </div>
)
