export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function totalPages(count: number, pageSize: number, minPages = 0): number {
  return Math.max(Math.ceil(count / pageSize), minPages)
}
