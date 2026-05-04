const FAVORITES_KEY = "rdish:favorites"
const FAVORITES_EVENT = "rdish:favoritesChange"
const RECENTLY_VIEWED_KEY = "rdish:recentlyViewed"
const MAX_RECENT = 20

export function subscribeFavorites(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(FAVORITES_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(FAVORITES_EVENT, onStoreChange)
  }
}

export function getFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]")
  } catch {
    return []
  }
}

export function toggleFavorite(id: string): boolean {
  const favs = getFavorites()
  const idx = favs.indexOf(id)
  if (idx >= 0) {
    favs.splice(idx, 1)
  } else {
    favs.unshift(id)
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
  window.dispatchEvent(new Event(FAVORITES_EVENT))
  return idx < 0
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id)
}

export function getRecentlyViewed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) ?? "[]")
  } catch {
    return []
  }
}

export function addRecentlyViewed(id: string): void {
  const recent = getRecentlyViewed().filter((r) => r !== id)
  recent.unshift(id)
  localStorage.setItem(
    RECENTLY_VIEWED_KEY,
    JSON.stringify(recent.slice(0, MAX_RECENT)),
  )
}
