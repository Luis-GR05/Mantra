/* MANTRA — datos del directorio. Fotografías: Unsplash (licencia Unsplash, uso libre). */
(function () {
  const u = (id, w, h) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=72&w=${w}` + (h ? `&h=${h}` : '');

  const ESTILOS = [
    { id: 'blackwork', nombre: 'Blackwork' },
    { id: 'fineline', nombre: 'Fineline' },
    { id: 'realismo', nombre: 'Realismo' },
    { id: 'japones', nombre: 'Japonés' },
    { id: 'geometrico', nombre: 'Geométrico' },
    { id: 'neotradicional', nombre: 'Neotradicional' }
  ];

  const ARTISTAS = [
    {
      id: 'nyx', nombre: 'Nyx Vértigo', estilos: ['blackwork', 'geometrico'], ciudad: 'Madrid',
      estudio: 'Casa Negra, Lavapiés', tarifa: 95, minimo: 120, valoracion: 4.9, resenas: 212, desde: 2014,
      foto: '1542744383-8c330d91f4b1', dias: [2, 3, 4, 5, 6],
      bio: 'Trabaja el negro sólido y el dotwork a mano alzada. Sus piezas parten del cuerpo, no del papel: dibuja directamente sobre la piel y decide el diseño contigo el mismo día.',
      resena: { texto: 'Llegué con una idea vaga y salí con la pieza que no sabía describir. Cero prisas.', autor: 'Irene, espalda completa' }
    },
    {
      id: 'kael', nombre: 'Kael Sombra', estilos: ['realismo', 'blackwork'], ciudad: 'Barcelona',
      estudio: 'Atelier Umbra, Gràcia', tarifa: 130, minimo: 200, valoracion: 4.8, resenas: 167, desde: 2011,
      foto: '1568515045052-f9a854d70bfd', dias: [1, 2, 3, 4, 5],
      bio: 'Retrato y realismo en escala de grises. Pide siempre la fotografía original y trabaja en sesiones largas con pausas pactadas. Lista de espera habitual de tres semanas.',
      resena: { texto: 'El retrato de mi abuelo tiene hasta el brillo de las gafas. Dos sesiones de seis horas.', autor: 'Marc, antebrazo' }
    },
    {
      id: 'luma', nombre: 'Luma Fierro', estilos: ['fineline'], ciudad: 'Valencia',
      estudio: 'Hilo Fino, Ruzafa', tarifa: 85, minimo: 90, valoracion: 5.0, resenas: 304, desde: 2017,
      foto: '1622796459004-6ccb1eaec34a', dias: [2, 3, 4, 5, 6],
      bio: 'Línea fina botánica y lettering de un solo trazo. Aguja 3RL, piezas pequeñas que envejecen bien porque están pensadas para hacerlo.',
      resena: { texto: 'Tres ramas de olivo en la clavícula. Curó en diez días y sigue nítido dos años después.', autor: 'Paula, clavícula' }
    },
    {
      id: 'ronak', nombre: 'Ronak Tinta', estilos: ['japones', 'neotradicional'], ciudad: 'Madrid',
      estudio: 'Irezumi Sur, Malasaña', tarifa: 110, minimo: 150, valoracion: 4.9, resenas: 189, desde: 2009,
      foto: '1513078094721-e7b6e0394a6a', dias: [3, 4, 5, 6, 0],
      bio: 'Formado en Osaka. Mangas y espaldas de composición japonesa clásica: fondo de viento y agua, figuras que siguen el músculo. Proyectos grandes por sesiones.',
      resena: { texto: 'Llevamos once sesiones de manga. Planifica cada una y nunca improvisa el fondo.', autor: 'Dani, manga completa' }
    },
    {
      id: 'sia', nombre: 'Sia Négroa', estilos: ['geometrico', 'fineline'], ciudad: 'Sevilla',
      estudio: 'Taller Áureo, Alameda', tarifa: 90, minimo: 100, valoracion: 4.7, resenas: 121, desde: 2016,
      foto: '1691048539876-b172790bb66c', dias: [1, 2, 4, 5, 6],
      bio: 'Geometría sagrada, mandalas y ornamental. Mide cada pieza con compás sobre la piel para que la simetría aguante el movimiento del cuerpo.',
      resena: { texto: 'El mandala del esternón está centrado al milímetro. Tardó más en medir que en tatuar.', autor: 'Lucía, esternón' }
    },
    {
      id: 'draven', nombre: 'Draven Lox', estilos: ['neotradicional', 'realismo'], ciudad: 'Bilbao',
      estudio: 'Ría Ink, Bilbao la Vieja', tarifa: 100, minimo: 130, valoracion: 4.8, resenas: 143, desde: 2013,
      foto: '1561491040-14a86bca9106', dias: [1, 2, 3, 5, 6],
      bio: 'Color saturado, línea gruesa y animales con carácter. Si quieres una pieza que se lea desde el otro lado de la calle, es él.',
      resena: { texto: 'Un zorro en el gemelo con unos naranjas que siguen vivos. Muy claro con los cuidados.', autor: 'Ander, gemelo' }
    }
  ];

  const O = (id, titulo, estilo, artista, zona, horas) => ({ id, titulo, estilo, artista, zona, horas });
  const OBRAS = [
    O('1561377455-190afb395ed7', 'Abismo', 'blackwork', 'nyx', 'Torso', 14),
    O('1562962230-16e4623d36e6', 'Ramificación', 'fineline', 'luma', 'Antebrazo', 3),
    O('1575492899586-009d962fc732', 'Mirada', 'realismo', 'kael', 'Brazo', 9),
    O('1597852075234-fd721ac361d3', 'Ōkami', 'japones', 'ronak', 'Brazo', 12),
    O('1588417490421-63d4e4175f95', 'Simetría', 'geometrico', 'sia', 'Mano', 4),
    O('1593989716762-392976e5340f', 'Zorro de ría', 'neotradicional', 'draven', 'Brazo', 6),
    O('1557130641-1b14718f096a', 'Ritual', 'blackwork', 'nyx', 'Espalda', 18),
    O('1542727365-19732a80dcfd', 'Hilo', 'fineline', 'luma', 'Muñeca', 1),
    O('1700652793469-6fcbffc9aed6', 'Rosa del pecho', 'realismo', 'kael', 'Pecho', 7),
    O('1778837224447-8f3b265035eb', 'Ryū', 'japones', 'ronak', 'Brazo', 10),
    O('1566485763423-22f63bcf326d', 'Ornamento', 'geometrico', 'sia', 'Mano', 3),
    O('1706433758051-73c10d1157ca', 'Faro', 'neotradicional', 'draven', 'Brazo', 5),
    O('1594812332797-bec39ee15b47', 'Vértebra', 'blackwork', 'nyx', 'Espalda', 8),
    O('1562379825-415aea84ebcf', 'Peonía', 'fineline', 'luma', 'Hombro', 4),
    O('1570168983832-8989dae1522e', 'Niebla', 'realismo', 'kael', 'Brazo', 6),
    O('1635510236894-0c255ab893dc', 'Botan', 'japones', 'ronak', 'Brazo', 5),
    O('1729009223925-a805afee0820', 'Compás', 'geometrico', 'sia', 'Brazo', 4),
    O('1679585633300-41f96e715f0e', 'Marea', 'neotradicional', 'draven', 'Brazo', 7),
    O('1604374376934-2df6fad6519b', 'Tótem', 'blackwork', 'nyx', 'Brazo', 6),
    O('1610942933193-8fafd0973f6d', 'Herbario', 'fineline', 'luma', 'Brazo', 3),
    O('1479767574301-a01c78234a0c', 'Reloj parado', 'realismo', 'kael', 'Antebrazo', 8),
    O('1629811002708-7d15c6c7e7a0', 'Dragón de humo', 'japones', 'ronak', 'Espalda', 16),
    O('1733517300774-f1f1607d851b', 'Eje', 'geometrico', 'sia', 'Pecho', 5),
    O('1651692883249-ed36b3523419', 'Golondrinas', 'neotradicional', 'draven', 'Brazo', 4)
  ];

  const TAMANOS = [
    { id: 'xs', nombre: 'Mini', detalle: 'hasta 5 cm', horas: 1 },
    { id: 's', nombre: 'Pequeño', detalle: '5–10 cm', horas: 2 },
    { id: 'm', nombre: 'Mediano', detalle: '10–20 cm', horas: 4 },
    { id: 'l', nombre: 'Grande', detalle: '20–35 cm', horas: 7 },
    { id: 'xl', nombre: 'Pieza completa', detalle: 'manga, espalda', horas: 12 }
  ];

  const ZONAS = ['Antebrazo', 'Brazo', 'Hombro', 'Muñeca', 'Mano', 'Pecho', 'Costillas', 'Espalda', 'Muslo', 'Gemelo', 'Tobillo', 'Cuello'];
  const HORAS = ['10:00', '12:00', '16:00', '18:00'];

  const CUIDADOS = [
    { q: '¿Qué hago las primeras 24 horas?', a: 'Deja el film o el apósito el tiempo que te indique tu artista (entre 3 horas y 3 días según el tipo). Al retirarlo, lava con agua tibia y jabón neutro, seca a toques con papel limpio y no lo frotes.' },
    { q: '¿Cuánto tarda en curar?', a: 'La capa superficial cierra en 10–14 días; la piel termina de asentarse en 4–6 semanas. Durante ese tiempo es normal que pique y que se pele: no arranques las costras.' },
    { q: '¿Puedo ir a la playa o al gimnasio?', a: 'Evita sol directo, piscina, mar y sauna durante tres semanas. Entrenamiento suave a partir del tercer día, sin roce ni sudor acumulado en la zona.' },
    { q: '¿Cómo funciona la señal?', a: 'Al reservar se calcula una señal del 20 % que abonas en el estudio o por el medio que te indique el artista. Se descuenta del precio final. No se cobra nada desde esta web.' },
    { q: '¿Puedo cancelar o cambiar la fecha?', a: 'Sí, desde «Mi espacio». Los cambios son gratuitos hasta 48 horas antes de la sesión. Con menos antelación, el artista puede retener la señal.' },
    { q: '¿Y si necesito un repaso?', a: 'El primer repaso, dentro de los tres meses siguientes, está incluido con todos los artistas del directorio siempre que hayas seguido los cuidados.' }
  ];

  const LEGAL = {
    privacidad: { titulo: 'Privacidad', texto: 'Tus reservas, obras guardadas y datos de contacto se almacenan únicamente en este navegador (almacenamiento local). No se envían a ningún servidor ni se comparten con terceros. Puedes borrarlos en cualquier momento desde «Mi espacio».' },
    terminos: { titulo: 'Términos de uso', texto: 'MANTRA es un directorio de artistas independientes. Cada sesión se rige por las condiciones del estudio correspondiente. Los precios mostrados son estimaciones a partir de la tarifa por hora del artista; el precio final se acuerda en la consulta previa.' },
    cookies: { titulo: 'Cookies', texto: 'Este sitio no utiliza cookies de seguimiento ni analítica. Solo usa el almacenamiento local del navegador para recordar tus reservas y preferencias.' },
    contacto: { titulo: 'Contacto', texto: 'Escríbenos a hola@mantra.example para dudas sobre el directorio. Para cambios en una sesión ya reservada, usa «Mi espacio» o contacta directamente con el estudio.' }
  };

  window.MANTRA = { u, ESTILOS, ARTISTAS, OBRAS, TAMANOS, ZONAS, HORAS, CUIDADOS, LEGAL,
    HERO: '1564426622559-5af68da63b96', PROCESO: '1704345910291-49168c7631b6', ESTUDIO: '1763888647744-c566e723c396' };
})();
