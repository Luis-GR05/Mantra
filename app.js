/* MANTRA — aplicación */
(function () {
  'use strict';
  const { u, ESTILOS, ARTISTAS, OBRAS, TAMANOS, ZONAS, HORAS, CUIDADOS, LEGAL, HERO, PROCESO } = window.MANTRA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const euro = n => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const estiloNombre = id => (ESTILOS.find(e => e.id === id) || {}).nombre || id;
  const artistaPor = id => ARTISTAS.find(a => a.id === id);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───── Almacén local ───── */
  const CLAVE = 'mantra.v1';
  const almacen = (() => {
    let d = { reservas: [], guardadas: [], boletin: [] };
    try { d = Object.assign(d, JSON.parse(localStorage.getItem(CLAVE) || '{}')); } catch (e) { /* almacenamiento no disponible */ }
    return {
      get datos() { return d; },
      guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(d)); } catch (e) { /* sin persistencia */ } pintarContador(); }
    };
  })();

  /* ───── Fechas y disponibilidad ───── */
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const deIso = s => { const [a, m, d] = s.split('-').map(Number); return new Date(a, m - 1, d); };
  const hoy = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const sumar = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const HORIZONTE = 75;
  const fechaLarga = s => deIso(s).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const fechaCorta = s => deIso(s).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  const momento = (f, h) => { const d = deIso(f); const [hh, mm] = h.split(':').map(Number); d.setHours(hh, mm); return d; };

  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  function huecos(artistaId, fecha, ignorarReserva) {
    const a = artistaPor(artistaId); const d = deIso(fecha);
    if (!a || !a.dias.includes(d.getDay())) return [];
    if (d <= hoy() || d > sumar(hoy(), HORIZONTE)) return [];
    return HORAS.map(hora => {
      const ocupadoAgenda = hash(a.id + fecha + hora) % 100 < 42;
      const mia = almacen.datos.reservas.some(r => r.estado === 'confirmada' && r.id !== ignorarReserva && r.fecha === fecha && r.hora === hora);
      return { hora, libre: !ocupadoAgenda && !mia };
    });
  }
  function proximosHuecos(artistaId, n = 3) {
    const res = [];
    for (let i = 1; i <= HORIZONTE && res.length < n; i++) {
      const f = iso(sumar(hoy(), i));
      for (const h of huecos(artistaId, f)) { if (h.libre && res.length < n) res.push({ fecha: f, hora: h.hora }); }
    }
    return res;
  }

  /* ───── Precio ───── */
  function presupuesto(artistaId, tamanoId, color) {
    const a = artistaPor(artistaId); const t = TAMANOS.find(x => x.id === tamanoId) || TAMANOS[1];
    const horas = Math.round(t.horas * (color ? 1.15 : 1) * 2) / 2;
    const base = Math.max(a.minimo, Math.round(horas * a.tarifa / 5) * 5);
    return { horas, desde: base, hasta: Math.round(base * 1.25 / 5) * 5, senal: Math.round(base * 0.2 / 5) * 5, sesiones: Math.max(1, Math.ceil(horas / 6)) };
  }

  /* ───── Avisos ───── */
  function aviso(texto, tipo = 'ok') {
    const el = document.createElement('div');
    el.className = `aviso aviso-${tipo}`; el.textContent = texto;
    $('#avisos').append(el);
    setTimeout(() => { el.classList.add('fuera'); setTimeout(() => el.remove(), 400); }, 3800);
  }

  /* ───── Imágenes: respaldo si alguna no carga ───── */
  const RESPALDO = ['1568515045052-f9a854d70bfd', '1542727365-19732a80dcfd', '1513078094721-e7b6e0394a6a'];
  document.addEventListener('error', e => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    const n = Number(img.dataset.fb || 0);
    if (n < RESPALDO.length && !img.src.includes(RESPALDO[n])) { img.dataset.fb = n + 1; img.src = u(RESPALDO[n], 800); }
    else { img.classList.add('sin-foto'); }
  }, true);

  /* ───── Cabecera, menú, cinta ───── */
  function iniciarCabecera() {
    const cab = $('#cabecera'), hamb = $('#hamb'), menu = $('#menu');
    const alScroll = () => cab.classList.toggle('compacta', scrollY > 40);
    addEventListener('scroll', alScroll, { passive: true }); alScroll();
    const cerrar = () => { menu.classList.remove('abierto'); hamb.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-abierto'); };
    hamb.addEventListener('click', () => {
      const ab = menu.classList.toggle('abierto');
      hamb.setAttribute('aria-expanded', String(ab)); document.body.classList.toggle('menu-abierto', ab);
    });
    menu.addEventListener('click', e => { if (e.target.closest('a')) cerrar(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });

    const frases = ESTILOS.map(e => e.nombre).concat(['Dotwork', 'Lettering', 'Ornamental', 'Flash']);
    const tira = frases.map(f => `<span>${esc(f)}</span>`).join('');
    $('#cinta').innerHTML = tira + tira;
  }

  /* ───── Hero y buscador ───── */
  function iniciarHero() {
    $('#hero-foto').innerHTML = `<img src="${u(HERO, 1900)}" alt="" fetchpriority="high">`;
    $('#cuidados-foto').innerHTML = `<img src="${u(PROCESO, 1000, 1250)}" alt="Tatuadora trabajando sobre el brazo de una clienta" loading="lazy">`;
    const se = $('#b-estilo'), sc = $('#b-ciudad');
    se.insertAdjacentHTML('beforeend', ESTILOS.map(e => `<option value="${e.id}">${esc(e.nombre.toLowerCase())}</option>`).join(''));
    sc.insertAdjacentHTML('beforeend', [...new Set(ARTISTAS.map(a => a.ciudad))].sort().map(c => `<option>${esc(c)}</option>`).join(''));
    const nota = () => {
      const n = ARTISTAS.filter(a => (!se.value || a.estilos.includes(se.value)) && (!sc.value || a.ciudad === sc.value)).length;
      $('#buscador-nota').textContent = n ? `${n} ${n === 1 ? 'artista disponible' : 'artistas disponibles'}` : 'Nadie con esa combinación todavía';
    };
    se.addEventListener('change', nota); sc.addEventListener('change', nota); nota();
    $('#buscador').addEventListener('submit', e => {
      e.preventDefault();
      filtroArt.estilo = se.value; filtroArt.ciudad = sc.value;
      pintarArtistas(); $('#artistas').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ───── Artistas ───── */
  const filtroArt = { estilo: '', ciudad: '' };
  function chips(cont, activo, alElegir) {
    cont.innerHTML = [{ id: '', nombre: 'Todos' }, ...ESTILOS].map(e =>
      `<button type="button" class="chip" aria-pressed="${e.id === activo}" data-id="${e.id}">${esc(e.nombre)}</button>`).join('');
    cont.onclick = ev => { const b = ev.target.closest('.chip'); if (b) alElegir(b.dataset.id); };
  }
  function pintarArtistas() {
    chips($('#filtros-artistas'), filtroArt.estilo, id => { filtroArt.estilo = id; pintarArtistas(); });
    if (filtroArt.ciudad) {
      $('#filtros-artistas').insertAdjacentHTML('beforeend',
        `<button type="button" class="chip chip-quitar" id="quitar-ciudad">${esc(filtroArt.ciudad)} ✕</button>`);
      $('#quitar-ciudad').onclick = ev => { ev.stopPropagation(); filtroArt.ciudad = ''; $('#b-ciudad').value = ''; pintarArtistas(); };
    }
    const lista = ARTISTAS.filter(a => (!filtroArt.estilo || a.estilos.includes(filtroArt.estilo)) && (!filtroArt.ciudad || a.ciudad === filtroArt.ciudad));
    $('#artistas-vacio').hidden = lista.length > 0;
    $('#lista-artistas').innerHTML = lista.map(a => {
      const p = proximosHuecos(a.id, 1)[0];
      return `<li>
        <button class="fila-artista" type="button" data-artista="${a.id}" data-foto="${u(a.foto, 520, 680)}">
          <span class="fa-nombre">${esc(a.nombre)}</span>
          <span class="fa-estilos">${a.estilos.map(estiloNombre).join(' y ')}</span>
          <span class="fa-ciudad">${esc(a.ciudad)}</span>
          <span class="fa-tarifa">${euro(a.tarifa)}<small>/hora</small></span>
          <span class="fa-hueco">${p ? `Próximo hueco<br><strong>${esc(fechaCorta(p.fecha))}, ${p.hora}</strong>` : 'Agenda completa'}</span>
          <img class="fa-mini" src="${u(a.foto, 200, 200)}" alt="" loading="lazy">
        </button></li>`;
    }).join('');
  }
  function iniciarArtistas() {
    pintarArtistas();
    $('#limpiar-artistas').onclick = () => { filtroArt.estilo = ''; filtroArt.ciudad = ''; $('#b-estilo').value = ''; $('#b-ciudad').value = ''; pintarArtistas(); };
    const lista = $('#lista-artistas'), flot = $('#flotante'), fimg = $('img', flot);
    lista.addEventListener('click', e => { const f = e.target.closest('.fila-artista'); if (f) abrirArtista(f.dataset.artista); });
    if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
      let x = 0, y = 0, tx = 0, ty = 0, vivo = false;
      const paso = () => { x += (tx - x) * 0.14; y += (ty - y) * 0.14; flot.style.transform = `translate(${x}px,${y}px) rotate(${(tx - x) * 0.04}deg)`; if (vivo) requestAnimationFrame(paso); };
      lista.addEventListener('mousemove', e => {
        const f = e.target.closest('.fila-artista');
        tx = e.clientX + 28; ty = e.clientY - 170;
        if (f) { if (fimg.dataset.de !== f.dataset.artista) { fimg.src = f.dataset.foto; fimg.dataset.de = f.dataset.artista; } flot.classList.add('visible'); if (!vivo) { vivo = true; x = tx; y = ty; paso(); } }
      });
      lista.addEventListener('mouseleave', () => { flot.classList.remove('visible'); vivo = false; });
    }
  }

  /* ───── Paneles ───── */
  let focoPrevio = null;
  function abrirPanel(panel) {
    focoPrevio = document.activeElement;
    panel.hidden = false; document.body.classList.add('bloqueado');
    requestAnimationFrame(() => { panel.classList.add('abierto'); ($('.panel-cerrar', panel) || panel).focus(); });
  }
  function cerrarPanel(panel) {
    panel.classList.remove('abierto'); document.body.classList.remove('bloqueado');
    setTimeout(() => { panel.hidden = true; }, reduce ? 0 : 420);
    if (focoPrevio && focoPrevio.isConnected) focoPrevio.focus();
  }
  function iniciarPaneles() {
    $$('.panel').forEach(p => {
      p.addEventListener('click', e => { if (e.target.closest('[data-cerrar]')) cerrarPanel(p); });
      p.addEventListener('keydown', e => {
        if (e.key !== 'Tab') return;
        const f = $$('button, a[href], input, select, textarea', p).filter(el => !el.disabled && el.offsetParent !== null);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      });
    });
    addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (!$('#visor').hidden) return cerrarVisor();
      const p = $$('.panel').find(x => !x.hidden); if (p) cerrarPanel(p);
    });
  }

  function abrirArtista(id) {
    const a = artistaPor(id); if (!a) return;
    const obras = OBRAS.filter(o => o.artista === id);
    const prox = proximosHuecos(id, 4);
    $('#panel-artista-caja').innerHTML = `
      <button class="panel-cerrar" type="button" data-cerrar aria-label="Cerrar">Cerrar</button>
      <div class="pa-cabeza">
        <img class="pa-foto" src="${u(a.foto, 640, 800)}" alt="Retrato de ${esc(a.nombre)}">
        <div>
          <h2 class="panel-titulo" id="pa-nombre">${esc(a.nombre)}</h2>
          <p class="pa-sub">${a.estilos.map(estiloNombre).join(' y ')}</p>
          <dl class="pa-datos">
            <div><dt>Estudio</dt><dd>${esc(a.estudio)}, ${esc(a.ciudad)}</dd></div>
            <div><dt>Tarifa</dt><dd>${euro(a.tarifa)}/hora, mínimo ${euro(a.minimo)}</dd></div>
            <div><dt>Valoración</dt><dd>${a.valoracion.toFixed(1).replace('.', ',')} sobre 5 (${a.resenas} reseñas)</dd></div>
            <div><dt>Tatuando desde</dt><dd>${a.desde}</dd></div>
          </dl>
        </div>
      </div>
      <p class="pa-bio">${esc(a.bio)}</p>
      <blockquote class="pa-cita">«${esc(a.resena.texto)}»<cite>${esc(a.resena.autor)}</cite></blockquote>
      <h3 class="pa-h">Próximos huecos</h3>
      <div class="pa-huecos">${prox.length ? prox.map(p =>
        `<button type="button" class="hueco" data-fecha="${p.fecha}" data-hora="${p.hora}"><span>${esc(fechaCorta(p.fecha))}</span><strong>${p.hora}</strong></button>`).join('')
        : '<p>Sin huecos en las próximas semanas.</p>'}</div>
      <button type="button" class="btn btn-rojo btn-ancho" data-reservar>Reservar con ${esc(a.nombre.split(' ')[0])}</button>
      <h3 class="pa-h">Obras firmadas</h3>
      <div class="pa-obras">${obras.map(o =>
        `<button type="button" data-obra="${o.id}"><img src="${u(o.id, 400, 500)}" alt="${esc(o.titulo)}, ${esc(estiloNombre(o.estilo))} en ${esc(o.zona.toLowerCase())}" loading="lazy"></button>`).join('')}</div>`;
    const caja = $('#panel-artista-caja');
    caja.onclick = e => {
      const h = e.target.closest('.hueco'), r = e.target.closest('[data-reservar]'), o = e.target.closest('[data-obra]');
      if (h || r) {
        Object.assign(R, { artista: id, fecha: h ? h.dataset.fecha : '', hora: h ? h.dataset.hora : '' });
        if (!a.estilos.includes(R.estilo)) R.estilo = a.estilos[0];
        cerrarPanel($('#panel-artista')); irAPaso(1, true);
        aviso(h ? `Hueco del ${fechaCorta(h.dataset.fecha)} a las ${h.dataset.hora} seleccionado` : `${a.nombre} seleccionado`);
      } else if (o) { abrirVisor(obras, obras.findIndex(x => x.id === o.dataset.obra)); }
    };
    abrirPanel($('#panel-artista'));
  }

  /* ───── Obras ───── */
  let filtroObra = '';
  const guardada = id => almacen.datos.guardadas.includes(id);
  function alternarGuardada(id) {
    const g = almacen.datos.guardadas; const i = g.indexOf(id);
    if (i >= 0) g.splice(i, 1); else g.push(id);
    almacen.guardar();
    $$(`[data-guardar="${id}"]`).forEach(b => { b.setAttribute('aria-pressed', String(i < 0)); b.textContent = i < 0 ? 'Guardada' : 'Guardar'; });
    aviso(i < 0 ? 'Obra guardada en tu espacio' : 'Obra quitada de tu espacio');
  }
  function obrasFiltradas() { return OBRAS.filter(o => !filtroObra || o.estilo === filtroObra); }
  function pintarObras() {
    chips($('#filtros-obras'), filtroObra, id => { filtroObra = id; pintarObras(); });
    const alturas = [760, 600, 700, 540, 660];
    $('#muro').innerHTML = obrasFiltradas().map((o, i) => {
      const a = artistaPor(o.artista);
      return `<figure class="obra">
        <button class="obra-abrir" type="button" data-ver="${o.id}" aria-label="Ampliar ${esc(o.titulo)}">
          <img width="560" height="${alturas[i % alturas.length]}" src="${u(o.id, 560, alturas[i % alturas.length])}" alt="${esc(o.titulo)}: ${esc(estiloNombre(o.estilo).toLowerCase())} en ${esc(o.zona.toLowerCase())}, por ${esc(a.nombre)}" loading="lazy">
        </button>
        <figcaption>
          <span class="obra-titulo">${esc(o.titulo)}</span>
          <span class="obra-meta">${esc(a.nombre)}, ${esc(o.zona.toLowerCase())}, ${o.horas} h</span>
          <button class="obra-guardar" type="button" data-guardar="${o.id}" aria-pressed="${guardada(o.id)}">${guardada(o.id) ? 'Guardada' : 'Guardar'}</button>
        </figcaption>
      </figure>`;
    }).join('');
  }
  function iniciarObras() {
    pintarObras();
    $('#muro').addEventListener('click', e => {
      const g = e.target.closest('[data-guardar]'), v = e.target.closest('[data-ver]');
      if (g) alternarGuardada(g.dataset.guardar);
      else if (v) { const l = obrasFiltradas(); abrirVisor(l, l.findIndex(o => o.id === v.dataset.ver)); }
    });
  }

  /* ───── Visor ───── */
  let visorLista = [], visorI = 0, visorFoco = null;
  function pintarVisor() {
    const o = visorLista[visorI]; const a = artistaPor(o.artista);
    const img = $('#visor-img'); img.removeAttribute('data-fb'); img.classList.remove('sin-foto');
    img.src = u(o.id, 1400); img.alt = `${o.titulo}, por ${a.nombre}`;
    $('#visor-pie').innerHTML = `
      <div><strong>${esc(o.titulo)}</strong><span>${esc(a.nombre)} · ${esc(estiloNombre(o.estilo))} · ${esc(o.zona)} · ${o.horas} h de sesión</span></div>
      <div class="visor-acciones">
        <button type="button" class="btn btn-linea" data-guardar="${o.id}" aria-pressed="${guardada(o.id)}">${guardada(o.id) ? 'Guardada' : 'Guardar'}</button>
        <button type="button" class="btn btn-rojo" data-parecida="${o.id}">Quiero algo así</button>
      </div>`;
  }
  function abrirVisor(lista, i) {
    visorLista = lista; visorI = Math.max(0, i); visorFoco = document.activeElement;
    $('#visor').hidden = false; document.body.classList.add('bloqueado'); pintarVisor();
    $('.visor-cerrar').focus();
  }
  function cerrarVisor() {
    $('#visor').hidden = true;
    if ($$('.panel').every(p => p.hidden)) document.body.classList.remove('bloqueado');
    if (visorFoco && visorFoco.isConnected) visorFoco.focus();
  }
  function iniciarVisor() {
    const v = $('#visor');
    const mover = d => { visorI = (visorI + d + visorLista.length) % visorLista.length; pintarVisor(); };
    v.addEventListener('click', e => {
      const b = e.target.closest('[data-visor]'), g = e.target.closest('[data-guardar]'), p = e.target.closest('[data-parecida]');
      if (b) { ({ cerrar: cerrarVisor, prev: () => mover(-1), next: () => mover(1) })[b.dataset.visor](); }
      else if (g) alternarGuardada(g.dataset.guardar);
      else if (p) {
        const o = OBRAS.find(x => x.id === p.dataset.parecida);
        Object.assign(R, { estilo: o.estilo, artista: o.artista, zona: o.zona, fecha: '', hora: '' });
        if (!R.refs.includes(o.id)) R.refs.push(o.id);
        cerrarVisor(); $$('.panel').forEach(x => { if (!x.hidden) cerrarPanel(x); });
        irAPaso(1, true); aviso('Referencia añadida a tu reserva');
      } else if (e.target === v) cerrarVisor();
    });
    addEventListener('keydown', e => {
      if (v.hidden) return;
      if (e.key === 'ArrowLeft') mover(-1); if (e.key === 'ArrowRight') mover(1);
    });
  }

  /* ───── Calculadora ───── */
  function iniciarCalculadora() {
    const st = { tam: 'm' };
    $('#calc-tamanos').innerHTML = TAMANOS.map(t =>
      `<label class="opcion"><input type="radio" name="calc-tam" value="${t.id}" ${t.id === st.tam ? 'checked' : ''}><span><strong>${esc(t.nombre)}</strong><small>${esc(t.detalle)}</small></span></label>`).join('');
    $('#calc-zona').innerHTML = ZONAS.map(z => `<option>${esc(z)}</option>`).join('');
    $('#calc-estilo').innerHTML = `<option value="">Cualquiera</option>` + ESTILOS.map(e => `<option value="${e.id}">${esc(e.nombre)}</option>`).join('');
    const pintar = () => {
      const tam = ($('input[name="calc-tam"]:checked') || {}).value || 'm';
      const color = $('#calc-color').checked, estilo = $('#calc-estilo').value;
      const lista = ARTISTAS.filter(a => !estilo || a.estilos.includes(estilo))
        .map(a => ({ a, p: presupuesto(a.id, tam, color) })).sort((x, y) => x.p.desde - y.p.desde);
      const p0 = lista[0].p;
      $('#calc-horas').innerHTML = `Unas <strong>${String(p0.horas).replace('.', ',')} horas</strong> de aguja${p0.sesiones > 1 ? `, repartidas en ${p0.sesiones} sesiones` : ''}.`;
      $('#calc-lista').innerHTML = lista.map(({ a, p }) =>
        `<li><span>${esc(a.nombre)}<small>${esc(a.ciudad)}</small></span><span class="calc-precio">${euro(p.desde)} – ${euro(p.hasta)}</span>
         <button type="button" class="enlace" data-elegir="${a.id}">Reservar</button></li>`).join('');
      st.tam = tam;
    };
    $('#calc').addEventListener('input', pintar);
    $('#calc').addEventListener('click', e => {
      const b = e.target.closest('[data-elegir]'); if (!b) return;
      const a = artistaPor(b.dataset.elegir);
      Object.assign(R, { artista: a.id, tamano: st.tam, zona: $('#calc-zona').value, color: $('#calc-color').checked,
        estilo: $('#calc-estilo').value && a.estilos.includes($('#calc-estilo').value) ? $('#calc-estilo').value : a.estilos[0], fecha: '', hora: '' });
      irAPaso(1, true);
    });
    pintar();
  }

  /* ───── Asistente de reserva ───── */
  const R = { paso: 1, estilo: '', tamano: 'm', zona: 'Antebrazo', color: false, idea: '', refs: [], artista: '', fecha: '', hora: '', nombre: '', email: '', telefono: '', acepta: false, editando: null, mes: null, hecho: null };
  const form = () => $('#paso-form');

  function irAPaso(n, desplazar) {
    R.paso = n; R.hecho = null; pintarAsistente();
    if (desplazar) $('#reservar').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }
  function pintarResumen() {
    const a = artistaPor(R.artista);
    const p = a ? presupuesto(a.id, R.tamano, R.color) : null;
    const t = TAMANOS.find(x => x.id === R.tamano);
    $('#resumen').innerHTML = `
      <h3>Tu reserva</h3>
      <dl>
        <div><dt>Pieza</dt><dd>${R.estilo ? esc(estiloNombre(R.estilo)) : '<em>Sin estilo</em>'}, ${esc(t.nombre.toLowerCase())}${R.color ? ', a color' : ''}<br>${esc(R.zona)}</dd></div>
        <div><dt>Artista</dt><dd>${a ? `${esc(a.nombre)}<br>${esc(a.estudio)}` : '<em>Por elegir</em>'}</dd></div>
        <div><dt>Cuándo</dt><dd>${R.fecha && R.hora ? `${esc(fechaLarga(R.fecha))}<br>${R.hora} h` : '<em>Por elegir</em>'}</dd></div>
      </dl>
      ${p ? `<div class="resumen-precio"><span>Estimación</span><strong>${euro(p.desde)} – ${euro(p.hasta)}</strong>
        <small>${String(p.horas).replace('.', ',')} h a ${euro(a.tarifa)}/h. Señal en estudio: ${euro(p.senal)}</small></div>` : ''}
      ${R.refs.length ? `<div class="resumen-refs">${R.refs.map(id => `<img src="${u(id, 120, 120)}" alt="Referencia guardada">`).join('')}</div>` : ''}`;
  }
  function pintarAsistente() {
    $$('#progreso li').forEach(li => {
      const n = Number(li.dataset.paso);
      li.classList.toggle('actual', n === R.paso && !R.hecho); li.classList.toggle('hecho', n < R.paso || !!R.hecho);
      if (n === R.paso && !R.hecho) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    $('#asistente').classList.toggle('terminado', !!R.hecho);
    if (R.hecho) return pintarConfirmacion();
    ({ 1: paso1, 2: paso2, 3: paso3, 4: paso4 })[R.paso]();
    pintarResumen();
  }
  const pieNav = (sig = 'Continuar', atras = true) => `
    <p class="paso-error" id="paso-error" role="alert"></p>
    <div class="paso-nav">${atras ? '<button type="button" class="btn btn-linea" data-atras>Atrás</button>' : '<span></span>'}
    <button type="submit" class="btn btn-rojo">${sig}</button></div>`;
  const error = t => { $('#paso-error').textContent = t; };

  function paso1() {
    const guard = almacen.datos.guardadas.map(id => OBRAS.find(o => o.id === id)).filter(Boolean);
    form().innerHTML = `
      <h3 class="paso-titulo">Cuéntanos la pieza</h3>
      <fieldset><legend>Estilo</legend><div class="opciones opciones-chip">${ESTILOS.map(e =>
        `<label class="opcion"><input type="radio" name="estilo" value="${e.id}" ${R.estilo === e.id ? 'checked' : ''}><span>${esc(e.nombre)}</span></label>`).join('')}</div></fieldset>
      <fieldset><legend>Tamaño</legend><div class="opciones">${TAMANOS.map(t =>
        `<label class="opcion"><input type="radio" name="tamano" value="${t.id}" ${R.tamano === t.id ? 'checked' : ''}><span><strong>${esc(t.nombre)}</strong><small>${esc(t.detalle)}</small></span></label>`).join('')}</div></fieldset>
      <div class="campo-fila">
        <label>Zona del cuerpo<select name="zona">${ZONAS.map(z => `<option ${z === R.zona ? 'selected' : ''}>${esc(z)}</option>`).join('')}</select></label>
        <label class="check check-alta"><input type="checkbox" name="color" ${R.color ? 'checked' : ''}> <span>A color</span></label>
      </div>
      <label>Tu idea <span class="opcional">(ayuda al artista a preparar la consulta)</span>
        <textarea name="idea" rows="3" maxlength="500" placeholder="Qué quieres, qué significa, qué no quieres">${esc(R.idea)}</textarea></label>
      ${guard.length ? `<fieldset><legend>Adjuntar obras guardadas como referencia</legend><div class="refs">${guard.map(o =>
        `<label class="ref"><input type="checkbox" name="ref" value="${o.id}" ${R.refs.includes(o.id) ? 'checked' : ''}><img src="${u(o.id, 160, 160)}" alt="${esc(o.titulo)}"></label>`).join('')}</div></fieldset>` : ''}
      ${pieNav('Elegir artista', false)}`;
  }
  function leer1() {
    const f = new FormData(form());
    Object.assign(R, { estilo: f.get('estilo') || '', tamano: f.get('tamano') || R.tamano, zona: f.get('zona'), color: f.has('color'), idea: (f.get('idea') || '').trim() });
    if ($('input[name="ref"]', form())) R.refs = f.getAll('ref');
  }
  function paso2() {
    const lista = ARTISTAS.filter(a => a.estilos.includes(R.estilo));
    if (R.artista && !lista.some(a => a.id === R.artista)) { R.artista = ''; R.fecha = ''; R.hora = ''; }
    form().innerHTML = `
      <h3 class="paso-titulo">¿Con quién?</h3>
      <p class="paso-ayuda">${lista.length} ${lista.length === 1 ? 'artista trabaja' : 'artistas trabajan'} ${esc(estiloNombre(R.estilo).toLowerCase())}.</p>
      <div class="elige-artista">${lista.map(a => {
        const p = presupuesto(a.id, R.tamano, R.color); const h = proximosHuecos(a.id, 1)[0];
        return `<label class="tarjeta-artista"><input type="radio" name="artista" value="${a.id}" ${R.artista === a.id ? 'checked' : ''}>
          <img src="${u(a.foto, 200, 240)}" alt="">
          <span class="ta-cuerpo"><strong>${esc(a.nombre)}</strong><small>${esc(a.estudio)}, ${esc(a.ciudad)}</small>
          <small>${a.valoracion.toFixed(1).replace('.', ',')} / 5 · ${h ? `hueco el ${esc(fechaCorta(h.fecha))}` : 'agenda completa'}</small></span>
          <span class="ta-precio">${euro(p.desde)}<small>estimado</small></span></label>`;
      }).join('')}</div>
      ${pieNav('Ver agenda')}`;
  }
  function paso3() {
    const a = artistaPor(R.artista);
    const min = sumar(hoy(), 1), max = sumar(hoy(), HORIZONTE);
    if (!R.mes) R.mes = R.fecha ? R.fecha.slice(0, 7) : iso(min).slice(0, 7);
    const [ay, am] = R.mes.split('-').map(Number);
    const primero = new Date(ay, am - 1, 1), dias = new Date(ay, am, 0).getDate();
    const hueco = (primero.getDay() + 6) % 7;
    let celdas = '<span></span>'.repeat(hueco);
    for (let d = 1; d <= dias; d++) {
      const f = iso(new Date(ay, am - 1, d)); const hs = huecos(a.id, f, R.editando); const libres = hs.filter(h => h.libre).length;
      celdas += `<button type="button" class="dia${f === R.fecha ? ' elegido' : ''}" data-fecha="${f}" ${libres ? '' : 'disabled'}
        aria-label="${esc(fechaLarga(f))}, ${libres ? libres + ' huecos libres' : 'sin huecos'}" aria-pressed="${f === R.fecha}">${d}${libres ? `<i class="n${Math.min(libres, 3)}"></i>` : ''}</button>`;
    }
    const puedeAntes = primero > new Date(min.getFullYear(), min.getMonth(), 1);
    const puedeDespues = new Date(ay, am, 1) <= max;
    const hs = R.fecha ? huecos(a.id, R.fecha, R.editando) : [];
    if (R.fecha && !hs.some(h => h.hora === R.hora && h.libre)) R.hora = '';
    form().innerHTML = `
      <h3 class="paso-titulo">${R.editando ? 'Nueva fecha' : 'Agenda de ' + esc(a.nombre.split(' ')[0])}</h3>
      <p class="paso-ayuda">Atiende ${a.dias.map(d => ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][d]).join(', ')}. Sesiones de mañana y tarde.</p>
      <div class="agenda">
        <div class="calendario">
          <div class="cal-cabeza">
            <button type="button" data-mes="-1" ${puedeAntes ? '' : 'disabled'} aria-label="Mes anterior">‹</button>
            <strong>${primero.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</strong>
            <button type="button" data-mes="1" ${puedeDespues ? '' : 'disabled'} aria-label="Mes siguiente">›</button>
          </div>
          <div class="cal-semana" aria-hidden="true"><span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span></div>
          <div class="cal-dias">${celdas}</div>
        </div>
        <div class="horas">
          <h4>${R.fecha ? esc(fechaLarga(R.fecha)) : 'Elige un día'}</h4>
          <div class="horas-lista">${hs.map(h =>
            `<label class="hora ${h.libre ? '' : 'ocupada'}"><input type="radio" name="hora" value="${h.hora}" ${h.libre ? '' : 'disabled'} ${R.hora === h.hora ? 'checked' : ''}><span>${h.hora}<small>${h.libre ? 'libre' : 'ocupada'}</small></span></label>`).join('')
            || '<p class="paso-ayuda">Los días con punto rojo tienen huecos.</p>'}</div>
        </div>
      </div>
      ${pieNav(R.editando ? 'Guardar nueva fecha' : 'Continuar')}`;
  }
  function paso4() {
    form().innerHTML = `
      <h3 class="paso-titulo">¿A nombre de quién?</h3>
      <div class="campo-fila">
        <label>Nombre<input name="nombre" required autocomplete="name" value="${esc(R.nombre)}"></label>
        <label>Teléfono <span class="opcional">(opcional)</span><input name="telefono" type="tel" autocomplete="tel" value="${esc(R.telefono)}"></label>
      </div>
      <label>Email<input name="email" type="email" required autocomplete="email" value="${esc(R.email)}"></label>
      <label class="check"><input type="checkbox" name="acepta" ${R.acepta ? 'checked' : ''}> <span>Soy mayor de edad y acepto la política de cambios: gratis hasta 48 h antes.</span></label>
      ${pieNav('Confirmar reserva')}`;
  }
  function pintarConfirmacion() {
    const r = R.hecho; const a = artistaPor(r.artista);
    form().innerHTML = `
      <div class="confirmada">
        <p class="conf-sello">Reservada</p>
        <h3 class="paso-titulo">${esc(fechaLarga(r.fecha))}, ${r.hora} h</h3>
        <p>Con <strong>${esc(a.nombre)}</strong> en ${esc(a.estudio)}, ${esc(a.ciudad)}.</p>
        <p class="conf-codigo">Código <strong>${r.codigo}</strong></p>
        <p class="paso-ayuda">La cita queda guardada en «Mi espacio» de este navegador. Lleva la señal de ${euro(r.senal)} al estudio el día de la consulta.</p>
        <div class="paso-nav">
          <button type="button" class="btn btn-linea" data-ics="${r.id}">Añadir al calendario</button>
          <button type="button" class="btn btn-rojo" data-ver-espacio>Ver mis citas</button>
        </div>
        <button type="button" class="enlace" data-otra>Reservar otra sesión</button>
      </div>`;
    $('#resumen').innerHTML = '';
  }
  function crearReserva() {
    const a = artistaPor(R.artista), p = presupuesto(a.id, R.tamano, R.color);
    const r = {
      id: 'r' + Date.now().toString(36), codigo: 'MN-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      artista: a.id, fecha: R.fecha, hora: R.hora, estilo: R.estilo, tamano: R.tamano, zona: R.zona, color: R.color, idea: R.idea, refs: [...R.refs],
      nombre: R.nombre, email: R.email, telefono: R.telefono, desde: p.desde, hasta: p.hasta, senal: p.senal, horas: p.horas,
      estado: 'confirmada', creada: new Date().toISOString()
    };
    almacen.datos.reservas.push(r); almacen.guardar();
    return r;
  }
  function iniciarAsistente() {
    const f = form();
    f.addEventListener('submit', e => {
      e.preventDefault();
      if (R.paso === 1) {
        leer1();
        if (!R.estilo) return error('Elige un estilo para ver qué artistas lo trabajan.');
        return irAPaso(2);
      }
      if (R.paso === 2) {
        const v = new FormData(f).get('artista');
        if (!v) return error('Elige un artista para ver su agenda.');
        if (v !== R.artista) { R.fecha = ''; R.hora = ''; R.mes = null; }
        R.artista = v; return irAPaso(3);
      }
      if (R.paso === 3) {
        R.hora = new FormData(f).get('hora') || '';
        if (!R.fecha) return error('Elige un día con huecos libres.');
        if (!R.hora) return error('Elige una hora.');
        if (!huecos(R.artista, R.fecha, R.editando).some(h => h.hora === R.hora && h.libre)) return error('Ese hueco ya no está libre. Elige otro.');
        if (R.editando) {
          const r = almacen.datos.reservas.find(x => x.id === R.editando);
          r.fecha = R.fecha; r.hora = R.hora; almacen.guardar(); R.editando = null;
          aviso(`Cita movida al ${fechaCorta(r.fecha)}, ${r.hora} h`);
          R.fecha = ''; R.hora = ''; R.mes = null; irAPaso(1); abrirEspacio('citas'); return;
        }
        return irAPaso(4);
      }
      if (R.paso === 4) {
        const d = new FormData(f);
        Object.assign(R, { nombre: (d.get('nombre') || '').trim(), email: (d.get('email') || '').trim(), telefono: (d.get('telefono') || '').trim(), acepta: d.has('acepta') });
        if (R.nombre.length < 2) { f.nombre.focus(); return error('Escribe tu nombre.'); }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(R.email)) { f.email.focus(); return error('Escribe un email válido para identificar la reserva.'); }
        if (!R.acepta) return error('Marca la casilla para confirmar la política de cambios.');
        if (!huecos(R.artista, R.fecha).some(h => h.hora === R.hora && h.libre)) { error('Ese hueco ya no está libre.'); return irAPaso(3); }
        R.hecho = crearReserva();
        pintarAsistente(); pintarArtistas(); aviso('Reserva confirmada');
        $('#reservar').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      }
    });
    f.addEventListener('click', e => {
      const t = e.target;
      if (t.closest('[data-atras]')) { if (R.paso === 1) leer1(); if (R.editando && R.paso === 3) { R.editando = null; R.fecha = ''; R.hora = ''; return irAPaso(1); } return irAPaso(R.paso - 1); }
      const dia = t.closest('.dia'); if (dia) { R.fecha = dia.dataset.fecha; R.hora = ''; pintarAsistente(); $(`.dia[data-fecha="${R.fecha}"]`).focus(); return; }
      const mes = t.closest('[data-mes]'); if (mes) { const [y, m] = R.mes.split('-').map(Number); R.mes = iso(new Date(y, m - 1 + Number(mes.dataset.mes), 1)).slice(0, 7); return pintarAsistente(); }
      const ics = t.closest('[data-ics]'); if (ics) return descargarIcs(ics.dataset.ics);
      if (t.closest('[data-ver-espacio]')) return abrirEspacio('citas');
      if (t.closest('[data-otra]')) { Object.assign(R, { fecha: '', hora: '', mes: null, idea: '', refs: [] }); return irAPaso(1); }
    });
    f.addEventListener('change', e => {
      if (R.paso === 1) { leer1(); pintarResumen(); }
      if (R.paso === 2 && e.target.name === 'artista') { if (R.artista !== e.target.value) { R.fecha = ''; R.hora = ''; R.mes = null; } R.artista = e.target.value; pintarResumen(); }
      if (R.paso === 3 && e.target.name === 'hora') { R.hora = e.target.value; pintarResumen(); }
    });
    pintarAsistente();
  }

  /* ───── Calendario (.ics) ───── */
  function descargarIcs(id) {
    const r = almacen.datos.reservas.find(x => x.id === id); if (!r) return;
    const a = artistaPor(r.artista); const ini = momento(r.fecha, r.hora); const fin = new Date(ini.getTime() + Math.min(r.horas, 6) * 3600e3);
    const z = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MANTRA//Reservas//ES', 'BEGIN:VEVENT', `UID:${r.id}@mantra`, `DTSTAMP:${z(new Date())}`,
      `DTSTART:${z(ini)}`, `DTEND:${z(fin)}`, `SUMMARY:Tatuaje con ${a.nombre}`, `LOCATION:${a.estudio}\\, ${a.ciudad}`,
      `DESCRIPTION:Reserva ${r.codigo}. ${estiloNombre(r.estilo)} en ${r.zona.toLowerCase()}. Señal: ${r.senal} EUR.`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const en = Object.assign(document.createElement('a'), { href: url, download: `mantra-${r.codigo}.ics` });
    document.body.append(en); en.click(); en.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ───── Mi espacio ───── */
  let pestana = 'citas', porCancelar = null;
  function pintarContador() {
    const n = almacen.datos.reservas.filter(r => r.estado === 'confirmada' && momento(r.fecha, r.hora) > new Date()).length + almacen.datos.guardadas.length;
    const c = $('#contador-espacio'); c.hidden = n === 0; c.textContent = n;
  }
  function pintarEspacio() {
    $$('#panel-espacio [role="tab"]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.pestana === pestana)));
    const c = $('#espacio-contenido');
    if (pestana === 'citas') {
      const rs = [...almacen.datos.reservas].sort((x, y) => momento(x.fecha, x.hora) - momento(y.fecha, y.hora));
      const futuras = rs.filter(r => r.estado === 'confirmada' && momento(r.fecha, r.hora) > new Date());
      const otras = rs.filter(r => !futuras.includes(r)).reverse();
      const fila = (r, activa) => {
        const a = artistaPor(r.artista); const horasFaltan = (momento(r.fecha, r.hora) - new Date()) / 3600e3;
        return `<li class="cita ${activa ? '' : 'cita-pasada'}">
          <div class="cita-fecha"><strong>${deIso(r.fecha).getDate()}</strong><span>${deIso(r.fecha).toLocaleDateString('es-ES', { month: 'short' })}</span></div>
          <div class="cita-cuerpo">
            <strong>${esc(a.nombre)} · ${r.hora} h</strong>
            <span>${esc(estiloNombre(r.estilo))} en ${esc(r.zona.toLowerCase())} · ${esc(a.estudio)}</span>
            <span>${r.codigo} · ${r.estado === 'cancelada' ? 'Cancelada' : activa ? `${euro(r.desde)} – ${euro(r.hasta)}` : 'Realizada'}</span>
            ${activa ? (porCancelar === r.id
              ? `<div class="cita-acciones"><span class="cita-aviso">${horasFaltan < 48 ? 'Faltan menos de 48 h: el artista puede retener la señal.' : 'Se liberará el hueco.'}</span>
                 <button type="button" class="enlace peligro" data-confirmar-cancelar="${r.id}">Sí, cancelar</button><button type="button" class="enlace" data-no-cancelar>Mantener</button></div>`
              : `<div class="cita-acciones"><button type="button" class="enlace" data-mover="${r.id}">Cambiar fecha</button>
                 <button type="button" class="enlace" data-ics="${r.id}">Calendario</button>
                 <button type="button" class="enlace peligro" data-cancelar="${r.id}">Cancelar</button></div>`) : ''}
          </div></li>`;
      };
      c.innerHTML = (futuras.length ? `<ul class="citas">${futuras.map(r => fila(r, true)).join('')}</ul>`
        : `<div class="vacio-panel"><p>Aún no tienes ninguna sesión reservada.</p><a class="btn btn-rojo" href="#reservar" data-cerrar>Reservar la primera</a></div>`)
        + (otras.length ? `<h3 class="pa-h">Historial</h3><ul class="citas">${otras.map(r => fila(r, false)).join('')}</ul>` : '')
        + (almacen.datos.reservas.length ? `<button type="button" class="enlace peligro borrar-todo" data-borrar>Borrar mis datos de este navegador</button>` : '');
    } else {
      const obras = almacen.datos.guardadas.map(id => OBRAS.find(o => o.id === id)).filter(Boolean);
      c.innerHTML = obras.length ? `<div class="pa-obras guardadas">${obras.map(o =>
        `<div class="guardada"><button type="button" data-obra="${o.id}"><img src="${u(o.id, 400, 500)}" alt="${esc(o.titulo)}"></button>
          <span>${esc(o.titulo)}<button type="button" class="enlace" data-guardar="${o.id}">Quitar</button></span></div>`).join('')}</div>`
        : `<div class="vacio-panel"><p>Guarda obras desde la galería para tenerlas a mano como referencia.</p><a class="btn btn-linea" href="#obras" data-cerrar>Ver obras</a></div>`;
    }
  }
  function abrirEspacio(p) { if (p) pestana = p; porCancelar = null; pintarEspacio(); if ($('#panel-espacio').hidden) abrirPanel($('#panel-espacio')); }
  function iniciarEspacio() {
    $('#abrir-espacio').onclick = () => abrirEspacio();
    const panel = $('#panel-espacio');
    panel.addEventListener('click', e => {
      const t = e.target, q = s => t.closest(s);
      if (q('[role="tab"]')) { pestana = q('[role="tab"]').dataset.pestana; return pintarEspacio(); }
      if (q('[data-cancelar]')) { porCancelar = q('[data-cancelar]').dataset.cancelar; return pintarEspacio(); }
      if (q('[data-no-cancelar]')) { porCancelar = null; return pintarEspacio(); }
      if (q('[data-confirmar-cancelar]')) {
        const r = almacen.datos.reservas.find(x => x.id === q('[data-confirmar-cancelar]').dataset.confirmarCancelar);
        r.estado = 'cancelada'; porCancelar = null; almacen.guardar(); pintarEspacio(); pintarArtistas(); if (R.paso === 3) pintarAsistente();
        return aviso('Cita cancelada');
      }
      if (q('[data-mover]')) {
        const r = almacen.datos.reservas.find(x => x.id === q('[data-mover]').dataset.mover);
        Object.assign(R, { editando: r.id, artista: r.artista, estilo: r.estilo, tamano: r.tamano, zona: r.zona, color: r.color, fecha: r.fecha, hora: '', mes: r.fecha.slice(0, 7) });
        cerrarPanel(panel); return irAPaso(3, true);
      }
      if (q('[data-ics]')) return descargarIcs(q('[data-ics]').dataset.ics);
      if (q('[data-guardar]')) { alternarGuardada(q('[data-guardar]').dataset.guardar); return pintarEspacio(); }
      if (q('[data-obra]')) { const l = almacen.datos.guardadas.map(id => OBRAS.find(o => o.id === id)).filter(Boolean); return abrirVisor(l, l.findIndex(o => o.id === q('[data-obra]').dataset.obra)); }
      if (q('[data-borrar]')) {
        const b = q('[data-borrar]');
        if (b.dataset.seguro) { almacen.datos.reservas = []; almacen.datos.guardadas = []; almacen.datos.boletin = []; almacen.guardar(); pintarEspacio(); pintarObras(); pintarArtistas(); aviso('Datos borrados'); }
        else { b.dataset.seguro = '1'; b.textContent = 'Pulsa otra vez para borrar citas y obras guardadas'; }
      }
    });
    pintarContador();
  }

  /* ───── Cuidados, pie ───── */
  function iniciarPie() {
    $('#acordeon').innerHTML = CUIDADOS.map((c, i) =>
      `<details ${i === 0 ? 'open' : ''}><summary>${esc(c.q)}</summary><p>${esc(c.a)}</p></details>`).join('');
    $('#boletin').addEventListener('submit', e => {
      e.preventDefault();
      const inp = $('#boletin-email'), est = $('#boletin-estado'), v = inp.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { est.textContent = 'Ese email no parece válido.'; est.className = 'boletin-estado mal'; return inp.focus(); }
      if (almacen.datos.boletin.includes(v)) { est.textContent = 'Ya estabas en la lista.'; }
      else { almacen.datos.boletin.push(v); almacen.guardar(); est.textContent = 'Apuntado. Te avisaremos del próximo flash day.'; }
      est.className = 'boletin-estado bien'; inp.value = '';
    });
    $$('[data-legal]').forEach(b => b.onclick = () => {
      const l = LEGAL[b.dataset.legal]; $('#dialogo-titulo').textContent = l.titulo; $('#dialogo-texto').textContent = l.texto; $('#dialogo').showModal();
    });
    $('#dialogo').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.close(); });

    /* Instalación como app */
    let evento = null; const nota = $('#instalar-nota');
    addEventListener('beforeinstallprompt', e => { e.preventDefault(); evento = e; });
    addEventListener('appinstalled', () => { nota.hidden = false; nota.textContent = 'App instalada.'; });
    $('#instalar').onclick = async () => {
      if (evento) { evento.prompt(); await evento.userChoice; evento = null; return; }
      nota.hidden = false;
      nota.textContent = location.protocol === 'file:'
        ? 'Para instalarla, abre la web desde un servidor (http://localhost o tu dominio), no como archivo.'
        : matchMedia('(display-mode: standalone)').matches ? 'Ya la estás usando como app.'
        : 'Abre el menú del navegador y elige «Instalar» o «Añadir a pantalla de inicio».';
    };
    if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  /* ───── Movimiento ───── */
  function iniciarMovimiento() {
    const telon = $('#telon');
    if (reduce || !window.gsap) { telon.remove(); document.body.classList.add('listo'); return; }
    gsap.registerPlugin(ScrollTrigger);
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to(telon, { yPercent: -100, duration: 1, ease: 'expo.inOut', delay: 0.35, onComplete: () => telon.remove() })
      .from('.hero-foto img', { scale: 1.25, duration: 2.2 }, '<0.1')
      .from('.hero-titulo span', { yPercent: 115, duration: 1.2, stagger: 0.06 }, '<0.25')
      .from('.hero-lema, .buscador', { autoAlpha: 0, y: 24, duration: 0.9, stagger: 0.12 }, '<0.5')
      .add(() => document.body.classList.add('listo'));
    gsap.to('.hero-titulo', { yPercent: 28, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-foto img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    $$('.titular').forEach(t => {
      gsap.from(t, { clipPath: 'inset(0 0 100% 0)', y: 40, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 88%' } });
    });
    gsap.from('.cuidados-foto img', { scale: 1.2, ease: 'none', scrollTrigger: { trigger: '.cuidados-foto', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  function iniciar() {
    iniciarCabecera(); iniciarHero(); iniciarArtistas(); iniciarObras(); iniciarVisor(); iniciarPaneles();
    iniciarCalculadora(); iniciarAsistente(); iniciarEspacio(); iniciarPie(); iniciarMovimiento();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
