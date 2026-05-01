import { FC } from "react"

type Props = {
  label: string
  score: number
  max?: number
}

export const ScoreBadge: FC<Props> = ({ label, score, max = 5 }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.25rem",
      fontSize: "0.75rem",
      color: "#666",
    }}
  >
    {label}:
    <span style={{ color: "#1a1a1a", fontWeight: 600 }}>
      {"●".repeat(score)}
      <span style={{ opacity: 0.3 }}>{"●".repeat(max - score)}</span>
    </span>
  </span>
)
