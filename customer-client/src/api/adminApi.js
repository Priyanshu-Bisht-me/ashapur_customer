import { request } from "./http";

function buildQuery(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

export function getAdminStats() {
  return request("/api/admin/stats");
}

export function getAdminCustomers(params) {
  return request(`/api/admin/customers${buildQuery(params)}`);
}

export function getAdminProducts(params) {
  return request(`/api/admin/products${buildQuery(params)}`);
}

export function createAdminProduct(payload) {
  return request("/api/admin/products", {
    method: "POST",
    body: payload
  });
}

export function updateAdminProduct(id, payload) {
  return request(`/api/admin/products/${id}`, {
    method: "PATCH",
    body: payload
  });
}

export function getAdminOrders(params) {
  return request(`/api/admin/orders${buildQuery(params)}`);
}

export function updateAdminOrder(id, payload) {
  return request(`/api/admin/orders/${id}`, {
    method: "PATCH",
    body: payload
  });
}

export function getAdminSubscriptions(params) {
  return request(`/api/admin/subscriptions${buildQuery(params)}`);
}
