import Link from "next/link"
import { FC } from "react"
import { avoidPath, safePath, safeTopics, avoidTopics } from "../../lib/dietary"

type Props = {
  currentSlug: string
  kind: "safe" | "avoid"
}

const linkStyle = {
  background: "#f0e6d6",
  border: "1px solid #e8ddd0",
  borderRadius: "9999px",
  color: "#b45309",
  fontSize: "0.75rem",
  padding: "0.125rem 0.625rem",
  textDecoration: "none",
}

export const DietaryTopicLinks: FC<Props> = ({ currentSlug, kind }) => {
  const topics = kind === "safe" ? safeTopics : avoidTopics
  const others = topics.filter((topic) => topic.axis.slug !== currentSlug)
  if (others.length === 0) return null

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
      {others.map(({ axis }) => (
        <Link
          key={axis.slug}
          href={kind === "safe" ? safePath(axis.slug) : avoidPath(axis.slug)}
          style={linkStyle}
        >
          {kind === "safe" ? `${axis.label}なし` : `${axis.label}あり`}
        </Link>
      ))}
    </div>
  )
}
