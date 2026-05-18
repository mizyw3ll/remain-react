import { http } from "../../shared/api/http";
import type { User } from "../../shared/types/models";

type LoginPayload = { username: string; password: string };
type RegisterPayload = {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
};

export async function login(payload: LoginPayload) {
  const data = new URLSearchParams();
  data.append("username", payload.username);
  data.append("password", payload.password);
  const response = await http.post("/auth/login", data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data as { access_token: string; token_type: string };
}

export async function register(payload: RegisterPayload) {
  const response = await http.post("/auth/register", payload);
  return response.data as User;
}

export async function me() {
  const response = await http.get("/users/me");
  return response.data as User;
}

export async function requestVerification() {
  const response = await http.post("/auth/request-verify-token");
  return response.data;
}

export async function verifyEmail(token: string) {
  const response = await http.post("/auth/verify", { token });
  return response.data as User;
}

export async function forgotPassword(email: string) {
  const response = await http.post("/auth/forgot-password", { email });
  return response.data;
}

export async function resetPassword(token: string, password: string) {
  const response = await http.post("/auth/reset-password", { token, password });
  return response.data;
}

export async function changePassword(old_password: string, new_password: string) {
  const response = await http.post("/auth/change-password", { old_password, new_password });
  return response.data;
}
