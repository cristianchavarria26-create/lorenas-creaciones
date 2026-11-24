import { useState } from "react";
import { Icon, Sprig } from "./Artwork";
import Modal from "./Modal";
import { formatPrice, whatsapp } from "./store";
import type { Product } from "./store";

export function ProductDetail({
  product,
  onClose,
  onCustomize,
}: {
  product: Product;
  onClose: () => void;
  onCustomize: () => void;
}) {
  const message = `Hola, Lorena. Me encantó «${product.name}» de tu catálogo. ¿Podrías contarme su disponibilidad${product.price ? ` y el plazo de entrega? Vi su precio de ${formatPrice(product.price)} CLP.` : ", precio y plazo de entrega?"}`;
  return (
    <Modal label={product.name} onClose={onClose} className="product-modal">
      <div className="product-detail">
        <img className="detail-photo" src={product.image} alt={product.name} />
        <div className="detail-copy">
          <span className="eyebrow">
            <Sprig />
            {product.category}
          </span>
          <h2>{product.name}</h2>
          <p className="detail-price">
            {formatPrice(product.price)}
            {product.price > 0 && <small> CLP</small>}
          </p>
          <p className="body-copy">
            {product.description ||
              "Una creación tejida a mano. Conversemos sobre sus detalles y disponibilidad."}
          </p>
          <div className="detail-note">
            <Icon name="needle" size={19} />
            <span>
              {product.inspiration
                ? "Diseño de inspiración, tejido a pedido."
                : "Una creación hecha a mano, con cariño."}
            </span>
          </div>
          <a
            className="button primary"
            href={whatsapp(message)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="whatsapp" />
            Consultar por WhatsApp
          </a>
          <button className="text-button" onClick={onCustomize}>
            Personalizar este diseño <Icon name="arrow" size={16} />
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function QuoteForm({
  onClose,
  reference,
}: {
  onClose: () => void;
  reference: Product | null;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(reference?.category || "Amigurumis");
  const [idea, setIdea] = useState(
    reference ? `Me gustaría personalizar el diseño «${reference.name}». ` : "",
  );
  const [colors, setColors] = useState("");
  const [prepared, setPrepared] = useState(false);
  const message = `Hola, Lorena. Soy ${name.trim()} y me gustaría cotizar una creación personalizada.\n\nTipo de creación: ${category}.\nMi idea: ${idea.trim()}${colors.trim() ? `\nColores: ${colors.trim()}.` : ""}\n\n¿Podemos conversar sobre el precio y el plazo de elaboración?`;
  return (
    <Modal
      label="Cotizar una creación personalizada"
      onClose={onClose}
      className="form-modal"
    >
      <span className="eyebrow">
        <Sprig />
        Un regalo único
      </span>
      <h2>{prepared ? "Tu idea está lista." : "Cuéntame tu idea."}</h2>
      {prepared ? (
        <div className="quote-ready" aria-live="polite">
          <p className="body-copy">
            Abre WhatsApp para revisar y enviar tu consulta a Lorena. Todavía no
            se ha enviado ningún mensaje.
          </p>
          <div className="message-preview">{message}</div>
          <a
            className="button primary w-full"
            href={whatsapp(message)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="whatsapp" />
            Abrir WhatsApp <Icon name="diagonal" size={15} />
          </a>
          <button
            className="text-button centered"
            onClick={() => setPrepared(false)}
          >
            Volver a editar mi idea
          </button>
        </div>
      ) : (
        <>
          <p className="body-copy">
            Un personaje, tus colores favoritos, un regalo especial. Todo
            empieza con una conversación.
          </p>
          <form
            className="editor-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim() && idea.trim()) setPrepared(true);
            }}
          >
            <div className="field-row">
              <label>
                Tu nombre
                <input
                  required
                  maxLength={70}
                  autoComplete="given-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="¿Cómo te llamas?"
                  pattern=".*\S.*"
                />
              </label>
              <label>
                Tipo de creación
                <select
                  aria-label="Tipo de creación"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as typeof category)
                  }
                >
                  {[
                    "Amigurumis",
                    "Muñecas",
                    "Flores",
                    "Personalizados",
                    "Otros",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              ¿Qué te gustaría crear?
              <textarea
                required
                minLength={5}
                maxLength={450}
                rows={4}
                value={idea}
                onChange={(e) => {
                  setIdea(e.target.value);
                  e.target.setCustomValidity(
                    e.target.value.trim().length >= 5
                      ? ""
                      : "Cuéntanos tu idea con al menos 5 caracteres.",
                  );
                }}
                placeholder="Por ejemplo, una conejita para regalar, con un vestido en tonos pastel..."
              />
            </label>
            <label>
              Colores que imaginas <span className="optional">(opcional)</span>
              <input
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                maxLength={100}
                placeholder="Rosa, crema, lavanda..."
              />
            </label>
            <button className="button primary w-full" type="submit">
              Preparar mi consulta <Icon name="arrow" />
            </button>
            <p className="form-hint centered">
              Sin compromiso. Confirmaremos los detalles por WhatsApp.
            </p>
          </form>
        </>
      )}
    </Modal>
  );
}
