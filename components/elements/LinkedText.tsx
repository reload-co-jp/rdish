import { FC, CSSProperties } from "react"
import type { DishItem } from "../../types/dish"
import { linkifyText } from "../../lib/linkifyText"

type Props = {
  text: string
  dishes: DishItem[]
  currentId: string
  style?: CSSProperties
  linkStyle?: CSSProperties
}

export const LinkedText: FC<Props> = ({ text, dishes, currentId, style, linkStyle }) => (
  <span style={style}>{linkifyText(text, dishes, currentId, linkStyle)}</span>
)
