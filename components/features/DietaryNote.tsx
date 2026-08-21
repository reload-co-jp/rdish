import { FC } from "react"

// 材料はレシピ・店・地域で変わるため、安全性を断定しない注記を必ず添える
export const DietaryNote: FC = () => (
  <p
    style={{
      background: "#fef9f0",
      border: "1px solid #f5c97a",
      borderRadius: "0.375rem",
      color: "#7a6655",
      fontSize: "0.8125rem",
      lineHeight: 1.7,
      margin: "0 0 1.5rem",
      padding: "0.625rem 0.75rem",
    }}
  >
    掲載内容は一般的なレシピをもとにした目安です。同じ料理でも店や地域によって材料は変わります。アレルギーや体質で避けているものがある場合は、注文前に必ずお店に確認してください。
  </p>
)
