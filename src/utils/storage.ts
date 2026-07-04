// src/utils/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";

export async function saveSession(accessToken: string, user: User): Promise<void> {
  await AsyncStorage.setItem("access_token", accessToken);
  await AsyncStorage.setItem("user", JSON.stringify(user));
}

export async function getSession(): Promise<{ token: string; user: User } | null> {
  const token = await AsyncStorage.getItem("access_token");
  const userJson = await AsyncStorage.getItem("user");
  if (!token || !userJson) return null;
  return { token, user: JSON.parse(userJson) as User };
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.multiRemove(["access_token", "refresh_token", "user"]);
}
