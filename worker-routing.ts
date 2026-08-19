export function isServerRoute(pathname: string) {
  return pathname.startsWith("/api/") || pathname.startsWith("/manus-storage/");
}

export function shouldServeSpaFallback(status: number, method: string, accept: string | null) {
  return status === 404 && method === "GET" && (accept?.includes("text/html") ?? false);
}
