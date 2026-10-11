import Link from "next/link"
import { FC } from "react"
import { tagPath } from "../../lib/taxonomy"

type Props = {
  tags: string[]
}

export const TagList: FC<Props> = ({ tags }) => (
  <div className="tag-list">
    {tags.map((tag) => (
      <Link key={tag} href={tagPath(tag)}>
        {tag}
      </Link>
    ))}
  </div>
)
