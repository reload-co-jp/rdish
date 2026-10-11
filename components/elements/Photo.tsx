import Image from "next/image"
import { CSSProperties, FC } from "react"

type Props = {
  src?: string
  alt: string
  sizes: string
  priority?: boolean
  className?: string
  style?: CSSProperties
}

// 写真枠。比率は .photo（3:2）で統一し、画像なしでも同じ枠を保つ
export const Photo: FC<Props> = ({
  src,
  alt,
  sizes,
  priority,
  className,
  style,
}) =>
  src ? (
    <div className={`photo ${className ?? ""}`} style={style}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />
    </div>
  ) : (
    <div
      className={`photo photo--empty ${className ?? ""}`}
      style={style}
      aria-hidden="true"
    >
      RDish
    </div>
  )
