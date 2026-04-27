import { request } from "./http";

export function signup(payload) {
  return request("/api/auth/signup", {
    method: "POST",
    body: payload
  });
}

export function login(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: payload
  });
}

export function getCurrentSession() {
  return request("/api/auth/me");
}
