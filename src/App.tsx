wimport { lazy, Suspense, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Brand, Icon, Sprig, ThreadHeart, YarnMark } from "./Artwork";
import type { IconName } from "./Artwork";
import { ProductDetail, QuoteForm } from "./Inquiry";
import {
  GENERAL_MESSAGE,
  KEYS,
  ORIGINAL_IMAGES,
  formatPrice,
  loadImages,
  resolveProducts,
  whatsapp,
} from "./store";
import type { Filter, Product, SiteImages } from "./store";
import {
  fetchCloudImages,
  fetchCloudProducts,
  saveCloudImages,
  saveCloudProducts,
} from "./supabase";

const AdminPanel = lazy(() => import("./AdminPanel"));
const navigation = [
  ["inicio", "Inicio"],
  ["catalogo", "Catálogo"],
  ["nosotros", "Nosotros"],
  ["contacto", "Contacto"],
];
const filters: { label: Filter; icon: IconName }[] = [
  { label: "Todas", icon: "grid" },
  { label: "Amigurumis", icon: "bear" },
  { label: "Muñecas", icon: "doll" },
  { label: "Flores", icon: "flower" },
  { label: "Personalizados", icon: "needle" },
];

export default function App() {
  // null while the published catalog is being fetched for a visitor.
  const [products, setProducts] = useState<Product[] | null>(null);
  const catalog = products ?? [];
  const [images, setImages] = useState(loadImages);
  const [filter, setFilter] = useState<Filter>("Todas");
  const [activeNav, setActiveNav] = useState("inicio");
  const [menuOpen, setMenuOpen] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [reference, setReference] = useState<Product | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const selectedProduct = catalog.find(
    (p) => p.id === productId && p.available,
  );
  const displayed = catalog.filter(
    (p) => p.available && (filter === "Todas" || p.category === filter),
  );
  const availableFilters = catalog.some(
    (p) => p.available && p.category === "Otros",
  )
    ? [...filters, { label: "Otros" as Filter, icon: "spark" as IconName }]
    : filters;

  useEffect(() => {
  let cancelled = false;

  async function loadCloudData() {
    try {
      const [cloudProducts, cloudImages] = await Promise.all([
        fetchCloudProducts(),
        fetchCloudImages(),
      ]);

      if (cancelled) return;

      const published = await resolveProducts();

      if (cancelled) return;

      setProducts(cloudProducts.length ? cloudProducts : published);

      if (cloudImages) {
        setImages(cloudImages);
      }
    } catch {
      if (!cancelled) {
        setProducts(await resolveProducts());
      }
    }
  }

  loadCloudData();

  return () => {
    cancelled = true;
  };
}, []);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateNav = () => {
      let active = "inicio";
      for (const [id] of navigation) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= 170) active = id;
      }
      if (
        window.scrollY > 0 &&
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 3
      )
        active = "contacto";
      setActiveNav(active);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateNav);
    };
    const sync = (e: StorageEvent) => {
      if (!e.key || e.key === KEYS.products)
        resolveProducts().then(setProducts);
      if (!e.key || e.key === KEYS.images) setImages(loadImages());
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    updateNav();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("storage", sync);
    window.addEventListener("keydown", escape);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("storage", sync);
      window.removeEventListener("keydown", escape);
    };
  }, []);

  const saveProducts = async (next: Product[]) => {
  try {
    const saved = await saveCloudProducts(next);
    setProducts(saved);
    return true;
  } catch (error) {
    alert(error instanceof Error ? error.message : "Error al guardar productos");
    return false;
  }
};
  const saveImages = async (next: SiteImages) => {
  try {
    const saved = await saveCloudImages(next);
    setImages(saved);
    return true;
  } catch (error) {
    alert(error instanceof Error ? error.message : "Error al guardar imágenes");
    return false;
  }
};
  const startQuote = (p: Product | null = null) => {
    setReference(p);
    setProductId(null);
    setQuoteOpen(true);
  };
  const goTo = (id: string) => {
    setActiveNav(id);
    setMenuOpen(false);
  };

  return (
    <>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <div id="inicio" className="announcement">
        <Icon name="spark" size={11} />
        <span>
          Creaciones hechas a mano <b>·</b> Detalles que enamoran
        </span>
        <Icon name="spark" size={11} />
      </div>
      <header className="site-header">
        <div className="site-width header-inner">
          <a
            href="#inicio"
            className="brand-link"
            aria-label="Lorenas Creaciones, inicio"
            onClick={() => goTo("inicio")}
          >
            <Brand logo={images.logo} />
          </a>
          <nav className="desktop-nav" aria-label="Navegación principal">
            {navigation.map(([id, label]) => (
              <a
                href={`#${id}`}
                key={id}
                className={activeNav === id ? "nav-link active" : "nav-link"}
                aria-current={activeNav === id ? "location" : undefined}
                onClick={() => goTo(id)}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <a
              href={whatsapp(GENERAL_MESSAGE)}
              className="header-contact"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="whatsapp" size={18} />
              <span>Conversemos</span>
            </a>
            <button
              className="mobile-menu-button icon-button"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-controls="mobile-navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Icon name={menuOpen ? "close" : "menu"} size={22} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label="Navegación móvil"
          >
            {navigation.map(([id, label]) => (
              <a
                href={`#${id}`}
                key={id}
                onClick={() => goTo(id)}
                className={activeNav === id ? "active" : ""}
              >
                {label}
                <Icon name="chevron" size={15} />
              </a>
            ))}
          </nav>
        )}
      </header>

      <main id="contenido">
        <section
          className={`hero${images.hero !== ORIGINAL_IMAGES.hero ? " custom-hero" : ""}`}
          aria-labelledby="hero-heading"
        >
          <picture className="hero-media">
            {images.hero === ORIGINAL_IMAGES.hero && (
              <source
                media="(max-width: 700px)"
                srcSet="./images/portada-movil.webp"
              />
            )}
            <img
              src={images.hero}
              alt={
                images.hero === ORIGINAL_IMAGES.hero
                  ? "Conejita de vestido rosa y osito con lazo verde, tejidos a crochet en el taller de Lorenas Creaciones"
                  : "Portada del taller de Lorenas Creaciones"
              }
              fetchPriority="high"
              width="2172"
              height="724"
            />
          </picture>
          <div className="hero-shade" />
          <div className="site-width hero-inner">
            <div className="hero-copy">
              <div className="eyebrow hero-eyebrow">
                <span className="short-rule" />
                <span>Hecho con paciencia y mucho amor</span>
              </div>
              <h1 id="hero-heading">
                <span>Pequeñas creaciones,</span>
                <em>
                  grandes emociones.
                  <ThreadHeart />
                </em>
              </h1>
              <p>
                Amigurumis, muñequitas, flores y detalles tejidos a mano. Cada
                creación tiene su propia historia y está hecha para regalar
                momentos especiales.
              </p>
              <div className="hero-buttons">
                <a
                  href="#catalogo"
                  className="button primary"
                  onClick={() => goTo("catalogo")}
                >
                  Descubrir creaciones <Icon name="arrow" size={17} />
                </a>
                <a href="#personalizados" className="button secondary">
                  <Icon name="heart" size={16} />
                  Pedir algo especial
                </a>
              </div>
            </div>
          </div>
          <svg
            className="hero-edge"
            fill="var(--paper)"
            viewBox="0 0 1440 17"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 7C94 12 142 2 221 6c82 6 143 4 240 0 117-5 186 10 303 4 147-8 201-3 305 0 141 6 257-7 371-4v11H0Z" />
          </svg>
        </section>

        <section
          id="catalogo"
          className="catalog-section"
          aria-labelledby="catalog-title"
        >
          <div className="site-width">
            <div className="section-heading">
              <div className="eyebrow centered">
                <Sprig />
                <span>Un mundo tejido a crochet</span>
                <Sprig flipped />
              </div>
              <h2 id="catalog-title">Nuestras creaciones</h2>
              <p>Encuentra ese detalle especial, tejido puntada a puntada.</p>
            </div>
            <div
              className="catalog-filters"
              role="group"
              aria-label="Filtrar por categoría"
            >
              {availableFilters.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setFilter(item.label)}
                  aria-pressed={filter === item.label}
                  className={`filter-button ${filter === item.label ? "selected" : ""}`}
                >
                  <Icon name={item.icon} size={16} />
                  {item.label}
                </button>
              ))}
            </div>
            <p className="sr-only" role="status">
              {displayed.length}{" "}
              {displayed.length === 1 ? "creación" : "creaciones"} en{" "}
              {filter.toLowerCase()}.
            </p>
            {products === null ? (
              <div
                className="product-grid"
                aria-busy="true"
                aria-label="Cargando creaciones"
              >
                {[0, 1, 2, 3].map((i) => (
                  <div className="product-skeleton" key={i} />
                ))}
              </div>
            ) : displayed.length ? (
              <div className="product-grid" key={filter}>
                {displayed.map((product, index) => (
                  <button
                    type="button"
                    key={product.id}
                    className="product-item"
                    style={
                      { "--item-index": Math.min(index, 4) } as CSSProperties
                    }
                    onClick={() => setProductId(product.id)}
                    aria-label={`Ver ${product.name}`}
                  >
                    <div className="product-image-wrap">
                      <img
                        className="product-image"
                        src={product.image}
                        width="760"
                        height="760"
                        loading="lazy"
                        alt={product.name}
                      />
                      <span className="product-quickview">
                        Descubrir <Icon name="arrow" size={15} />
                      </span>
                    </div>
                    <div className="product-meta">
                      <div>
                        <span className="product-category">
                          {product.category}
                        </span>
                        <h3>{product.name}</h3>
                        <span className="product-price">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      <span className="product-open">
                        <Icon name="diagonal" size={17} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Sprig />
                <h3>Próximas creaciones</h3>
                <p>
                  Por ahora no hay piezas disponibles en esta categoría. Podemos
                  tejer una para ti.
                </p>
                <button className="text-button" onClick={() => startQuote()}>
                  Cuéntame tu idea <Icon name="arrow" size={16} />
                </button>
              </div>
            )}
            {displayed.length > 0 && displayed.every((p) => p.inspiration) && (
              <p className="collection-footnote">
                <Icon name="needle" size={14} />
                Diseños de inspiración. Consulta colores y disponibilidad.
              </p>
            )}
          </div>
        </section>

        <section
          id="personalizados"
          className="custom-section"
          aria-labelledby="custom-title"
        >
          <div className="site-width custom-inner">
            <div className="custom-illustration">
              <YarnMark />
            </div>
            <div className="custom-copy">
              <span className="eyebrow">Un regalo único</span>
              <h2 id="custom-title">¿Tienes una idea especial?</h2>
              <p>
                Cuéntanos qué personaje, animalito o detalle tejido te gustaría.
                Elegimos juntos sus colores, tamaño y pequeños detalles.
              </p>
            </div>
            <button className="button primary" onClick={() => startQuote()}>
              Quiero cotizar <Icon name="arrow" size={17} />
            </button>
          </div>
        </section>

        <section
          id="nosotros"
          className="about-section site-width"
          aria-labelledby="about-title"
        >
          <div className="about-photo-wrap">
            <img
              className="about-photo"
              src={images.about}
              loading="lazy"
              width="1100"
              height="825"
              alt={
                images.about === ORIGINAL_IMAGES.about
                  ? "Manos de una artesana tejiendo un vestido rosa a crochet"
                  : "Fotografía del taller de Lorenas Creaciones"
              }
            />
          </div>
          <div className="about-copy">
            <span className="eyebrow">
              <Sprig />
              El cariño está en los detalles
            </span>
            <h2 id="about-title">
              Tejido con amor,
              <br />
              <em>pensado para ti.</em>
            </h2>
            <p>
              En Lorenas Creaciones creemos que los regalos más bonitos son
              aquellos que llevan tiempo, dedicación y un poquito de magia. Cada
              pieza se realiza a mano, cuidando sus detalles para que recibas
              algo especial.
            </p>
            <p>
              Gracias por apoyar el trabajo artesanal y permitirnos ser parte de
              tus momentos importantes.
            </p>
            <div className="signature">
              {images.logo ? (
                <img src={images.logo} alt="Logo de Lorenas Creaciones" />
              ) : (
                <Icon name="heart" size={26} />
              )}
              <span>Con cariño, Lorena</span>
            </div>
          </div>
        </section>

        <section
          id="contacto"
          className="contact-section"
          aria-labelledby="contact-title"
        >
          <div className="site-width">
            <div className="eyebrow centered">
              <Sprig />
              Contacto
              <Sprig flipped />
            </div>
            <h2 id="contact-title">Hablemos de tu próxima creación</h2>
            <p>
              Consulta disponibilidad, precios o pide un diseño personalizado.
            </p>
            <a
              href={whatsapp(GENERAL_MESSAGE)}
              className="button primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="whatsapp" />
              Contactar por WhatsApp
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-width footer-inner">
          <a href="#inicio" aria-label="Lorenas Creaciones, volver al inicio">
            <Brand logo={images.logo} />
          </a>
          <p>© {new Date().getFullYear()} Lorenas Creaciones</p>
          <button className="admin-access" onClick={() => setAdminOpen(true)}>
            <Icon name="lock" size={14} />
            Acceso administración
          </button>
        </div>
      </footer>
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setProductId(null)}
          onCustomize={() => startQuote(selectedProduct)}
        />
      )}
      {quoteOpen && (
        <QuoteForm reference={reference} onClose={() => setQuoteOpen(false)} />
      )}
      {adminOpen && (
        <Suspense
          fallback={
            <div className="loading-notice" role="status">
              Abriendo el taller...
            </div>
          }
        >
          <AdminPanel
            products={catalog}
            images={images}
            onSaveProducts={saveProducts}
            onSaveImages={saveImages}
            onClose={() => setAdminOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
}
