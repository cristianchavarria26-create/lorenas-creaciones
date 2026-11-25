import { useState } from "react";
import { adminLogin, adminLogout } from "./supabase";
import type { FormEvent, ChangeEvent } from "react";
import { Brand, Icon, Sprig } from "./Artwork";
import Modal from "./Modal";
import {
  CATEGORIES,
  ORIGINAL_IMAGES,
  errorMessage,
  fileAsDataURL,
  formatPrice,
  optimizeImage,
  validProducts,
  fetchPublishedProducts,
} from "./store";
import type { Category, Product, SiteImages } from "./store";

interface AdminProps {
  products: Product[];
  images: SiteImages;
  onSaveProducts: (next: Product[]) => Promise<boolean>;
onSaveImages: (next: SiteImages) => Promise<boolean>;
}
type Notify = (text: string, error?: boolean) => void;

function AdminLogin({ onUnlock }: { onUnlock: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      await adminLogin(email, password);
      onUnlock();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="login-brand">
        <Brand />
      </div>
      <span className="eyebrow">Administración en línea</span>
      <h2>Bienvenida a tu taller.</h2>
      <p className="body-copy">
        Ingresa con tu correo y contraseña de administrador.
      </p>
      <form className="editor-form" onSubmit={submit}>
        <label>
          Correo electrónico
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu correo electrónico"
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
          />
        </label>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button className="button primary w-full" type="submit" disabled={busy}>
          <Icon name="lock" size={16} />
          {busy ? "Verificando..." : "Iniciar sesión"}
        </button>
      </form>
      <p className="privacy-note">
        Acceso privado para administrar los productos e imágenes de la tienda.
      </p>
    </>
  );
}

