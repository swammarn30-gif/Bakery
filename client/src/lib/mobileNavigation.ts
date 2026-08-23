export const mobileNavigationItems = [
  { value: "overview", label: "Home" },
  { value: "production", label: "Production" },
  { value: "packaging", label: "Packaging" },
  { value: "reports", label: "Report" },
] as const;

export function isMobilePrimaryTab(tab: string) {
  return mobileNavigationItems.some(item => item.value === tab);
}
