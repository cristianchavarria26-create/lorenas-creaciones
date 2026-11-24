# Lorenas Creaciones

Sitio artesanal en español, desarrollado con React, TypeScript, Vite y Tailwind CSS. El punto de entrada es `src/App.tsx`.

## Ejecutar

```sh
npm install
npm run dev
```

`npm run build` genera el sitio estático en `dist/`. Para revisarlo, ejecuta `npm run preview`. Publica todo el contenido de `dist/`, incluidas las carpetas de imágenes y fuentes, en la raíz de un sitio con HTTPS.

## Catálogo y consultas

- Catálogo de cuatro columnas en escritorio y dos en móvil, con imágenes cuadradas y filtros por categoría.
- Cuatro diseños iniciales de inspiración con imágenes generadas para esta presentación. No representan inventario confirmado. El precio inicial es cero y se muestra como «A cotizar».
- Las fichas de producto y el formulario de personalización preparan consultas dirigidas al WhatsApp `+56 9 3008 1168`. El visitante revisa y envía el mensaje desde WhatsApp; la web no lo envía automáticamente.
- Los productos agotados permanecen en el editor y se ocultan en la colección pública.

## Editor local

Abre **Acceso administración** al pie de la página. En el primer acceso a ese navegador, establece y confirma una clave de al menos diez caracteres. Al cerrar la ventana del editor o recargar la página, la sesión se bloquea.

**Productos:** crear, editar, eliminar con confirmación, añadir fotografías y cambiar disponibilidad. Los nombres admiten hasta 90 caracteres y las descripciones hasta 450. Los precios se introducen en pesos chilenos, en incrementos de 500.

**Imágenes:** cambiar el logo, la portada y la fotografía del taller, o restaurar las imágenes incluidas en el diseño. Las fotografías subidas se redimensionan y convierten a WebP en el dispositivo.

**Copias de seguridad:** exportar el catálogo con las fotografías incorporadas en un JSON portátil. La importación valida los campos y solicita confirmación antes de reemplazar el catálogo. Las copias de productos no incluyen la clave ni las imágenes de marca.

## Publicar el sitio

1. Ejecuta `npm run build`. Todo lo necesario queda en la carpeta `dist/`.
2. Sube **el contenido** de `dist/` a la raíz de un hosting con HTTPS (Netlify, Cloudflare Pages, Vercel o un hosting tradicional en `public_html`). Las rutas de imágenes y fuentes son absolutas (`/images/…`), por lo que el sitio debe quedar en la raíz del dominio o de un subdominio, no en una subcarpeta.
3. Para actualizar el sitio, repite el proceso y reemplaza los archivos.

## Publicar el catálogo (productos.json)

Los visitantes cargan los productos desde `productos.json`, ubicado junto a `index.html`. Para publicar tus creaciones reales:

1. Abre el sitio publicado, entra en **Acceso administración** y agrega tus productos con fotografías.
2. En la pestaña **Publicar**, pulsa **Descargar productos.json**.
3. Sube ese archivo al hosting en la misma carpeta que `index.html`, reemplazando el anterior.

Prioridad de carga: ediciones guardadas en el navegador actual → `productos.json` publicado → diseños de ejemplo incluidos en el código. En otro dispositivo, **Cargar publicado** trae los productos de la web para seguir editándolos. Las fotografías viajan dentro del JSON (WebP, máximo 1000 px), así que un catálogo de 30 productos ronda los 3 a 5 MB; mantén las fotos razonables.

## Almacenamiento y publicación

El catálogo utiliza `lorenas_creaciones_products_v1` y las imágenes del sitio `lorenas_creaciones_site_images_v1` en `localStorage`. Los cambios solo afectan al navegador y al origen web donde se realizan. Borrar los datos del navegador elimina estos cambios. Exporta copias periódicamente.

No hay una contraseña fija en el código: se guarda un verificador local derivado con PBKDF2-SHA256, 210 000 iteraciones y una sal aleatoria. Web Crypto requiere HTTPS o localhost.

La clave local es un bloqueo de la interfaz, **no es autenticación de servidor**. Una persona con acceso a los datos del navegador puede modificarlos. Para que un administrador publique cambios que vean todos los visitantes, se requiere una base de datos compartida, un servicio de imágenes y autenticación y autorización en el servidor.

## Recursos

Las fotografías WebP se encuentran en `public/images/`. Las familias DM Sans, Playfair Display y Allura se sirven desde `public/fonts/` con sus licencias, sin depender de peticiones a Google Fonts al cargar la página.
