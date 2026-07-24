'use client';

// ============================================================
// MediVision AI – Liquid Glass Top Navigation
// Exact port of the demo.js Liquid Glass engine by the user.
// ============================================================

import React, { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// ── Nav tabs (5 items — adapt icons/paths to MediVision) ─────
const TABS = [
  {
    path: '/',
    label: 'Home',
    // House icon (same as demo)
    icon: (
      <svg className="ios-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.5 4 9v10.2c0 .7.6 1.3 1.3 1.3h5.4v-6.4h2.6v6.4h5.4c.7 0 1.3-.6 1.3-1.3V9l-8-5.5Z" />
      </svg>
    ),
  },
  {
    path: '/scan',
    label: 'Scan',
    icon: (
      <svg className="ios-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h1.8V2H6.5A4.5 4.5 0 0 0 2 6.5v1.8h2V6.5ZM17.5 4A2.5 2.5 0 0 1 20 6.5v1.8h2V6.5A4.5 4.5 0 0 0 17.5 2h-1.8v2h1.8ZM4 17.5A2.5 2.5 0 0 0 6.5 20h1.8v2H6.5A4.5 4.5 0 0 1 2 17.5v-1.8h2v1.8ZM20 17.5a2.5 2.5 0 0 1-2.5 2.5h-1.8v2h1.8A4.5 4.5 0 0 0 22 17.5v-1.8h-2v1.8ZM7 12h10v1.5H7z" />
      </svg>
    ),
  },
  {
    path: '/reports',
    label: 'Reports',
    icon: (
      <svg className="ios-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 5h14v14H5V5Zm2.3 2.3v9.4h9.4V7.3H7.3Zm1.4 1.4h6.6v1.8H8.7V8.7Zm0 3.2h6.6v1.8H8.7v-1.8Z" />
      </svg>
    ),
  },
  {
    path: '/assistant',
    label: 'AI',
    icon: (
      <svg className="ios-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.2a8.8 8.8 0 1 0 0 17.6 8.8 8.8 0 0 0 0-17.6Zm0 2.4a6.4 6.4 0 1 1 0 12.8 6.4 6.4 0 0 1 0-12.8Zm-.1 2.8c-1.8 0-3.1 1.1-3.3 2.8h2.4c.1-.5.5-.8 1-.8.7 0 1.1.4 1.1 1 0 .4-.2.8-.7 1.1-.9.6-1.7 1.2-1.7 2.6v.2h2.3c0-.7.2-1 .9-1.5.8-.5 1.6-1.3 1.6-2.6 0-1.8-1.5-2.8-3.6-2.8Zm-.1 8.8a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Z" />
      </svg>
    ),
  },
  {
    path: '/hospitals',
    label: 'Nearby',
    icon: (
      <svg className="ios-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    ),
  },
];

// ── Liquid Glass Engine (exact port of demo.js) ──────────────

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function surfaceFn(x: number) {
  return Math.pow(1 - Math.pow(1 - x, 4), 0.25);
}

function calcRefractionProfile(
  glassThickness: number,
  bezelWidth: number,
  ior: number,
  samples = 128,
): Float64Array {
  const eta = 1 / ior;
  function refract(nx: number, ny: number): [number, number] | null {
    const dot = ny;
    const k = 1 - eta * eta * (1 - dot * dot);
    if (k < 0) return null;
    const sq = Math.sqrt(k);
    return [-(eta * dot + sq) * nx, eta - (eta * dot + sq) * ny];
  }
  const p = new Float64Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = i / samples;
    const y = surfaceFn(x);
    const dx = x < 1 ? 0.0001 : -0.0001;
    const y2 = surfaceFn(x + dx);
    const deriv = (y2 - y) / dx;
    const mag = Math.sqrt(deriv * deriv + 1);
    const ref = refract(-deriv / mag, -1 / mag);
    p[i] = ref ? ref[0] * ((y * bezelWidth + glassThickness) / ref[1]) : 0;
  }
  return p;
}

function generateDisplacementMap(
  w: number,
  h: number,
  radius: number,
  bezelWidth: number,
  profile: Float64Array,
  maxDisp: number,
): string {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) { d[i] = 128; d[i + 1] = 128; d[i + 2] = 0; d[i + 3] = 255; }
  const r = radius, rSq = r * r, r1Sq = (r + 1) ** 2;
  const rBSq = Math.max(r - bezelWidth, 0) ** 2;
  const wB = w - r * 2, hB = h - r * 2, S = profile.length;
  for (let y1 = 0; y1 < h; y1++) {
    for (let x1 = 0; x1 < w; x1++) {
      const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
      const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
      const dSq = x * x + y * y;
      if (dSq > r1Sq || dSq < rBSq) continue;
      const dist = Math.sqrt(dSq);
      const fromSide = r - dist;
      const op = dSq < rSq ? 1 : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq));
      if (op <= 0 || dist === 0) continue;
      const cos = x / dist, sin = y / dist;
      const bi = Math.min(((fromSide / bezelWidth) * S) | 0, S - 1);
      const disp = profile[bi] || 0;
      const dX = (-cos * disp) / maxDisp, dY = (-sin * disp) / maxDisp;
      const idx = (y1 * w + x1) * 4;
      d[idx] = (128 + dX * 127 * op + 0.5) | 0;
      d[idx + 1] = (128 + dY * 127 * op + 0.5) | 0;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

function generateSpecularMap(
  w: number,
  h: number,
  radius: number,
  bezelWidth: number,
  balanced: boolean,
): string {
  const angle = Math.PI / 3;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const d = img.data; d.fill(0);
  const r = radius, rSq = r * r, r1Sq = (r + 1) ** 2;
  const rBSq = Math.max(r - bezelWidth, 0) ** 2;
  const wB = w - r * 2, hB = h - r * 2;
  const sv = [Math.cos(angle), Math.sin(angle)];
  for (let y1 = 0; y1 < h; y1++) {
    for (let x1 = 0; x1 < w; x1++) {
      const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
      const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
      const dSq = x * x + y * y;
      if (dSq > r1Sq || dSq < rBSq) continue;
      const dist = Math.sqrt(dSq);
      const fromSide = r - dist;
      const op = dSq < rSq ? 1 : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq));
      if (op <= 0 || dist === 0) continue;
      const cos = x / dist, sin = -y / dist;
      const dot = balanced ? 1 : Math.abs(cos * sv[0] + sin * sv[1]);
      const edge = Math.sqrt(Math.max(0, 1 - (1 - fromSide) ** 2));
      const coeff = dot * edge;
      const col = (255 * coeff) | 0;
      const alpha = (col * coeff * op) | 0;
      const idx = (y1 * w + x1) * 4;
      d[idx] = col; d[idx + 1] = col; d[idx + 2] = col; d[idx + 3] = alpha;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

function svgEl(tag: string, attrs: Record<string, string | number>) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

interface GlassCfg {
  glassThickness: number;
  bezelWidth: number;
  ior: number;
  scaleRatio: number;
  blur: number;
  specularOpacity: number;
  specularSat: number;
  tintColor: string;
  tintOpacity: number;
  innerShadow: string;
  innerShadowBlur: number;
  innerShadowSpread: number;
  balancedSpecular: boolean;
}

function buildFilter(
  id: string,
  w: number,
  h: number,
  radius: number,
  cfg: GlassCfg,
): SVGFilterElement {
  const bezel = Math.min(cfg.bezelWidth, radius - 1, Math.min(w, h) / 2 - 1);
  const profile = calcRefractionProfile(cfg.glassThickness, bezel, cfg.ior, 128);
  const maxDisp = Math.max(...Array.from(profile).map(Math.abs)) || 1;
  const dispUrl = generateDisplacementMap(w, h, radius, bezel, profile, maxDisp);
  const specUrl = generateSpecularMap(w, h, radius, bezel * 2.5, !!cfg.balancedSpecular);
  const scale = maxDisp * cfg.scaleRatio;
  const pad = cfg.balancedSpecular ? 0.36 : 0;
  const fx = Math.round(-w * pad);
  const fy = Math.round(-h * pad);
  const fw = Math.round(w * (1 + pad * 2));
  const fh = Math.round(h * (1 + pad * 2));

  const filter = svgEl('filter', {
    id, x: fx, y: fy, width: fw, height: fh,
    filterUnits: 'userSpaceOnUse',
    primitiveUnits: 'userSpaceOnUse',
    'color-interpolation-filters': 'sRGB',
  }) as SVGFilterElement;

  const blur = svgEl('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: cfg.blur, result: 'blurred' });
  const dispImg = svgEl('feImage', { href: dispUrl, x: 0, y: 0, width: w, height: h, result: 'disp_map' });
  const dispMap = svgEl('feDisplacementMap', {
    in: 'blurred', in2: 'disp_map', scale,
    xChannelSelector: 'R', yChannelSelector: 'G', result: 'displaced',
  });
  const sat = svgEl('feColorMatrix', { in: 'displaced', type: 'saturate', values: cfg.specularSat, result: 'displaced_sat' });
  const spec = svgEl('feImage', { href: specUrl, x: 0, y: 0, width: w, height: h, result: 'spec_layer' });
  const comp = svgEl('feComposite', { in: 'displaced_sat', in2: 'spec_layer', operator: 'in', result: 'spec_masked' });
  const tr = svgEl('feComponentTransfer', { in: 'spec_layer', result: 'spec_faded' });
  tr.appendChild(svgEl('feFuncA', { type: 'linear', slope: cfg.specularOpacity }));
  const b1 = svgEl('feBlend', { in: 'spec_masked', in2: 'displaced', mode: 'normal', result: 'with_sat' });
  const b2 = svgEl('feBlend', { in: 'spec_faded', in2: 'with_sat', mode: 'normal' });
  filter.append(blur, dispImg, dispMap, sat, spec, comp, tr, b1, b2);
  return filter;
}

// ── React Component ───────────────────────────────────────────

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const navWrapRef = useRef<HTMLElement>(null);
  const navInnerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Sync indicator position when route changes
  useEffect(() => {
    const nav = navInnerRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;

    const items = Array.from(nav.querySelectorAll<HTMLButtonElement>('.ios-item'));
    const activeIdx = TABS.findIndex((t) => {
      if (t.path === '/') return pathname === '/';
      return pathname.startsWith(t.path);
    });
    const idx = activeIdx >= 0 ? activeIdx : 0;

    items.forEach((btn, i) => btn.classList.toggle('active', i === idx));

    const navR = nav.getBoundingClientRect();
    const ir = items[idx]?.getBoundingClientRect();
    if (!ir || navR.width === 0) return;
    const sx = nav.clientWidth / navR.width;
    const left = (ir.left - navR.left) * sx;
    const width = ir.width * sx;
    indicator.style.left = `${left}px`;
    indicator.style.width = `${width}px`;
  }, [pathname]);

  // Full Liquid Glass engine + nav switcher interaction — runs once on mount
  useEffect(() => {
    const navWrapElement = navWrapRef.current;
    const navElement = navInnerRef.current;
    const indicatorElement = indicatorRef.current;
    if (!navWrapElement || !navElement || !indicatorElement) return;
    const navWrap = navWrapElement;
    const nav = navElement;
    const indicator = indicatorElement;

    const SWITCHER_CFG: GlassCfg = {
      glassThickness: 30, bezelWidth: 40, ior: 1.4,
      scaleRatio: 1.0, blur: 0, specularOpacity: 0.5,
      specularSat: 0, tintColor: '255,255,255', tintOpacity: 0,
      innerShadow: 'rgba(255,255,255,0)', innerShadowBlur: 0,
      innerShadowSpread: 0, balancedSpecular: true,
    };

    // ── SVG defs container ──────────────────────────────────
    let defs: SVGDefsElement | null = null;
    const svgRoot = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgRoot.setAttribute('width', '0');
    svgRoot.setAttribute('height', '0');
    svgRoot.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;z-index:-1;';
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs') as SVGDefsElement;
    svgRoot.appendChild(defs);
    document.documentElement.appendChild(svgRoot);

    // ── Per-element glass state ─────────────────────────────
    type GlassInstance = { rebuild: () => void; destroy: () => void };
    const targets = new Map<HTMLElement, GlassInstance>();

    function applyGlass(el: HTMLElement, cfgGetter: () => GlassCfg) {
      if (targets.has(el)) return;
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';

      const refr = document.createElement('div');
      refr.className = 'lg-layer';
      refr.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;';
      const tint = document.createElement('div');
      tint.className = 'lg-layer';
      tint.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;';
      el.insertBefore(tint, el.firstChild);
      el.insertBefore(refr, el.firstChild);

      let filterNode: SVGFilterElement | null = null;
      let timer: ReturnType<typeof setTimeout> | null = null;

      function elevate() {
        Array.from(el.children).forEach((c) => {
          if (c === refr || c === tint) return;
          const child = c as HTMLElement;
          if (getComputedStyle(child).position === 'static') child.style.position = 'relative';
          if (!child.style.zIndex) child.style.zIndex = '1';
        });
      }

      function rebuild() {
        if (!defs) return;
        const rect = el.getBoundingClientRect();
        const w = Math.round(el.offsetWidth || rect.width);
        const h = Math.round(el.offsetHeight || rect.height);
        if (w < 4 || h < 4) return;
        const dataR = parseFloat(el.getAttribute('data-radius') || '0');
        const cssR = parseFloat(getComputedStyle(el).borderTopLeftRadius || '0');
        const r = Math.max(2, Math.min(dataR || cssR || 24, w / 2, h / 2));
        if (filterNode) filterNode.remove();
        const cfg = cfgGetter();
        const id = 'mv-lg-' + Math.random().toString(36).slice(2, 10);
        filterNode = buildFilter(id, w, h, r, cfg);
        defs.appendChild(filterNode);
        refr.style.borderRadius = `${r}px`;
        refr.style.backdropFilter = `url(#${id})`;
        (refr.style as unknown as Record<string, string>).webkitBackdropFilter = `url(#${id})`;
        tint.style.borderRadius = `${r}px`;
        tint.style.backgroundColor = `rgba(${cfg.tintColor},${cfg.tintOpacity})`;
        tint.style.boxShadow = `inset 0 0 ${cfg.innerShadowBlur}px ${cfg.innerShadowSpread}px ${cfg.innerShadow}`;
        elevate();
      }

      function schedule() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(rebuild, 16);
      }

      const ro = new ResizeObserver(schedule);
      ro.observe(el);

      targets.set(el, {
        rebuild,
        destroy() {
          if (timer) clearTimeout(timer);
          ro.disconnect();
          if (filterNode) filterNode.remove();
          refr.remove();
          tint.remove();
        },
      });
      rebuild();
    }

    function removeGlass(el: HTMLElement) {
      const inst = targets.get(el);
      if (!inst) return;
      inst.destroy();
      targets.delete(el);
    }

    function enableGlass(el: HTMLElement, cfgGetter: () => GlassCfg) {
      if (!targets.has(el)) applyGlass(el, cfgGetter);
      else targets.get(el)!.rebuild();
    }

    // ── Nav Glass (on the nav-inner itself) ─────────────────
    navInnerRef.current!.setAttribute('data-radius', '999');
    applyGlass(navInnerRef.current!, () => ({
      ...SWITCHER_CFG, balancedSpecular: true,
    }));

    // ── Tab Switcher Interaction ────────────────────────────
    const items = Array.from(nav.querySelectorAll<HTMLButtonElement>('.ios-item'));
    const DRAG_THRESHOLD = 6;
    const OVERSHOOT = 22;

    let active = Math.max(0, items.findIndex((x) => x.classList.contains('active')));
    let targetIdx = active;
    let pointerId: number | null = null;
    let pressX = 0, pressY = 0, dragMode = false, pressWidth = 0;
    let finishTimer: ReturnType<typeof setTimeout> | null = null;
    let glassRebuildQueued = false;

    function navRect() { return nav.getBoundingClientRect(); }

    function toLocalX(clientX: number) {
      const nr = navRect();
      const sx = nr.width > 0 ? nav.clientWidth / nr.width : 1;
      return (clientX - nr.left) * sx;
    }

    function itemMetrics(i: number) {
      const nr = navRect();
      const ir = items[i].getBoundingClientRect();
      const sx = nr.width > 0 ? nav.clientWidth / nr.width : 1;
      const left = (ir.left - nr.left) * sx;
      const width = ir.width * sx;
      return { left, width, center: left + width / 2 };
    }

    function nearestIndex(localX: number) {
      let best = 0, bestD = Infinity;
      for (let i = 0; i < items.length; i++) {
        const d = Math.abs(localX - itemMetrics(i).center);
        if (d < bestD) { bestD = d; best = i; }
      }
      return best;
    }

    function setActive(i: number) {
      active = i;
      items.forEach((btn, idx) => btn.classList.toggle('active', idx === i));
    }

    function setIndicator(left: number, width: number, animate: boolean) {
      if (!animate) {
        const old = indicator.style.transition;
        indicator.style.transition = 'none';
        indicator.style.left = `${left}px`;
        indicator.style.width = `${width}px`;
        void indicator.offsetWidth; // force reflow to disable transition
        indicator.style.transition = old;
      } else {
        indicator.style.left = `${left}px`;
        indicator.style.width = `${width}px`;
      }
    }

    function snapToIndex(i: number, animate: boolean) {
      const m = itemMetrics(i);
      setIndicator(m.left, m.width, animate);
    }

    function setGlow(clientX: number, clientY: number, alpha: number) {
      const nr = navRect();
      nav.style.setProperty('--gx', `${toLocalX(clientX)}px`);
      nav.style.setProperty('--gy', `${clientY - nr.top}px`);
      nav.style.setProperty('--ga', String(alpha));
    }

    function forceGlassRebuild() {
      const inst = targets.get(indicator);
      if (inst) inst.rebuild();
    }

    function queueGlassRebuild() {
      if (glassRebuildQueued) return;
      glassRebuildQueued = true;
      requestAnimationFrame(() => { glassRebuildQueued = false; forceGlassRebuild(); });
    }

    function beginInteraction(clientX: number, clientY: number) {
      if (finishTimer) clearTimeout(finishTimer);
      indicator.classList.add('interacting');
      navWrap.classList.add('engaged');
      setGlow(clientX, clientY, 0.24);
      enableGlass(indicator, () => ({ ...SWITCHER_CFG, balancedSpecular: true }));
      queueGlassRebuild();
    }

    function endInteraction() {
      if (finishTimer) clearTimeout(finishTimer);
      finishTimer = setTimeout(() => {
        indicator.classList.remove('interacting');
        nav.classList.remove('dragging');
        navWrap.classList.remove('engaged');
        nav.style.setProperty('--ga', '0');
        removeGlass(indicator);
      }, 500);
    }

    function dragMove(clientX: number) {
      const localX = toLocalX(clientX);
      const w = pressWidth || itemMetrics(active).width;
      let left = localX - w / 2;
      left = clamp(left, -OVERSHOOT, nav.clientWidth - w + OVERSHOOT);
      indicator.style.left = `${left}px`;
      indicator.style.width = `${w}px`;
      targetIdx = nearestIndex(localX);
      queueGlassRebuild();
    }

    function clearPointerHandlers() {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
    }

    function finishSelection() {
      nav.classList.remove('dragging');
      setActive(targetIdx);
      snapToIndex(targetIdx, true);
      queueGlassRebuild();
      setTimeout(queueGlassRebuild, 120);
      endInteraction();
      // Navigate to the selected tab
      router.push(TABS[targetIdx].path);
    }

    function onPointerMove(e: PointerEvent) {
      if (e.pointerId !== pointerId) return;
      const dx = Math.abs(e.clientX - pressX);
      const dy = Math.abs(e.clientY - pressY);
      if (!dragMode && (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD)) {
        dragMode = true;
        nav.classList.add('dragging');
      }
      if (dragMode) { setGlow(e.clientX, e.clientY, 0.18); dragMove(e.clientX); }
      else { setGlow(e.clientX, e.clientY, 0.22); }
    }

    function onPointerUp(e: PointerEvent) {
      if (e.pointerId !== pointerId) return;
      clearPointerHandlers();
      finishSelection();
      pointerId = null;
      dragMode = false;
    }

    function onPointerCancel(e: PointerEvent) {
      if (e.pointerId !== pointerId) return;
      clearPointerHandlers();
      nav.classList.remove('dragging');
      snapToIndex(active, true);
      endInteraction();
      pointerId = null;
      dragMode = false;
    }

    function armPointer(idx: number, e: PointerEvent) {
      if (pointerId !== null) return;
      pointerId = e.pointerId;
      dragMode = false;
      targetIdx = idx;
      pressX = e.clientX;
      pressY = e.clientY;
      pressWidth = itemMetrics(idx).width;
      beginInteraction(e.clientX, e.clientY);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerCancel);
    }

    items.forEach((btn, idx) => {
      btn.style.touchAction = 'none';
      btn.addEventListener('pointerdown', (e) => {
        if (!e.isPrimary || e.button !== 0) return;
        e.preventDefault();
        armPointer(idx, e);
      });
    });

    // Initial snap
    snapToIndex(active, false);

    function onResize() { snapToIndex(active, false); }
    window.addEventListener('resize', onResize);

    // ── Cleanup ─────────────────────────────────────────────
    return () => {
      window.removeEventListener('resize', onResize);
      clearPointerHandlers();
      targets.forEach((inst) => inst.destroy());
      svgRoot.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="ios26-nav" ref={navWrapRef} data-radius="999">
      <div className="ios26-nav-inner" ref={navInnerRef}>
        <div className="nav-glow" id="navGlow" />
        <div className="tab-indicator" ref={indicatorRef} id="tabIndicator" />

        {TABS.map((tab, idx) => {
          const isActive = tab.path === '/'
            ? pathname === '/'
            : pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              ref={(el) => { itemRefs.current[idx] = el; }}
              className={`ios-item${isActive ? ' active' : ''}`}
              type="button"
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
