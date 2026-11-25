const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SESSION_KEY = "lorenas_creaciones_supabase_session_v1";

function getSession() {
  const saved = localStorage.getItem(SESSION_KEY);
  return saved ? JSON.parse(saved) : null;
}

function saveSession(session: any) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

async function request(path: string, options: any = {}, token?: string) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token || SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.status === 204 ? null : response.json();
}

export async function adminLogin(email: string, password: string) {
  const session = await request(
    "/auth/v1/token?grant_type=password",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );

  if (session.user?.app_metadata?.role !== "admin") {
    throw new Error("Este usuario no tiene permisos de administrador.");
  }

  saveSession(session);
  return true;
}

export function adminLogout() {
  localStorage.removeItem(SESSION_KEY);
}

async function adminToken() {
  let session = getSession();

  if (!session) {
    throw new Error("Debes iniciar sesión.");
  }

  if (session.expires_at * 1000 < Date.now() + 60000) {
    session = await request(
      "/auth/v1/token?grant_type=refresh_token",
      {
        method: "POST",
        body: JSON.stringify({
          refresh_token: session.refresh_token,
        }),
      }
    );

    saveSession(session);
  }

  return session.access_token;
}

async function uploadImage(image: string) {
  if (!image || !image.startsWith("data:")) {
    return image;
  }

  const token = await adminToken();
  const parts = image.split(",");
  const mime = parts[0].match(/data:(.*?);/)?.[1] || "image/webp";
  const extension = mime.split("/")[1] || "webp";
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${extension}`;

  const binary = atob(parts[1]);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/lorenas-imagenes/${fileName}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": mime,
        "x-upsert": "true",
      },
      body: bytes,
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return `${SUPABASE_URL}/storage/v1/object/public/lorenas-imagenes/${fileName}`;
}

export async function fetchCloudProducts() {
  const rows = await request(
    "/rest/v1/products?select=id,data,active,position,sort_order&order=sort_order.asc"
  );

  return rows
    .filter((row: any) => row.active !== false)
    .map((row: any) => row.data);
}

export async function saveCloudProducts(products: any[]) {
  const token = await adminToken();

  const prepared = await Promise.all(
    products.map(async (product, index) => {
      const image = await uploadImage(product.image);

      return {
        id: String(product.id),
        data: { ...product, image },
        active: product.available !== false,
        position: index,
        sort_order: index,
        featured: false,
      };
    })
  );

  if (prepared.length) {
    await request("/rest/v1/products?on_conflict=id", {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(prepared),
    }, token);
  }

  const ids = prepared.map((product) => product.id);

  const existing = await request(
    "/rest/v1/products?select=id",
    {},
    token
  );

  const removed = existing
    .filter((row: any) => !ids.includes(row.id))
    .map((row: any) => row.id);

  if (removed.length) {
    await request(
      `/rest/v1/products?id=in.(${removed.map(encodeURIComponent).join(",")})`,
      { method: "DELETE" },
      token
    );
  }

  return prepared.map((row) => row.data);
}

export async function fetchCloudImages() {
  const rows = await request(
    "/rest/v1/site_settings?select=value&key=eq.site_images"
  );

  return rows[0]?.value || null;
}

export async function saveCloudImages(images: any) {
  const token = await adminToken();

  const savedImages = {
    logo: await uploadImage(images.logo),
    hero: await uploadImage(images.hero),
    about: await uploadImage(images.about),
  };

  await request("/rest/v1/site_settings?on_conflict=key", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      key: "site_images",
      value: savedImages,
      updated_at: new Date().toISOString(),
    }),
  }, token);

  return savedImages;
}
