import { request } from "./http";

function buildQuery(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

export function getProducts(params) {
  return request(`/api/products${buildQuery(params)}`);
}

export function getProductDetail(slug) {
  return request(`/api/products/${slug}`);
}

export function getMeta() {
  return request("/api/meta");
}
