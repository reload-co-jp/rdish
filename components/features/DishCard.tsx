import Link from "next/link"
import { FC } from "react"
import { regionLabel } from "../../lib/region"
import type { DishItem } from "../../types/dish"
import { Photo } from "../elements/Photo"
import { TagList } from "./TagList"

type Props = {
  dish: DishItem
}

export const DishCard: FC<Props> = ({ dish }) => (
  <div className="dish-card">
    <Link href={`/dishes/${dish.id}/`} className="dish-card__link story">
      <div style={{ minWidth: 0 }}>
        <span className="meta">
          {dish.category}
          {dish.regions[0] ? ` — ${regionLabel(dish.regions[0])}` : ""}
        </span>
        <h3 className="story__title dish-card__title">{dish.name}</h3>
        <p className="story__desc">{dish.summary}</p>
        {dish.orderAdvice && (
          <p className="dish-card__advice">{dish.orderAdvice}</p>
        )}
      </div>
      <Photo
        src={dish.images?.[0]}
        alt={dish.name}
        sizes="(max-width: 480px) 112px, 160px"
        className="dish-card__photo"
      />
    </Link>
    <TagList tags={dish.tags.slice(0, 5)} />
  </div>
)
