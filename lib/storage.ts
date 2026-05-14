const FAVORITES_KEY = "rdish:favorites"
const FAVORITES_EVENT = "rdish:favoritesChange"
const RECENTLY_VIEWED_KEY = "rdish:recentlyViewed"
const MAX_RECENT = 20

let favoritesSnapshot: string[] = []

function loadFavoritesSnapshot(): void {
  try {
    favoritesSnapshot = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]")
  } catch {
    favoritesSnapshot = []
  }
}

export function subscribeFavorites(onStoreChange: () => void): () => void {
  const handler = () => {
    loadFavoritesSnapshot()
    onStoreChange()
  }
  window.addEventListener("storage", handler)
  window.addEventListener(FAVORITES_EVENT, handler)
  loadFavoritesSnapshot()
  return () => {
    window.removeEventListener("storage", handler)
    window.removeEventListener(FAVORITES_EVENT, handler)
  }
}

export function getFavorites(): string[] {
  return favoritesSnapshot
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
