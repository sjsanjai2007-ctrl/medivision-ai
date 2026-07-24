// ============================================================
// MediVision AI – SVG Refraction Engine (Liquid Glass)
// ============================================================

export interface LiquidGlassConfig {
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

const DEFAULT_CONFIG: LiquidGlassConfig = {
  glassThickness: 80,
  bezelWidth: 40,
  ior: 1.4,
  scaleRatio: 1.0,
  blur: 1,
  specularOpacity: 0.6,
  specularSat: 0,
  tintColor: '255,255,255',
  tintOpacity: 0,
  innerShadow: 'rgba(255,255,255,0)',
  innerShadowBlur: 0,
  innerShadowSpread: 0,
  balancedSpecular: false,
};

const DEFAULT_SWITCHER_CONFIG: LiquidGlassConfig = {
  glassThickness: 30,
  bezelWidth: 40,
  ior: 1.4,
  scaleRatio: 1.0,
  blur: 0,
  specularOpacity: 0.5,
  specularSat: 0,
  tintColor: '255,255,255',
  tintOpacity: 0,
  innerShadow: 'rgba(255,255,255,0)',
  innerShadowBlur: 0,
  innerShadowSpread: 0,
  balancedSpecular: true,
};

interface GlassInstance {
  rebuild: () => void;
  destroy: () => void;
}

const targets = new Map<HTMLElement, GlassInstance>();
let defs: SVGDefsElement | null = null;

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function surfaceFn(x: number): number {
  return Math.pow(1 - Math.pow(1 - x, 4), 0.25);
}

function calcRefractionProfile(
  glassThickness: number,
  bezelWidth: number,
  ior: number,
  samples: number = 128
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
  maxDisp: number
): string {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 128;
    d[i + 1] = 128;
    d[i + 2] = 0;
    d[i + 3] = 255;
  }
  const r = radius,
    rSq = r * r,
    r1Sq = (r + 1) ** 2;
  const rBSq = Math.max(r - bezelWidth, 0) ** 2;
  const wB = w - r * 2,
    hB = h - r * 2,
    S = profile.length;
  for (let y1 = 0; y1 < h; y1++) {
    for (let x1 = 0; x1 < w; x1++) {
      const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
      const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
      const dSq = x * x + y * y;
      if (dSq > r1Sq || dSq < rBSq) continue;
      const dist = Math.sqrt(dSq);
      const fromSide = r - dist;
      const op =
        dSq < rSq
          ? 1
          : 1 -
            (dist - Math.sqrt(rSq)) /
              (Math.sqrt(r1Sq) - Math.sqrt(rSq));
      if (op <= 0 || dist === 0) continue;
      const cos = x / dist,
        sin = y / dist;
      const bi = Math.min(((fromSide / bezelWidth) * S) | 0, S - 1);
      const disp = profile[bi] || 0;
      const dX = (-cos * disp) / maxDisp,
        dY = (-sin * disp) / maxDisp;
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
  balanced: boolean
): string {
  const angle = Math.PI / 3;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  d.fill(0);
  const r = radius,
    rSq = r * r,
    r1Sq = (r + 1) ** 2;
  const rBSq = Math.max(r - bezelWidth, 0) ** 2;
  const wB = w - r * 2,
    hB = h - r * 2;
  const sv = [Math.cos(angle), Math.sin(angle)];
  for (let y1 = 0; y1 < h; y1++) {
    for (let x1 = 0; x1 < w; x1++) {
      const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
      const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
      const dSq = x * x + y * y;
      if (dSq > r1Sq || dSq < rBSq) continue;
      const dist = Math.sqrt(dSq);
      const fromSide = r - dist;
      const op =
        dSq < rSq
          ? 1
          : 1 -
            (dist - Math.sqrt(rSq)) /
              (Math.sqrt(r1Sq) - Math.sqrt(rSq));
      if (op <= 0 || dist === 0) continue;
      const cos = x / dist,
        sin = -y / dist;
      const dot = balanced
        ? 1
        : Math.abs(cos * sv[0] + sin * sv[1]);
      const edge = Math.sqrt(Math.max(0, 1 - (1 - fromSide) ** 2));
      const coeff = dot * edge;
      const col = (255 * coeff) | 0;
      const alpha = (col * coeff * op) | 0;
      const idx = (y1 * w + x1) * 4;
      d[idx] = col;
      d[idx + 1] = col;
      d[idx + 2] = col;
      d[idx + 3] = alpha;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

function svgEl(
  tag: string,
  attrs: Record<string, string | number>
): SVGElement {
  const el = document.createElementNS(
    'http://www.w3.org/2000/svg',
    tag
  );
  for (const [k, v] of Object.entries(attrs))
    el.setAttribute(k, String(v));
  return el;
}

function ensureDefs(): void {
  const old = document.getElementById('sec-lg-defs');
  if (old && document.documentElement.contains(old)) {
    defs = old as unknown as SVGDefsElement;
    return;
  }
  const svg = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;z-index:-1;';
  defs = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'defs'
  );
  defs.id = 'sec-lg-defs';
  svg.appendChild(defs);
  document.documentElement.appendChild(svg);
}

function buildFilter(
  id: string,
  w: number,
  h: number,
  radius: number,
  cfg: LiquidGlassConfig
): SVGElement {
  const bezel = Math.min(
    cfg.bezelWidth,
    radius - 1,
    Math.min(w, h) / 2 - 1
  );
  const profile = calcRefractionProfile(
    cfg.glassThickness,
    bezel,
    cfg.ior,
    128
  );
  const maxDisp =
    Math.max(...Array.from(profile).map(Math.abs)) || 1;
  const dispUrl = generateDisplacementMap(
    w,
    h,
    radius,
    bezel,
    profile,
    maxDisp
  );
  const specUrl = generateSpecularMap(
    w,
    h,
    radius,
    bezel * 2.5,
    !!cfg.balancedSpecular
  );
  const scale = maxDisp * cfg.scaleRatio;
  const pad = cfg.balancedSpecular ? 0.36 : 0;
  const fx = Math.round(-w * pad);
  const fy = Math.round(-h * pad);
  const fw = Math.round(w * (1 + pad * 2));
  const fh = Math.round(h * (1 + pad * 2));

  const filter = svgEl('filter', {
    id,
    x: fx,
    y: fy,
    width: fw,
    height: fh,
    filterUnits: 'userSpaceOnUse',
    primitiveUnits: 'userSpaceOnUse',
    'color-interpolation-filters': 'sRGB',
  });
  const blur = svgEl('feGaussianBlur', {
    in: 'SourceGraphic',
    stdDeviation: cfg.blur,
    result: 'blurred',
  });
  const dispImg = svgEl('feImage', {
    href: dispUrl,
    x: 0,
    y: 0,
    width: w,
    height: h,
    result: 'disp_map',
  });
  const dispMap = svgEl('feDisplacementMap', {
    in: 'blurred',
    in2: 'disp_map',
    scale,
    xChannelSelector: 'R',
    yChannelSelector: 'G',
    result: 'displaced',
  });
  const sat = svgEl('feColorMatrix', {
    in: 'displaced',
    type: 'saturate',
    values: cfg.specularSat,
    result: 'displaced_sat',
  });
  const spec = svgEl('feImage', {
    href: specUrl,
    x: 0,
    y: 0,
    width: w,
    height: h,
    result: 'spec_layer',
  });
  const comp = svgEl('feComposite', {
    in: 'displaced_sat',
    in2: 'spec_layer',
    operator: 'in',
    result: 'spec_masked',
  });
  const tr = svgEl('feComponentTransfer', {
    in: 'spec_layer',
    result: 'spec_faded',
  });
  tr.appendChild(
    svgEl('feFuncA', { type: 'linear', slope: cfg.specularOpacity })
  );
  const b1 = svgEl('feBlend', {
    in: 'spec_masked',
    in2: 'displaced',
    mode: 'normal',
    result: 'with_sat',
  });
  const b2 = svgEl('feBlend', {
    in: 'spec_faded',
    in2: 'with_sat',
    mode: 'normal',
  });
  filter.append(blur, dispImg, dispMap, sat, spec, comp, tr, b1, b2);
  return filter;
}

export function applyGlass(
  el: HTMLElement,
  cfgGetter: () => LiquidGlassConfig
): void {
  if (targets.has(el)) return;
  if (getComputedStyle(el).position === 'static')
    el.style.position = 'relative';

  const refr = document.createElement('div');
  refr.className = 'lg-layer';
  refr.style.cssText =
    'position:absolute;inset:0;z-index:0;pointer-events:none;';
  const tint = document.createElement('div');
  tint.className = 'lg-layer';
  tint.style.cssText =
    'position:absolute;inset:0;z-index:0;pointer-events:none;';
  el.insertBefore(tint, el.firstChild);
  el.insertBefore(refr, el.firstChild);

  let filterNode: SVGElement | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  let lastW = 0;
  let lastH = 0;
  let lastCfgStr = '';

  function elevate() {
    Array.from(el.children).forEach((c) => {
      if (c === refr || c === tint) return;
      const htmlC = c as HTMLElement;
      if (getComputedStyle(htmlC).position === 'static')
        htmlC.style.position = 'relative';
      if (!htmlC.style.zIndex) htmlC.style.zIndex = '1';
    });
  }

  function rebuild() {
    ensureDefs();
    const rect = el.getBoundingClientRect();
    const w = Math.round(el.offsetWidth || rect.width);
    const h = Math.round(el.offsetHeight || rect.height);
    if (w < 4 || h < 4) return;
    const dataR = parseFloat(
      el.getAttribute('data-radius') || '0'
    );
    const cssR = parseFloat(
      getComputedStyle(el).borderTopLeftRadius || '0'
    );
    const r = Math.max(
      2,
      Math.min(dataR || cssR || 24, w / 2, h / 2)
    );
    const cfg = cfgGetter();
    const cfgStr = JSON.stringify(cfg);

    if (w === lastW && h === lastH && cfgStr === lastCfgStr) {
      elevate();
      return;
    }

    lastW = w;
    lastH = h;
    lastCfgStr = cfgStr;

    if (filterNode) filterNode.remove();
    const id =
      'sec-lg-' + Math.random().toString(36).slice(2, 10);
    filterNode = buildFilter(id, w, h, r, cfg);
    defs!.appendChild(filterNode);
    refr.style.borderRadius = r + 'px';
    refr.style.backdropFilter = `url(#${id})`;
    (refr.style as CSSStyleDeclaration & { webkitBackdropFilter: string }).webkitBackdropFilter = `url(#${id})`;
    tint.style.borderRadius = r + 'px';
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

export function removeGlass(el: HTMLElement): void {
  const inst = targets.get(el);
  if (!inst) return;
  inst.destroy();
  targets.delete(el);
}

export function enableGlass(
  el: HTMLElement,
  cfgGetter: () => LiquidGlassConfig
): void {
  if (!targets.has(el)) applyGlass(el, cfgGetter);
  else targets.get(el)!.rebuild();
}

export function forceRebuild(el: HTMLElement): void {
  const inst = targets.get(el);
  if (inst) inst.rebuild();
}

export { DEFAULT_CONFIG, DEFAULT_SWITCHER_CONFIG };
