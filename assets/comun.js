/* Simuladores ICCA — utilidades comunes (sin dependencias).
   Cada página de semana llama a ICCA.iniciarPagina(numeroSemana) al cargar. */
(function () {
  'use strict';

  const SEMANAS = [
    { n: 1, fase: 1, titulo: 'Del dato a la inteligencia' },
    { n: 2, fase: 1, titulo: 'Conecta tus fuentes y caza la anomalía' },
    { n: 3, fase: 1, titulo: 'Taller de Power Query' },
    { n: 4, fase: 1, titulo: 'Arquitecto del modelo semántico' },
    { n: 5, fase: 1, titulo: 'Checkpoint 1: repositorio y Pull Request' },
    { n: 6, fase: 2, titulo: 'Mapea al adversario con MITRE ATT&CK' },
    { n: 7, fase: 2, titulo: 'Columnas calculadas, medidas y SWITCH' },
    { n: 8, fase: 2, titulo: 'CALCULATE y el contexto de filtro' },
    { n: 9, fase: 2, titulo: 'Inteligencia de tiempo y caza iterativa' },
    { n: 10, fase: 2, titulo: 'Checkpoint 2: un hunt completo' },
    { n: 11, fase: 3, titulo: 'Calidad de datos y audiencia' },
    { n: 12, fase: 3, titulo: 'Jerarquía visual en el dashboard' },
    { n: 13, fase: 3, titulo: 'Métricas que importan, marcadores y tooltips' },
    { n: 14, fase: 3, titulo: 'Publica con seguridad a nivel de fila (RLS)' },
    { n: 15, fase: 3, titulo: 'Defensa ejecutiva del PIA' }
  ];
  const FASES = {
    1: 'Fase 1 · Fundamentos de CTI y Power BI desde cero',
    2: 'Fase 2 · Entendiendo al adversario y entorno de investigación',
    3: 'Fase 3 · Comunicando resultados, Power BI avanzado y PIA'
  };

  const $ = (sel, raiz) => (raiz || document).querySelector(sel);
  const $$ = (sel, raiz) => Array.from((raiz || document).querySelectorAll(sel));

  /** Crea un elemento: el('button', {class: 'chip', onclick: fn}, 'texto', otroNodo) */
  function el(tag, attrs, ...hijos) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'dataset') Object.assign(n.dataset, v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const h of hijos.flat()) {
      if (h === null || h === undefined || h === false) continue;
      n.append(h instanceof Node ? h : document.createTextNode(String(h)));
    }
    return n;
  }

  /** Muestra retroalimentación accesible. tipo: 'ok' | 'mal' | 'aviso' | '' */
  function retro(destino, tipo, mensaje) {
    const d = typeof destino === 'string' ? $(destino) : destino;
    if (!d) return;
    d.setAttribute('role', 'status');
    d.setAttribute('aria-live', 'polite');
    d.className = 'retro' + (tipo ? ' ' + tipo : '');
    d.innerHTML = mensaje || '';
  }

  /** Baraja una copia del arreglo (Fisher–Yates) con semilla opcional reproducible. */
  function barajar(arr, semilla) {
    const a = arr.slice();
    let s = semilla === undefined ? Math.floor(Math.random() * 2 ** 31) : semilla;
    const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Barra de progreso: const p = ICCA.progreso('#prog', 5); p.marcar('reto1'); */
  function progreso(destino, total) {
    const d = typeof destino === 'string' ? $(destino) : destino;
    const hechos = new Set();
    const span = el('span');
    const texto = el('span', {}, `0 de ${total} retos`);
    d.classList.add('progreso');
    d.replaceChildren(el('div', { class: 'barra-progreso', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': total, 'aria-valuenow': 0 }, span), texto);
    const barra = d.querySelector('.barra-progreso');
    return {
      marcar(id) {
        hechos.add(id);
        const n = Math.min(hechos.size, total);
        span.style.width = (100 * n / total) + '%';
        barra.setAttribute('aria-valuenow', n);
        texto.textContent = n === total ? `¡${n} de ${total} retos completados!` : `${n} de ${total} retos`;
      },
      reiniciar() { hechos.clear(); this.marcar('__'); hechos.clear(); span.style.width = '0%'; barra.setAttribute('aria-valuenow', 0); texto.textContent = `0 de ${total} retos`; },
      get completados() { return hechos.size; }
    };
  }

  /** Formato numérico es-MX */
  const num = (x, dec) => Number(x).toLocaleString('es-MX', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });

  /** Gráfica de barras SVG simple: ICCA.barras(contenedor, [{etiqueta, valor, resaltar}], {titulo, color}) */
  function barras(destino, datos, opciones) {
    const d = typeof destino === 'string' ? $(destino) : destino;
    const o = Object.assign({ titulo: '', alto: 220, unidad: '' }, opciones || {});
    const max = Math.max(1, ...datos.map(x => x.valor));
    const ancho = Math.max(320, datos.length * 64);
    const izq = 36, abajo = 46, arriba = 16;
    const h = o.alto, w = ancho;
    const bw = (w - izq - 10) / datos.length;
    let svg = `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${o.titulo.replace(/"/g, '&quot;')}" style="width:100%;height:auto;font:12px var(--font)">`;
    for (let k = 0; k <= 4; k++) {
      const y = arriba + (h - arriba - abajo) * (1 - k / 4);
      svg += `<line x1="${izq}" x2="${w - 6}" y1="${y}" y2="${y}" stroke="var(--border)"/>`;
      svg += `<text x="${izq - 6}" y="${y + 4}" text-anchor="end" fill="var(--muted)">${Math.round(max * k / 4)}</text>`;
    }
    datos.forEach((x, i) => {
      const bh = (h - arriba - abajo) * (x.valor / max);
      const xx = izq + i * bw + bw * 0.15;
      const yy = h - abajo - bh;
      const color = x.resaltar ? 'var(--bad)' : 'var(--accent-2)';
      svg += `<rect x="${xx}" y="${yy}" width="${bw * 0.7}" height="${bh}" rx="4" fill="${color}"><title>${x.etiqueta}: ${x.valor}${o.unidad}</title></rect>`;
      svg += `<text x="${xx + bw * 0.35}" y="${yy - 4}" text-anchor="middle" fill="var(--text)">${x.valor}</text>`;
      svg += `<text x="${xx + bw * 0.35}" y="${h - abajo + 16}" text-anchor="middle" fill="var(--muted)">${String(x.etiqueta).slice(0, 12)}</text>`;
    });
    svg += '</svg>';
    d.innerHTML = (o.titulo ? `<p style="margin:0 0 4px;font-weight:600">${o.titulo}</p>` : '') + svg;
  }

  /** Gráfica de líneas SVG: ICCA.lineas(contenedor, etiquetas, [{nombre, valores, color}], {titulo}) */
  function lineas(destino, etiquetas, series, opciones) {
    const d = typeof destino === 'string' ? $(destino) : destino;
    const o = Object.assign({ titulo: '', alto: 240 }, opciones || {});
    const w = Math.max(360, etiquetas.length * 22), h = o.alto, izq = 40, abajo = 40, arriba = 14;
    const todos = series.flatMap(s => s.valores.filter(v => v !== null && v !== undefined));
    const max = Math.max(1, ...todos), min = Math.min(0, ...todos);
    const X = i => izq + (w - izq - 10) * (etiquetas.length === 1 ? 0.5 : i / (etiquetas.length - 1));
    const Y = v => arriba + (h - arriba - abajo) * (1 - (v - min) / (max - min || 1));
    let svg = `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${o.titulo.replace(/"/g, '&quot;')}" style="width:100%;height:auto;font:11px var(--font)">`;
    for (let k = 0; k <= 4; k++) {
      const v = min + (max - min) * k / 4, y = Y(v);
      svg += `<line x1="${izq}" x2="${w - 6}" y1="${y}" y2="${y}" stroke="var(--border)"/><text x="${izq - 6}" y="${y + 4}" text-anchor="end" fill="var(--muted)">${Math.round(v)}</text>`;
    }
    const paso = Math.ceil(etiquetas.length / 12);
    etiquetas.forEach((e, i) => { if (i % paso === 0) svg += `<text x="${X(i)}" y="${h - abajo + 16}" text-anchor="middle" fill="var(--muted)">${e}</text>`; });
    const colores = ['var(--accent-2)', 'var(--bad)', 'var(--ok)', 'var(--warn)'];
    series.forEach((s, k) => {
      const pts = s.valores.map((v, i) => (v === null || v === undefined) ? null : `${X(i)},${Y(v)}`).filter(Boolean).join(' ');
      svg += `<polyline points="${pts}" fill="none" stroke="${s.color || colores[k % 4]}" stroke-width="2.5" ${s.punteada ? 'stroke-dasharray="6 4"' : ''}/>`;
    });
    svg += '</svg>';
    const leyenda = series.map((s, k) => `<span style="display:inline-flex;align-items:center;gap:6px;margin-right:14px"><span style="width:18px;height:3px;background:${s.color || colores[k % 4]};display:inline-block"></span>${s.nombre}</span>`).join('');
    d.innerHTML = (o.titulo ? `<p style="margin:0 0 4px;font-weight:600">${o.titulo}</p>` : '') + svg + `<div style="font-size:.85rem;color:var(--muted)">${leyenda}</div>`;
  }

  /** Cabecera, barra superior, navegación y pie comunes. */
  function iniciarPagina(n) {
    const s = SEMANAS.find(x => x.n === n);
    document.documentElement.lang = 'es-MX';
    const barra = el('div', { class: 'barra' },
      el('div', { class: 'contenedor' },
        el('a', { href: '../index.html' }, 'Simuladores ICCA'),
        el('span', { class: 'ua' }, 'Inteligencia centralizada contra amenazas'),
        el('span', { class: 'espacio' }),
        el('button', { type: 'button', onclick: alternarTema, 'aria-label': 'Cambiar tema claro u oscuro' }, 'Tema')));
    document.body.prepend(barra);
    const nav = $('nav.semanas');
    if (nav && s) {
      const ant = SEMANAS.find(x => x.n === n - 1);
      const sig = SEMANAS.find(x => x.n === n + 1);
      nav.replaceChildren(
        ant ? el('a', { href: `../semana-${String(ant.n).padStart(2, '0')}/index.html` }, `← Semana ${ant.n}`) : el('span'),
        el('a', { href: '../index.html' }, 'Índice de semanas'),
        sig ? el('a', { href: `../semana-${String(sig.n).padStart(2, '0')}/index.html` }, `Semana ${sig.n} →`) : el('span'));
    }
    const migas = $('.migas');
    if (migas && s) migas.textContent = `${FASES[s.fase]} · Semana ${s.n}`;
    if (!$('footer.pie')) {
      document.body.append(el('footer', { class: 'pie' }, el('div', { class: 'contenedor' },
        'Simulador didáctico con datos ficticios. Unidad de aprendizaje Inteligencia centralizada contra amenazas · ',
        'Licenciatura en Seguridad en Tecnologías de Información · FCFM · UANL.')));
    }
    try { const t = localStorage.getItem('icca-tema'); if (t) document.documentElement.dataset.theme = t; } catch (e) { /* sin almacenamiento */ }
  }

  function alternarTema() {
    const r = document.documentElement;
    const oscuroSistema = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const actual = r.dataset.theme || (oscuroSistema ? 'dark' : 'light');
    r.dataset.theme = actual === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('icca-tema', r.dataset.theme); } catch (e) { /* sin almacenamiento */ }
  }

  window.ICCA = { SEMANAS, FASES, $, $$, el, retro, barajar, progreso, num, barras, lineas, iniciarPagina, alternarTema };
})();