function ProductEditor({
  product,
  onSave,
  onBack,
}: {
  product: Product | null;
  onSave: (p: Product) => Promise<boolean>;
  onBack: () => void;
}) {
  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [category, setCategory] = useState<Category>(
    product?.category || "Amigurumis",
  );
  const [description, setDescription] = useState(product?.description || "");
  const [available, setAvailable] = useState(product?.available ?? true);
  const [image, setImage] = useState(product?.image || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const readPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      setImage(await optimizeImage(file));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  const submit = async (e: FormEvent) => {
  e.preventDefault();
  setError("");
  if (!image) {
    setError("Añade una fotografía para guardar la creación.");
    return;
  }
  if (!name.trim()) {
    setError("Escribe un nombre para la creación.");
    return;
  }
  const amount = Number(price);
  if (!Number.isSafeInteger(amount) || amount < 0 || amount % 500 !== 0) {
    setError("El precio debe ser positivo o cero, en incrementos de $500.");
    return;
  }
  setBusy(true);
  try {
    const saved = await onSave({
      id: product?.id || crypto.randomUUID(),
      name: name.trim(),
      price: amount,
      category,
      description: description.trim(),
      available,
      image,
      inspiration: false,
    });
    if (!saved) {
      setError("No se pudo guardar. Inténtalo nuevamente.");
    }
  } catch (err) {
    setError(errorMessage(err));
  } finally {
    setBusy(false);
  }
};
  return (
    <div className="product-editor">
      <button type="button" className="back-link" onClick={onBack}>
        <Icon name="arrow" size={15} />
        Volver a productos
      </button>
      <h3>{product ? "Editar creación" : "Nueva creación"}</h3>
      <form className="editor-form" onSubmit={submit}>
        <div className="photo-input-row">
          <div className="upload-preview">
            {image ? (
              <img src={image} alt="Vista previa de la creación" />
            ) : (
              <Icon name="picture" size={30} />
            )}
          </div>
          <div>
            <span className="field-title">Fotografía del producto *</span>
            <label className="button secondary small file-button">
              <Icon name="upload" size={15} />
              {busy
                ? "Preparando..."
                : image
                  ? "Cambiar fotografía"
                  : "Subir fotografía"}
              <input
                type="file"
                aria-label="Fotografía del producto"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={readPhoto}
                disabled={busy}
              />
            </label>
            <p className="form-hint">JPG, PNG, WebP o AVIF. Máximo 12 MB.</p>
          </div>
        </div>
        <label>
          Nombre de la creación *
          <input
            required
            maxLength={90}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Por ejemplo, Conejita Olivia"
          />
        </label>
        <div className="field-row">
          <label>
            Precio en CLP *
            <input
              type="number"
              required
              min={0}
              step={500}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
            />
            <span className="form-hint">Usa 0 para mostrar «A cotizar».</span>
          </label>
          <label>
            Categoría
            <select
              aria-label="Categoría"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Descripción
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={450}
            rows={3}
            placeholder="Cuéntanos los detalles de esta pieza..."
          />
          <span className="form-hint counter">{description.length}/450</span>
        </label>
        <label className="check-field">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
          />
          <span>Disponible en el catálogo</span>
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="button secondary" onClick={onBack}>
            Cancelar
          </button>
          <button type="submit" className="button primary" disabled={busy}>
            <Icon name="check" size={17} />
            Guardar creación
          </button>
        </div>
      </form>
    </div>
  );
}

function ImageSettings({
  images,
  onSave,
  notify,
}: {
  images: SiteImages;
  onSave: (next: SiteImages) => Promise<boolean>;
  notify: Notify;
}) {
  const [busy, setBusy] = useState("");
  const [restore, setRestore] = useState(false);
  const entries: { key: keyof SiteImages; title: string; text: string }[] = [
    {
      key: "logo",
      title: "Logo de la marca",
      text: "Se muestra en el menú, en Nosotros y en el pie de página.",
    },
    {
      key: "hero",
      title: "Imagen de portada",
      text: "Usa una foto horizontal, con espacio libre a la izquierda.",
    },
    {
      key: "about",
      title: "Fotografía del taller",
      text: "La imagen que acompaña la historia de Nosotros.",
    },
  ];
  const upload = async (
  e: ChangeEvent<HTMLInputElement>,
  key: keyof SiteImages,
) => {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (!file) return;
  setBusy(key);
  try {
    const image = await optimizeImage(
      file,
      key === "hero" ? 2000 : key === "logo" ? 480 : 1100,
    );
    const saved = await onSave({ ...images, [key]: image });

    if (!saved) {
      notify("No se pudo guardar la imagen. Inténtalo nuevamente.", true);
      return;
    }

    notify("Imagen guardada en la nube.");
  } catch (err) {
    notify(errorMessage(err), true);
  } finally {
    setBusy("");
  }
};
  return (
    <div className="image-settings">
      <h3>Imágenes del sitio</h3>
      <p className="body-copy">
        Dale al taller tu identidad con tus propias fotografías.
      </p>
      {entries.map(({ key, title, text }) => (
        <div className="image-setting" key={key}>
          <div className={`setting-preview ${key}`}>
            {images[key] ? <img src={images[key]} alt={title} /> : <Brand />}
          </div>
          <div>
            <h4>{title}</h4>
            <p>{text}</p>
            <label className="file-button text-button">
              <Icon name="upload" size={14} />
              {busy === key ? "Preparando..." : "Cambiar imagen"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                aria-label={`Cambiar ${title.toLowerCase()}`}
                disabled={!!busy}
                onChange={(e) => upload(e, key)}
              />
            </label>
          </div>
        </div>
      ))}
      {restore ? (
        <div className="confirmation">
          <p>
            ¿Restaurar el logo, la portada y la foto del taller? Tus productos
            no cambiarán.
          </p>
          <div className="inline-actions">
            <button
              className="button secondary small"
              onClick={() => setRestore(false)}
            >
              Cancelar
            </button>
            <button
              className="button primary small"
              onClick={async () => {
  try {
    const saved = await onSave({ ...ORIGINAL_IMAGES });

    if (!saved) {
      notify("No se pudieron restaurar las imágenes.", true);
      return;
    }

    setRestore(false);
    notify("Imágenes originales restauradas en la nube.");
  } catch (e) {
    notify(errorMessage(e), true);
  }
}}
            >
              Sí, restaurar
            </button>
          </div>
        </div>
      ) : (
        <button
          className="text-button"
          onClick={() => setRestore(true)}
          disabled={!!busy}
        >
          Restaurar imágenes originales
        </button>
      )}
    </div>
  );
}

function Backups({
  products,
  onSave,
  notify,
}: {
  products: Product[];
  onSave: (next: Product[]) => Promise<boolean>;
  notify: Notify;
}) {
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Product[] | null>(null);
  const exportJSON = async () => {
    setBusy(true);
    try {
      const portable = await Promise.all(
        products.map(async (p) => {
          if (p.image.startsWith("data:")) return p;
          const response = await fetch(p.image);
          if (!response.ok)
            throw new Error(
              "No se pudo incluir una de las fotografías. Inténtalo nuevamente.",
            );
          return { ...p, image: await fileAsDataURL(await response.blob()) };
        }),
      );
      const blob = new Blob(
        [
          JSON.stringify(
            {
              sitio: "Lorenas_Creaciones",
              version: 1,
              fecha: new Date().toISOString(),
              productos: portable,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "productos.json";
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      notify(
        "productos.json descargado con todos tus productos y fotografías. Súbelo junto a index.html para publicarlo.",
      );
    } catch (err) {
      notify(errorMessage(err), true);
    } finally {
      setBusy(false);
    }
  };
  const loadPublished = async () => {
    setBusy(true);
    setPending(null);
    try {
      const list = await fetchPublishedProducts();
      if (!list)
        throw new Error(
          "No se encontró un productos.json publicado junto a esta página.",
        );
      setPending(list);
    } catch (err) {
      notify(errorMessage(err), true);
    } finally {
      setBusy(false);
    }
  };
  const importJSON = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPending(null);
    try {
      if (file.size > 12 * 1024 * 1024)
        throw new Error("El archivo JSON no puede superar los 12 MB.");
      const value = JSON.parse(await file.text());
      const list: unknown = Array.isArray(value) ? value : value?.productos;
      if (!validProducts(list))
        throw new Error(
          "El archivo no contiene un catálogo válido. Usa una copia exportada desde el taller.",
        );
      setPending(list);
    } catch (err) {
      notify(
        err instanceof SyntaxError
          ? "Este archivo no es un JSON válido."
          : errorMessage(err),
        true,
      );
    }
  };
  return (
    <div className="backup-panel">
      <h3>Publicar y respaldar</h3>
      <p className="body-copy">
        Lo que guardas en este panel solo se ve en este navegador. Para que
        todas las personas vean tu catálogo, descarga{" "}
        <strong>productos.json</strong> y súbelo a tu hosting en la misma
        carpeta que <strong>index.html</strong>, reemplazando el anterior.
      </p>
      <div className="backup-option">
        <div>
          <h4>Descargar productos.json</h4>
          <p>
            {products.length} productos con sus fotografías. Sirve también como
            copia de seguridad.
          </p>
        </div>
        <button
          className="button primary small"
          disabled={busy}
          onClick={exportJSON}
        >
          <Icon name="download" size={16} />
          {busy ? "Preparando..." : "Descargar productos.json"}
        </button>
      </div>
      <div className="backup-option">
        <div>
          <h4>Cargar el catálogo publicado</h4>
          <p>Trae a este dispositivo los productos ya visibles en la web.</p>
        </div>
        <button
          className="button secondary small"
          disabled={busy}
          onClick={loadPublished}
        >
          <Icon name="picture" size={16} />
          Cargar publicado
        </button>
      </div>
      <div className="backup-option">
        <div>
          <h4>Importar una copia</h4>
          <p>Podrás revisarla antes de reemplazar el catálogo.</p>
        </div>
        <label className="button secondary small file-button">
          <Icon name="upload" size={16} />
          Elegir archivo
          <input
            type="file"
            aria-label="Importar copia JSON"
            accept="application/json,.json"
            onChange={importJSON}
          />
        </label>
      </div>
      {pending && (
        <div className="confirmation">
          <h4>¿Reemplazar el catálogo de este navegador?</h4>
          <p>
            Se reemplazarán los {products.length} productos actuales por{" "}
            {pending.length} productos del archivo. Las imágenes del sitio y la
            clave no cambiarán.
          </p>
          <div className="inline-actions">
            <button
              className="button secondary small"
              onClick={() => setPending(null)}
            >
              Cancelar
            </button>
            <button
              className="button primary small"
              onClick={async () => {
  try {
    const saved = await onSave(pending);

    if (!saved) {
      notify("No se pudo restaurar el catálogo.", true);
      return;
    }

    setPending(null);
    notify("Catálogo restaurado correctamente en la nube.");
  } catch (err) {
    notify(errorMessage(err), true);
  }
}}
            >
              Restaurar copia
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPanel({
  products,
  images,
  onSaveProducts,
  onSaveImages,
  onClose,
}: AdminProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState("Productos");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(
    null,
  );
  const notify: Notify = (text, error = false) => setNotice({ text, error });
  const changeTab = (value: string) => {
    setTab(value);
    setEditing(null);
    setDeleting(null);
    setNotice(null);
  };
  const save = async (p: Product) => {
  const saved = await onSaveProducts(
    products.some((item) => item.id === p.id)
      ? products.map((item) => (item.id === p.id ? p : item))
      : [...products, p],
  );

  if (!saved) return;

  setEditing(null);
  notify("Creación guardada en la nube.");
};
  return (
    <Modal
      label="Administración del taller"
      onClose={onClose}
      className={unlocked ? "admin-modal" : "form-modal login-modal"}
    >
      {!unlocked ? (
        <AdminLogin onUnlock={() => setUnlocked(true)} />
      ) : (
        <>
          <div className="admin-heading">
            <div>
              <span className="eyebrow">
                <Sprig />
                Lorenas Creaciones
              </span>
              <h2>Mi taller</h2>
            </div>
            <button
              className="text-button"
              onClick={() => { 
                adminLogout();
                setUnlocked(false);
                changeTab("Productos");
              }}
            >
              <Icon name="exit" size={15} />
              Cerrar sesión
            </button>
          </div>
          <nav className="admin-tabs" aria-label="Secciones de administración">
            {["Productos", "Imágenes", "Publicar"].map((t) => (
              <button
                key={t}
                onClick={() => changeTab(t)}
                aria-current={t === tab ? "page" : undefined}
                className={t === tab ? "active" : ""}
              >
                {t}
              </button>
            ))}
          </nav>
          {notice && (
            <div
              className={
                notice.error
                  ? "form-error admin-notice"
                  : "success-notice admin-notice"
              }
              role={notice.error ? "alert" : "status"}
            >
              {notice.text}
              <button
                type="button"
                aria-label="Ocultar aviso"
                onClick={() => setNotice(null)}
              >
                <Icon name="close" size={14} />
              </button>
            </div>
          )}
          {tab === "Productos" &&
            (editing ? (
              <ProductEditor
                product={editing === "new" ? null : editing}
                onBack={() => setEditing(null)}
                onSave={save}
              />
            ) : (
              <>
                <div className="list-heading">
                  <div>
                    <h3>Tu catálogo</h3>
                    <p>
                      {products.length} creaciones ·{" "}
                      {products.filter((p) => p.available).length} visibles
                    </p>
                  </div>
                  <button
                    className="button primary small"
                    onClick={() => {
                      setEditing("new");
                      setNotice(null);
                      setDeleting(null);
                    }}
                  >
                    <Icon name="plus" size={16} />
                    Agregar producto
                  </button>
                </div>
                {products.some((p) => p.inspiration) && (
                  <p className="sample-note">
                    Los diseños de inspiración son ejemplos editables.
                    Sustitúyelos por tus creaciones y precios reales.
                  </p>
                )}
                {deleting && (
                  <div className="confirmation" role="alert">
                    <h4>¿Eliminar «{deleting.name}»?</h4>
                    <p>
                      Esta creación se quitará del catálogo local. Esta acción
                      no se puede deshacer.
                    </p>
                    <div className="inline-actions">
                      <button
                        className="button secondary small"
                        onClick={() => setDeleting(null)}
                      >
                        Cancelar
                      </button>
                      <button
                        className="button danger small"
                        onClick={async () => {
  try {
    const saved = await onSaveProducts(
      products.filter((p) => p.id !== deleting.id),
    );

    if (!saved) {
      notify("No se pudo eliminar el producto.", true);
      return;
    }

    setDeleting(null);
    notify("Producto eliminado correctamente de la nube.");
  } catch (err) {
    notify(errorMessage(err), true);
  }
}}
                      >
                        Sí, eliminar
                      </button>
                    </div>
                  </div>
                )}
                <div className="admin-products">
                  {products.map((p) => (
                    <div className="admin-product" key={p.id}>
                      <img src={p.image} alt="" />
                      <div className="admin-product-name">
                        <h4>{p.name}</h4>
                        <p>
                          {p.category} · {formatPrice(p.price)}
                        </p>
                      </div>
                      <button
                        role="switch"
                        className={`availability ${p.available ? "on" : ""}`}
                        aria-checked={p.available}
                        aria-label={`Disponibilidad de ${p.name}`}
                        onClick={() => {
                          try {
                            onSaveProducts(
                              products.map((item) =>
                                item.id === p.id
                                  ? { ...item, available: !p.available }
                                  : item,
                              ),
                            );
                            notify(
                              p.available
                                ? "Producto marcado como agotado. Ya no se muestra en el catálogo."
                                : "Producto disponible y visible en el catálogo.",
                            );
                          } catch (err) {
                            notify(errorMessage(err), true);
                          }
                        }}
                      >
                        <span />
                        {p.available ? "Disponible" : "Agotado"}
                      </button>
                      <div className="row-tools">
                        <button
                          className="icon-button"
                          aria-label={`Editar ${p.name}`}
                          onClick={() => {
                            setEditing(p);
                            setNotice(null);
                            setDeleting(null);
                          }}
                        >
                          <Icon name="edit" size={17} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`Eliminar ${p.name}`}
                          onClick={() => {
                            setDeleting(p);
                            setNotice(null);
                          }}
                        >
                          <Icon name="trash" size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {!products.length && (
                  <div className="empty-state">
                    <Icon name="needle" size={32} />
                    <h4>El taller está listo</h4>
                    <p>
                      Agrega tu primera creación para mostrarla en el catálogo.
                    </p>
                  </div>
                )}
              </>
            ))}
          {tab === "Imágenes" && (
            <ImageSettings
              images={images}
              onSave={onSaveImages}
              notify={notify}
            />
          )}
          {tab === "Publicar" && (
            <Backups
              products={products}
              onSave={onSaveProducts}
              notify={notify}
            />
          )}
          <p className="admin-local-note">
            <Icon name="lock" size={13} />
            Editor local. Los cambios solo se guardan en este navegador.
          </p>
        </>
      )}
    </Modal>
  );
}
