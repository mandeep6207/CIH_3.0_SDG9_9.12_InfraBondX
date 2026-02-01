import { apiPost, apiGet } from "./api";

export async function loginUser(email: string, password: string) {
  const data = await apiPost("/auth/login", { email, password });
  if (data?.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
}

export function getToken() {
  return localStorage.getItem("token") || "";
}

export function getUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

export async function fetchMe() {
  const token = getToken();
  return apiGet("/auth/me", token);
}

export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
