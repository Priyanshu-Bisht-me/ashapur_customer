import { request } from "./http";

export function getProfile() {
  return request("/api/profile");
}

export function updateProfile(payload) {
  return request("/api/profile", {
    method: "PATCH",
    body: payload
  });
}

export function getRewards() {
  return request("/api/rewards");
}

export function getDashboard() {
  return request("/api/dashboard");
}
