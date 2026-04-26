import { request } from "./http";

export function signupCustomer(payload) {
  return request("/api/customer/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function loginCustomer(payload) {
  return request("/api/customer/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getCustomerDashboard(userId) {
  return request(`/api/customer/dashboard/${userId}`);
}

export function getCustomerProducts() {
  return request("/api/customer/products");
}

export function createCustomerOrder(payload) {
  return request("/api/customer/orders", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getCustomerOrders(userId) {
  return request(`/api/customer/orders/${userId}`);
}

export function getOrderTracking(orderId) {
  return request(`/api/customer/orders/track/${orderId}`);
}
