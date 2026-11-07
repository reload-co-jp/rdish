import restaurantsData from "../data/restaurants.json"
import type { DishItem } from "../types/dish"
import type { RestaurantDish, RestaurantItem } from "../types/restaurant"
import { allDishes } from "./dishes"

const dishIdSet = new Set(allDishes.map((d) => d.id))

const validate = (items: RestaurantItem[]) => {
  const ids = new Set<string>()
  for (const r of items) {
    if (ids.has(r.id)) throw new Error(`restaurants.json: 重複id "${r.id}"`)
    ids.add(r.id)
    for (const d of r.dishes) {
      if (!dishIdSet.has(d.id))
        throw new Error(
          `restaurants.json: "${r.id}" の dishes に存在しない料理id "${d.id}"`
        )
    }
  }
  return items
}

export const allRestaurants: RestaurantItem[] = validate(
  restaurantsData as RestaurantItem[]
)

// 閉店店舗は一覧・料理ページからは外し、個別ページのみ残す
export const openRestaurants = allRestaurants.filter((r) => !r.closed)

export const restaurantPath = (id: string) => `/restaurants/${id}/`

export const restaurantById = (id: string) =>
  allRestaurants.find((r) => r.id === id)

export const restaurantLocation = (r: RestaurantItem) =>
  [r.prefecture, r.area].filter(Boolean).join(" ")

const restaurantsByDish = new Map<
  string,
  { restaurant: RestaurantItem; entry: RestaurantDish }[]
>()
for (const restaurant of openRestaurants) {
  for (const entry of restaurant.dishes) {
    const list = restaurantsByDish.get(entry.id) ?? []
    list.push({ restaurant, entry })
    restaurantsByDish.set(entry.id, list)
  }
}

export const restaurantsForDish = (dishId: string) =>
  restaurantsByDish.get(dishId) ?? []

export const dishesForRestaurant = (r: RestaurantItem) =>
  r.dishes
    .map((entry) => ({
      entry,
      dish: allDishes.find((d) => d.id === entry.id) as DishItem,
    }))
    .filter(({ dish }) => dish)

// 都道府県ごとにまとめる（一覧ページ用）
export const restaurantsByPrefecture = () => {
  const map = new Map<string, RestaurantItem[]>()
  for (const r of openRestaurants) {
    const list = map.get(r.prefecture) ?? []
    list.push(r)
    map.set(r.prefecture, list)
  }
  return [...map.entries()].map(([prefecture, restaurants]) => ({
    prefecture,
    restaurants,
  }))
}
