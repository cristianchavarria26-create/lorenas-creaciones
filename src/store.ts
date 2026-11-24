export const CATEGORIES = [
  "Amigurumis",
  "Muñecas",
  "Flores",
  "Personalizados",
  "Otros",
] as const;
export type Category = (typeof CATEGORIES)[number];
export type Filter = "Todas" | Category;

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  available: boolean;
  description: string;
  image: string;
  inspiration?: boolean;
}

export interface SiteImages {
  logo: string;
  hero: string;
  about: string;
}

export const KEYS = {
  products: "lorenas_creaciones_products_v1",
  images: "lorenas_creaciones_site_images_v1",
  access: "lorenas_creaciones_local_access_v1",
};
export const ORIGINAL_IMAGES: SiteImages = {
  logo: "",
  hero: "./images/portada.webp",
  about: "./images/el-taller.webp",
};

// Reference designs have no invented price or stock quantity.
const inspirationCollection: Product[] = [
  {
    id: "osito-miel",
    name: "Osito Miel",
    category: "Amigurumis",
    image: "./images/osito-miel.webp",
    description:
      "Un pequeño compañero de color miel, con hocico crema y una delicada corbata verde salvia. Un diseño lleno de ternura para regalar en una ocasión especial.",
  },
  {
    id: "muneca-violeta",
    name: "Muñeca Violeta",
    category: "Muñecas",
    image: "./images/muneca-violeta.webp",
    description:
      "Una muñequita de larga trenza y vestido lavanda, con una pequeña flor en el cabello. Podemos conversar sobre los colores de su vestido y los detalles que la harán tuya.",
  },
  {
    id: "ramo-tulipanes",
    name: "Tulipanes eternos",
    category: "Flores",
    image: "./images/ramo-tulipanes.webp",
    description:
      "Un ramo de tulipanes a crochet en tonos rosa, durazno y amarillo suave. Flores que no se marchitan, pensadas para guardar un recuerdo bonito.",
  },
  {
    id: "conejita-olivia",
    name: "Conejita Olivia",
    category: "Personalizados",
    image: "./images/conejita-olivia.webp",
    description:
      "Orejas largas, un vestidito rosa y una flor en la cintura. Esta conejita es una inspiración para crear una pieza a tu gusto, eligiendo sus colores y pequeños detalles.",
  },
].map((p) => ({
  ...p,
  category: p.category as Category,
  price: 0,
  available: true,
  inspiration: true,
}));

export function isImage(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (/^(?:\.\/|\/)?images\/[\w-]+\.webp$/.test(value) ||
      /^data:image\/(webp|jpeg|png|avif);base64,/.test(value))
  );
}

export function validProducts(value: unknown): value is Product[] {
  if (!Array.isArray(value) || value.length > 500) return false;
  const ids = new Set<string>();
  return value.every((p) => {
    if (
      !p ||
      typeof p !== "object" ||
      typeof p.id !== "string" ||
      !p.id ||
      ids.has(p.id)
    )
      return false;
    ids.add(p.id);
    return (
      typeof p.name === "string" &&
      p.name.trim().length > 0 &&
      p.name.length <= 90 &&
      typeof p.price === "number" &&
      Number.isSafeInteger(p.price) &&
      p.price >= 0 &&
      CATEGORIES.includes(p.category) &&
      typeof p.available === "boolean" &&
      typeof p.description === "string" &&
      p.description.length <= 450 &&
      isImage(p.image)
    );
  });
}

export const PUBLISHED_CATALOG = "./productos.json";

/** Products saved by the local editor in this browser, if any. */
export function loadSavedProducts(): Product[] | null {
  try {
    const raw = localStorage.getItem(KEYS.products);
    if (raw !== null) {
      const parsed: unknown = JSON.parse(raw);
      if (validProducts(parsed)) return parsed;
    }
  } catch {
    /* A storefront is still usable when browser storage is unavailable. */
  }
  return null;
}

export function defaultProducts(): Product[] {
  return inspirationCollection.map((p) => ({ ...p }));
}

/** The catalog published next to index.html, visible to every visitor. */
export async function fetchPublishedProducts(): Promise<Product[] | null> {
  try {
    const response = await fetch(PUBLISHED_CATALOG, { cache: "no-cache" });
    if (!response.ok) return null;
    const value = await response.json();
    const list: unknown = Array.isArray(value) ? value : value?.productos;
    return validProducts(list) ? list : null;
  } catch {
    return null;
  }
}

/** Priority: edits saved in this browser, then the published file, then the samples. */
export async function resolveProducts(): Promise<Product[]> {
  return (
    loadSavedProducts() ?? (await fetchPublishedProducts()) ?? defaultProducts()
  );
}

export function loadImages(): SiteImages {
  try {
    const saved = JSON.parse(localStorage.getItem(KEYS.images) || "{}");
    return {
      logo: isImage(saved.logo) ? saved.logo : "",
      hero: isImage(saved.hero) ? saved.hero : ORIGINAL_IMAGES.hero,
      about: isImage(saved.about) ? saved.about : ORIGINAL_IMAGES.about,
    };
  } catch {
    return { ...ORIGINAL_IMAGES };
  }
}

export function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error(
      "No se pudo guardar en este navegador. Revisa el espacio disponible o los permisos de almacenamiento. Tus cambios anteriores se conservan.",
    );
  }
}

export const formatPrice = (price: number) =>
  price === 0
    ? "A cotizar"
    : new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      }).format(price);
export const whatsapp = (message: string) =>
  `https://wa.me/56930081168?text=${encodeURIComponent(message)}`;
export const GENERAL_MESSAGE =
  "Hola, Lorena. Vi tus creaciones a crochet y me gustaría hacerte una consulta.";
export const errorMessage = (e: unknown) =>
  e instanceof Error
    ? e.message
    : "No se pudo completar la acción. Inténtalo otra vez.";

export function fileAsDataURL(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}

export async function optimizeImage(
  file: File,
  maxSize = 1000,
): Promise<string> {
  if (
    !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)
  )
    throw new Error("Elige una fotografía JPG, PNG, WebP o AVIF.");
  if (file.size > 12 * 1024 * 1024)
    throw new Error("La fotografía debe pesar menos de 12 MB.");
  const image = new Image();
  const url = URL.createObjectURL(file);
  try {
    image.src = url;
    await image.decode();
    const scale = Math.min(
      1,
      maxSize / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo procesar la imagen.");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/webp", 0.84);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>) {
  if (!crypto.subtle)
    throw new Error("El acceso local necesita una conexión HTTPS o localhost.");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 210000, hash: "SHA-256" },
    key,
    256,
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

export async function openLocalEditor(password: string, setup: boolean) {
  const existing = localStorage.getItem(KEYS.access);
  if (setup) {
    if (existing !== null)
      throw new Error(
        "Ya existe una clave local. Cierra esta ventana y vuelve a iniciar sesión.",
      );
    if (password.length < 10)
      throw new Error("Utiliza al menos 10 caracteres para tu clave.");
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await deriveKey(password, salt);
    persist(KEYS.access, { salt: btoa(String.fromCharCode(...salt)), hash });
  } else {
    if (!existing)
      throw new Error(
        "No se ha configurado el acceso local. Vuelve a abrir el editor.",
      );
    const saved = JSON.parse(existing);
    const salt = Uint8Array.from(atob(saved.salt), (char) =>
      char.charCodeAt(0),
    );
    if ((await deriveKey(password, salt)) !== saved.hash)
      throw new Error("La clave no es correcta. Vuelve a intentarlo.");
  }
}
