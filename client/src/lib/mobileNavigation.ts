export const mobileNavigationItems = [
  { value: "purchase", label: "Purchase" },
  { value: "production", label: "Production" },
  { value: "packaging", label: "Packaging" },
  { value: "reports", label: "Report" },
] as const;

export function isMobilePrimaryTab(tab: string) {
  return mobileNavigationItems.some(item => item.value === tab);
}

export function getMobileMoreItems<T extends { value: string }>(items: T[]) {
  return items.filter(item => item.value !== "overview" && !isMobilePrimaryTab(item.value));
}
