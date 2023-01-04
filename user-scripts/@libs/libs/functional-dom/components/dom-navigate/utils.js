/**
 * 
 * @param {import("./index.js").NavigateRoute[]} routes 
 */
export function sortWildCardRouteToEnd(routes) {
  const sortedRoutes = [...routes].sort((a, b) => a.path === '*' ? 1 : b.path === '*' ? -1 : 0)
  return sortedRoutes
}
