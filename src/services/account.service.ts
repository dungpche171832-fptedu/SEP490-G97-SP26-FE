const API_BASE = "http://localhost:8080";

// function decodeJwtPayload(token: string): any | null {
//     try {
//         const parts = token.split(".");
//         if (parts.length < 2) return null;
//         const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
//         const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
//         const json = atob(padded);
//         return JSON.parse(json);
//     } catch {
//         return null;
//     }
// }
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getEmail(): string | null {
  // 1) thử localStorage key "email"
  const email = localStorage.getItem("email");
  if (email && email.includes("@")) return email;

  // 2) decode từ JWT
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  const fromJwt = payload?.email || payload?.sub || payload?.username;
  if (typeof fromJwt === "string" && fromJwt.includes("@")) return fromJwt;

  return null;
}

export async function getAccountInfo() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Missing token in localStorage (key: token)");

  const email = getEmail();
  if (!email) {
    throw new Error(
      "Không tìm thấy email. Hãy lưu email khi login (localStorage.setItem('email', ...)) hoặc đảm bảo JWT có claim email/sub.",
    );
  }

  const res = await fetch(`${API_BASE}/api/account/info?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Get account info failed: ${res.status}`);
  return res.json();
}
export async function updateProfile(data: { fullName: string; phone: string }) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Missing token");

  const res = await fetch(`${API_BASE}/api/account/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Update profile failed");
  }

  return res.json();
}
