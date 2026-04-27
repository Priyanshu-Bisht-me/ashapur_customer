import { request } from "./http";

export function getSubscriptions() {
  return request("/api/subscriptions");
}

export function createSubscription(payload) {
  return request("/api/subscriptions", {
    method: "POST",
    body: payload
  });
}

export function updateSubscription(id, payload) {
  return request(`/api/subscriptions/${id}`, {
    method: "PATCH",
    body: payload
  });
}
