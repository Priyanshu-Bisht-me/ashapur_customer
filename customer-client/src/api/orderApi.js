import { request } from "./http";

export function checkout(payload) {
  return request("/api/cart/checkout", {
    method: "POST",
    body: payload
  });
}

export function getOrders() {
  return request("/api/orders");
}

export function getOrder(id) {
  return request(`/api/orders/${id}`);
}
