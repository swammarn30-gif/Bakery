export function filterLedgerItemsByName<T extends { name: string }>(items: T[], query: string) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return items;
  return items.filter(item => item.name.toLocaleLowerCase().includes(normalized));
}
