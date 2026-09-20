const API_URL = import.meta.env.VITE_API_URL as string;
const TOKEN_KEY = "pos_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Not authenticated");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function login(email: string, password: string) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.access_token);
  return data;
}

export function getRoutines(date?: string) {
  const query = date ? `?target_date=${date}` : "";
  return request(`/routines${query}`);
}
export function createRoutine(payload: unknown) {
  return request("/routines", { method: "POST", body: JSON.stringify(payload) });
}
export function updateRoutine(id: string, payload: unknown) {
  return request(`/routines/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}
export function deleteRoutine(id: string) {
  return request(`/routines/${id}`, { method: "DELETE" });
}
