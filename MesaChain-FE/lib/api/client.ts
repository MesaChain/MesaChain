import { apiBaseUrlBackend } from "../config";

interface ApiOptions extends RequestInit {
  token?: string;
  query?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, query?: ApiOptions["query"]) {
  const url = new URL(path, apiBaseUrlBackend);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, query, headers, ...rest } = options;
  const url = buildUrl(path, query);

  const response = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}
