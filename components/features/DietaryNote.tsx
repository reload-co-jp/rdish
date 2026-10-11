import { FC } from "react"

// 材料はレシピ・店・地域で変わるため、安全性を断定しない注記を必ず添える
export const DietaryNote: FC = () => (
  <p
    style={{
      background: "var(--c-tint)",
      border: "1px solid var(--c-border)",
      borderRadius: "var(--radius)",
      color: "var(--c-text-2)",
      fontSize: "0.8125rem",
      lineHeight: 1.7,
      margin: "0 0 1.5rem",
      padding: "0.625rem 0.75rem",
    }}
  >
    掲載内容は一般的なレシピをもとにした目安です。同じ料理でも店や地域によって材料は変わります。アレルギーや体質で避けているものがある場合は、注文前に必ずお店に確認してください。
  </p>
)
