import BASE_URL from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const apiRequest = async (endpoint, method = "GET", body = null) => {
  const token = await AsyncStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "API error");
  }

  return data;
};