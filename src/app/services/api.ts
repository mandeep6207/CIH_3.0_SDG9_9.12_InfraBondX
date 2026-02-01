const BASE_URL = "http://localhost:5000/api";

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

// ✅ GET with auth header + error handling
export async function apiGet(path: string, token?: string) {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, { headers });

    if (res.status === 401 || res.status === 403) {
      return { error: "Unauthorized" };
    }

    // ✅ handle non-2xx also safely
    const data = await safeJson(res);
    return data;
  } catch (err: any) {
    return { error: err?.message || "Network error" };
  }
}

// ✅ POST with auth header + error handling
export async function apiPost(path: string, body: any, token?: string) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.status === 401 || res.status === 403) {
      return { error: "Unauthorized" };
    }

    const data = await safeJson(res);
    return data;
  } catch (err: any) {
    return { error: err?.message || "Network error" };
  }
}

// ✅ POST FormData for file uploads (DO NOT set Content-Type)
export async function apiPostFormData(
  path: string,
  formData: FormData,
  token?: string
) {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (res.status === 401 || res.status === 403) {
      return { error: "Unauthorized" };
    }

    const data = await safeJson(res);
    return data;
  } catch (err: any) {
    return { error: err?.message || "Network error" };
  }
}

// ✅ Download helper (for PDF certificate)
export async function apiDownload(path: string, token?: string) {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { headers });

  if (!res.ok) {
    // try returning json error
    try {
      const errJson = await res.json();
      throw new Error(errJson?.error || "Download failed");
    } catch {
      throw new Error("Download failed");
    }
  }

  return res.blob();
}
