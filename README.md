# MANTRA

Directorio de tatuadores con reserva de sesiones. Sitio estático (HTML, CSS y JavaScript), sin dependencias que instalar.

- Directorio de artistas con filtros por estilo y ciudad, ficha de cada artista y próximos huecos.
- Galería por estilos con visor, obras guardadas y «quiero algo así».
- Calculadora de presupuesto a partir de la tarifa por hora de cada artista.
- Asistente de reserva en cuatro pasos con agenda por artista, y «Mi espacio» para cambiar de fecha, cancelar o exportar la cita a tu calendario (.ics).
- Instalable como app (PWA) y utilizable sin conexión.

Las reservas y las obras guardadas se almacenan en el navegador (localStorage). Artistas, estudios y agenda son ficticios; la ocupación de la agenda se genera de forma determinista.

## Abrirlo

Abre `index.html`, o sírvelo para poder instalarlo como app:

```bash
npx serve .
```

`data.js` contiene artistas, obras, tamaños y textos. Fotografías de Unsplash; GSAP y las tipografías van incluidas en `vendor/` y `fonts/`.
