"use client"

import { FC, useEffect } from "react"
import { addRecentlyViewed } from "../../lib/storage"

export const RecentlyViewedTracker: FC<{ id: string }> = ({ id }) => {
  useEffect(() => {
    addRecentlyViewed(id)
  }, [id])
  return null
}
