/**
 * Liquid Glass Engine for mir.ai
 * High-fidelity squircle refraction, specular rim reflections & spring physics.
 * 
 * Features:
 * - Chromium SVG feDisplacementMap + feComponentTransfer refraction
 * - WebKit / Gecko smooth frosted glass fallback
 * - Lissé squircle outline & signed distance field calculation
 * - Dynamic specular rim highlight & side shading (canvas baked)
 * - Capsule 3-slice fast path caching
 * - Interactive pointer tracking & spring physics (translate, scale, glow)
 */

// --------------------------------------------------------------------------
// Environment & Engine Detection
// --------------------------------------------------------------------------

let detectedEngine = null;

export function detectEngine() {
  if (detectedEngine) return detectedEngine;
  if (typeof navigator === "undefined") return "webkit";
  const ua = navigator.userAgent;
  if (/Firefox\//.test(ua)) {
    detectedEngine = "gecko";
    return detectedEngine;
  }
  const brands = navigator.userAgentData?.brands;
  if (brands && brands.length) {
    const chromium = brands.some((b) =>
      /Chromium|Google Chrome|Microsoft Edge/i.test(b.brand)
    );
    detectedEngine = chromium ? "chromium" : "webkit";
    return detectedEngine;
  }
  const chromium =
    /(Chrome|Chromium|Edg|SamsungBrowser)\/\d+/.test(ua) && !/Firefox\//.test(ua);
  detectedEngine = chromium ? "chromium" : "webkit";
  return detectedEngine;
}

let detectedMode = null;

export function detectMode() {
  if (detectedMode) return detectedMode;
  detectedMode = detectEngine() === "chromium" ? "refract" : "frost";
  return detectedMode;
}

// --------------------------------------------------------------------------
// Springs & Motion Physics
// --------------------------------------------------------------------------

const springs = {
  press: { duration: 0.24, bounce: 0.2 },
  release: { duration: 0.5, bounce: 0.42 },
  glow: { duration: 0.42, bounce: 0 },
  track: { duration: 0.18, bounce: 0 },
  layout: { duration: 0.4, bounce: 0.16 },
};

export class Spring {
  constructor(value, options) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
    this.stiffness = 0;
    this.damping = 0;
    this.configure(options);
  }
  configure({ duration, bounce }) {
    const omega = (2 * Math.PI) / duration;
    this.stiffness = omega * omega;
    this.damping =
      bounce >= 0
        ? (4 * Math.PI * (1 - bounce)) / duration
        : (4 * Math.PI) / (duration * (1 + bounce));
    return this;
  }
  jump(value) {
    this.value = this.target = value;
    this.velocity = 0;
    return this;
  }
  get settled() {
    return this.value === this.target && this.velocity === 0;
  }
  step(dt) {
    if (this.settled || !(dt > 0)) return this;
    const omega = Math.sqrt(this.stiffness);
    const zeta = this.damping / (2 * omega);
    const x0 = this.value - this.target;
    const v0 = this.velocity;
    let x, v;
    if (zeta < 1) {
      const wd = omega * Math.sqrt(1 - zeta * zeta);
      const decay = Math.exp(-zeta * omega * dt);
      const a = x0;
      const b = (v0 + zeta * omega * x0) / wd;
      const cos = Math.cos(wd * dt);
      const sin = Math.sin(wd * dt);
      x = decay * (a * cos + b * sin);
      v = decay * ((b * wd - zeta * omega * a) * cos - (a * wd + zeta * omega * b) * sin);
    } else if (zeta === 1) {
      const decay = Math.exp(-omega * dt);
      const b = v0 + omega * x0;
      x = decay * (x0 + b * dt);
      v = decay * (b - omega * (x0 + b * dt));
    } else {
      const root = omega * Math.sqrt(zeta * zeta - 1);
      const r1 = -zeta * omega + root;
      const r2 = -zeta * omega - root;
      const c2 = (v0 - r1 * x0) / (r2 - r1);
      const c1 = x0 - c2;
      const e1 = Math.exp(r1 * dt);
      const e2 = Math.exp(r2 * dt);
      x = c1 * e1 + c2 * e2;
      v = c1 * r1 * e1 + c2 * r2 * e2;
    }
    const scale = Math.max(1, Math.abs(this.target), Math.abs(x0));
    if (Math.abs(x) < 1e-4 * scale && Math.abs(v) < 1e-3 * scale) {
      this.value = this.target;
      this.velocity = 0;
    } else {
      this.value = this.target + x;
      this.velocity = v;
    }
    return this;
  }
}

function rubberBand(offset, limit, coefficient = 0.55) {
  if (limit <= 0) return 0;
  const magnitude = Math.abs(offset);
  return Math.sign(offset) * limit * (1 - 1 / (magnitude * coefficient / limit + 1));
}

let reducedQuery;
function resolveMotion(motion) {
  if (motion === "none" || motion === "reduced") return motion;
  if (typeof matchMedia !== "function") return "full";
  reducedQuery = reducedQuery || matchMedia("(prefers-reduced-motion: reduce)");
  return reducedQuery.matches ? "reduced" : "full";
}

// --------------------------------------------------------------------------
// Materials & Tone Tables
// --------------------------------------------------------------------------

const MATERIALS = {
  clear: {
    light: { shadowLift: 0.18, highlightRolloff: 0 },
    dark: { shadowLift: 0.15, highlightRolloff: 0.2 },
  },
  regular: {
    blur: 4.5,
    light: { fillSigma: 15, fillOpacity: 0.34, tone: [0.36, 0.67, -0.1113, 1.1031] },
    dark: { fillSigma: 14, fillOpacity: 0.65, tone: [0.105, 0.83, -0.2091, 1.0648] },
  },
};

const toneTableCache = new Map();

function toneTable(material, appearance, nested) {
  const key = `${material}|${appearance}|${nested ? "n" : ""}`;
  const cached = toneTableCache.get(key);
  if (cached) return cached;
  const dark = appearance === "dark";
  let values;
  if (material === "regular") {
    const [a, b, q] = (dark ? MATERIALS.regular.dark : MATERIALS.regular.light).tone;
    const toneWeight = dark ? 0.9 : 0.8;
    values = Array.from({ length: 33 }, (_, n) => {
      const v = n / 32;
      return toneWeight * (a + b * v + q * v * v) + (1 - toneWeight) * v;
    });
  } else {
    const spec = dark ? MATERIALS.clear.dark : MATERIALS.clear.light;
    values = Array.from({ length: 33 }, (_, n) => {
      const v = n / 32;
      const tone = v + spec.shadowLift * Math.pow(1 - v, 3) - spec.highlightRolloff * Math.pow(v, 3);
      const tinted = dark ? 0.38 * v + 0.2 : 0.78 * v + 0.26;
      const tintWeight = dark ? 0.14 : 0.06;
      const layerLight = dark && nested ? 0.08 * (1 - v) : 0;
      return Math.max(0, Math.min(1, (1 - tintWeight) * tone + tintWeight * tinted + layerLight));
    });
  }
  const table = values.map((v) => v.toFixed(5)).join(" ");
  toneTableCache.set(key, table);
  return table;
}

function tintChannels(tint) {
  if (!tint || !/^#[\da-f]{6}$/i.test(tint)) return undefined;
  return [
    parseInt(tint.slice(1, 3), 16) / 255,
    parseInt(tint.slice(3, 5), 16) / 255,
    parseInt(tint.slice(5, 7), 16) / 255,
  ];
}

// --------------------------------------------------------------------------
// Lissé Squircle Outline
// --------------------------------------------------------------------------

const SMOOTHING = 0.8125;
const rad = (d) => (d * Math.PI) / 180;

function cornerParams(radius, budget) {
  const e = radius;
  let p = (1 + SMOOTHING) * e;
  const o = 90 * (1 - SMOOTHING);
  const i = Math.sin(rad(o / 2)) * e * Math.SQRT2;
  const g = e * Math.tan(rad((90 - o) / 4));
  const c = g * Math.cos(rad(45 * SMOOTHING));
  const d = c * Math.tan(rad(45 * SMOOTHING));
  let u = (p - i - c - d) / 3;
  let a = 2 * u;
  if (p > budget) {
    const rem = budget - d - i - c;
    const m = rem / 6;
    const l = rem - m;
    u = Math.min(u, l);
    a = rem - u;
    p = budget;
  }
  return { a, b: u, c, d, p, i, radius: e };
}

const outlineCache = new Map();

function bezier(out, x0, y0, x1, y1, x2, y2, x3, y3, steps) {
  for (let s = 1; s <= steps; s++) {
    const t = s / steps, w = 1 - t;
    out.push(
      x0 * w * w * w + 3 * w * w * t * x1 + 3 * w * t * t * x2 + t * t * t * x3,
      y0 * w * w * w + 3 * w * w * t * y1 + 3 * w * t * t * y2 + t * t * t * y3
    );
  }
}

export function squircleOutline(w, h, radius) {
  const key = `${w}|${h}|${radius}`;
  const cached = outlineCache.get(key);
  if (cached) return cached;
  const hw = w / 2, hh = h / 2;
  const budget = Math.min(hw, hh);
  const r = Math.min(radius, budget);
  if (r < 0.5) {
    const outline = {
      corners: [new Float64Array(0), new Float64Array(0), new Float64Array(0), new Float64Array(0)],
      extent: 0,
      polygon: `polygon(0px 0px, ${w}px 0px, ${w}px ${h}px, 0px ${h}px)`,
      width: w,
      height: h,
      radius: 0,
    };
    outlineCache.set(key, outline);
    return outline;
  }
  const { a, b, c, d, p, i } = cornerParams(r, budget);

  const pts = [];
  const x0 = hw - p, y0 = -hh;
  bezier(pts, x0, y0, x0 + a, y0, x0 + a + b, y0, x0 + a + b + c, y0 + d, 24);
  const ax = x0 + a + b + c, ay = y0 + d;
  const chord = i * Math.SQRT2;
  const dx = i, dy = i;
  const offset = Math.sqrt(Math.max(0, r * r - (chord * chord) / 4));
  const cx = ax + dx / 2 - (dy / chord) * offset;
  const cy = ay + dy / 2 + (dx / chord) * offset;
  const angle = Math.atan2(ay - cy, ax - cx);
  const extent = 2 * Math.asin(Math.min(1, chord / (2 * r)));
  for (let s = 1; s <= 8; s++) {
    const theta = angle + (extent * s) / 8;
    pts.push(cx + r * Math.cos(theta), cy + r * Math.sin(theta));
  }
  const qx = ax + dx, qy = ay + dy;
  bezier(pts, qx, qy, qx + d, qy + c, qx + d, qy + b + c, qx + d, qy + a + b + c, 24);

  const withAnchors = [x0, y0, ...pts, hw, -hh + p];
  const count = withAnchors.length / 2;
  const trPts = new Float64Array(count * 2);
  const trNormals = new Float64Array(count * 2);
  for (let k = 0; k < count; k++) {
    const px = withAnchors[2 * k], py = withAnchors[2 * k + 1];
    const prevX = withAnchors[2 * Math.max(0, k - 1)], prevY = withAnchors[2 * Math.max(0, k - 1) + 1];
    const nextX = withAnchors[2 * Math.min(count - 1, k + 1)], nextY = withAnchors[2 * Math.min(count - 1, k + 1) + 1];
    let tdx = nextX - prevX, tdy = nextY - prevY;
    if (k === 0) { tdx = 1; tdy = 0; }
    if (k === count - 1) { tdx = 0; tdy = 1; }
    const len = Math.hypot(tdx, tdy) || 1;
    trPts[2 * k] = px;
    trPts[2 * k + 1] = py;
    trNormals[2 * k] = tdy / len;
    trNormals[2 * k + 1] = -tdx / len;
  }

  const mirror = (mx, my) => {
    const run = new Float64Array(count * 4);
    const sx = mx ? -1 : 1, sy = my ? -1 : 1;
    for (let k = 0; k < count; k++) {
      run[4 * k] = sx * trPts[2 * k];
      run[4 * k + 1] = sy * trPts[2 * k + 1];
      run[4 * k + 2] = sx * trNormals[2 * k];
      run[4 * k + 3] = sy * trNormals[2 * k + 1];
    }
    return run;
  };
  const tr = mirror(false, false);
  const br = mirror(false, true);
  const bl = mirror(true, true);
  const tl = mirror(true, false);

  const poly = [];
  const push = (run, step) => {
    for (let k = step > 0 ? 0 : count - 1; step > 0 ? k < count : k >= 0; k += step) {
      poly.push(`${(run[4 * k] + hw).toFixed(2)}px ${(run[4 * k + 1] + hh).toFixed(2)}px`);
    }
  };
  push(tr, 1);
  push(br, -1);
  push(bl, 1);
  push(tl, -1);

  const outline = {
    corners: [tr, br, bl, tl],
    extent: p,
    polygon: `polygon(${poly.join(", ")})`,
    width: w,
    height: h,
    radius: r,
  };
  if (outlineCache.size > 256) outlineCache.delete(outlineCache.keys().next().value);
  outlineCache.set(key, outline);
  return outline;
}

function outlineField(px, py, outline) {
  const hw = outline.width / 2, hh = outline.height / 2, p = outline.extent;
  const ax = Math.abs(px), ay = Math.abs(py);
  const qx = ax - (hw - p), qy = ay - (hh - p);
  if (qx > 0 && qy > 0) {
    const run =
      (px >= 0 ? (py < 0 ? outline.corners[0] : outline.corners[1]) : py < 0 ? outline.corners[3] : outline.corners[2]);
    if (!run || run.length === 0) {
      const dx = ax - hw, dy = ay - hh;
      const distance = Math.hypot(dx, dy);
      return { d: distance, nx: dx / (distance || 1), ny: dy / (distance || 1) };
    }
    let best2 = Infinity, bx = 0, by = 0, bnx = 0, bny = 0;
    const n = run.length / 4;
    for (let k = 0; k < n - 1; k++) {
      const x1 = run[4 * k], y1 = run[4 * k + 1];
      const ex = run[4 * k + 4] - x1, ey = run[4 * k + 5] - y1;
      const len2 = ex * ex + ey * ey;
      const t = len2 > 1e-12 ? sat(((px - x1) * ex + (py - y1) * ey) / len2) : 0;
      const qx2 = x1 + ex * t, qy2 = y1 + ey * t;
      const dx = px - qx2, dy = py - qy2;
      const d2 = dx * dx + dy * dy;
      if (d2 < best2) {
        best2 = d2;
        bx = qx2; by = qy2; bnx = run[4 * k + 2]; bny = run[4 * k + 3];
      }
    }
    const distance = Math.sqrt(best2);
    const delta = distance > 1e-5 ? 1 / distance : 0;
    const dx = px - bx, dy = py - by;
    const direction = dx * bnx + dy * bny >= 0 ? 1 : -1;
    return {
      d: distance * direction,
      nx: distance > 1e-5 ? (dx * delta) * direction : bnx,
      ny: distance > 1e-5 ? (dy * delta) * direction : bny,
    };
  }
  if (qx > qy) return { d: qx - p, nx: Math.sign(px) || 1, ny: 0 };
  return { d: qy - p, nx: 0, ny: Math.sign(py) || 1 };
}

function resolveRadius(value, w, h) {
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return 0;
  const r = String(value).trim().endsWith("%") ? (n / 100) * Math.min(w, h) : n;
  return Math.max(0, Math.min(r, w / 2, h / 2));
}

// --------------------------------------------------------------------------
// Map Planes & Canvas Baking
// --------------------------------------------------------------------------

const sat = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const pow = Math.pow;
const sqrt = Math.sqrt;
const COS_SPREAD = Math.cos(1.08);
const COS_DIFFUSE = Math.cos(1.08 * 0.65);
const COS_SIDE = Math.cos(0.98);

const pixelScale = (w, h) =>
  w * h > 250000 ? 0.5 : Math.min(Math.max(window.devicePixelRatio || 1, 1), 2);

function renderCanvases(w, h, radius, bezel, dark, tint) {
  try {
    const outline = squircleOutline(w, h, radius);
    const hw = w / 2, hh = h / 2, p = outline.extent;
    const bz = Math.max(1, Math.min(bezel, hw, hh));
    const k = pixelScale(w, h);
    const mw = Math.max(1, Math.round(w * k));
    const mh = Math.max(1, Math.round(h * k));

    const fieldCanvas = document.createElement("canvas");
    fieldCanvas.width = mw;
    fieldCanvas.height = mh;
    const fctx = fieldCanvas.getContext("2d");
    if (!fctx) return { field: null, overlay: null };
    const fimg = fctx.createImageData(mw, mh);

    const pad = 2;
    const bw = w + pad * 2, bh = h + pad * 2;
    const ok = pixelScale(bw, bh);
    const omw = Math.max(1, Math.round(bw * ok));
    const omh = Math.max(1, Math.round(bh * ok));
    const overlayCanvas = document.createElement("canvas");
    overlayCanvas.width = omw;
    overlayCanvas.height = omh;
    const octx = overlayCanvas.getContext("2d");
    if (!octx) return { field: null, overlay: null };
    const oimg = octx.createImageData(omw, omh);

    for (let pass = 0; pass < 2; pass++) {
      const isField = pass === 0;
      const cw = isField ? w : bw, ch = isField ? h : bh;
      const scale = isField ? k : ok;
      const width = isField ? mw : omw, height = isField ? mh : omh;
      const img = isField ? fimg : oimg;
      const data = img.data;
      const aa = 1;
      for (let j = 0; j < height; j++) {
        const py = (j + 0.5) / scale - ch / 2;
        for (let i = 0; i < width; i++) {
          const px = (i + 0.5) / scale - cw / 2;
          const { d, nx, ny } = outlineField(px, py, outline);
          const o = (j * width + i) * 4;
          if (isField) {
            const coverage = sat(0.5 - d / aa);
            if (d < -(bz + 4)) {
              data[o] = 128; data[o + 1] = 128; data[o + 2] = 128; data[o + 3] = 255;
              continue;
            }
            const depth = sat(-d / bz);
            const edge = 1 - sat(sqrt((2 - depth) * depth));
            data[o] = Math.round(255 * (0.5 - nx * edge * 0.5));
            data[o + 1] = Math.round(255 * (0.5 - ny * edge * 0.5));
            data[o + 2] = 128;
            data[o + 3] = Math.round(255 * coverage);
          } else {
            const qx = Math.abs(px) - (hw - p), qy = Math.abs(py) - (hh - p);
            if (Math.max(qx, qy) - p > pad + 6) continue;
            const coverage = sat(0.5 - d / aa);
            const directional = pow(sat((Math.abs(ny) - COS_SPREAD) / (1 - COS_SPREAD)), 1.25);
            const diffuseDir = pow(sat((Math.abs(ny) - COS_DIFFUSE) / (1 - COS_DIFFUSE)), 1.25);
            const stroke = sat((d + 0.9) / aa + 0.5) * sat(0.5 - d / aa);
            let specular = directional * stroke;
            specular = specular / (1 + 0.5 * (1 - specular));
            const diffuse = diffuseDir * 0.18 * pow(1 - sat(-d / 4.5), 2) * coverage;
            const highlight = sat(specular * (dark ? 0.82 : 1) + diffuse * (dark ? 0.4 : 1));
            const adjusted = d - 0.5;
            const falloff = 1 - sat(-adjusted / 0.5);
            const ramp = (falloff > 0 ? 1 : 0) * 0.25 + falloff * 0.75;
            const outlineBand = ramp * sat((adjusted + 0.5) / aa + 0.5) * sat(-adjusted / aa + 0.5);
            const wx = sat((nx - COS_SIDE) / (1 - COS_SIDE)) * outlineBand;
            const wy = sat((-nx - COS_SIDE) / (1 - COS_SIDE)) * outlineBand;
            const shade = (wx / (1 + 0.4 * (1 - wx)) + wy / (1 + 0.4 * (1 - wy))) * (dark ? 0.6 : 0.48);
            const alpha = highlight + shade * (1 - highlight);
            if (alpha <= 0.002) continue;
            if (tint) {
              const base = highlight / Math.max(alpha, 1e-5);
              data[o] = Math.round(255 * Math.min(1, base * (0.45 + 0.55 * tint[0])));
              data[o + 1] = Math.round(255 * Math.min(1, base * (0.45 + 0.55 * tint[1])));
              data[o + 2] = Math.round(255 * Math.min(1, base * (0.45 + 0.55 * tint[2])));
              data[o + 3] = Math.round(255 * alpha);
            } else {
              const light = ((dark ? 0.82 : 1) * highlight) / Math.max(alpha, 1e-5);
              data[o] = data[o + 1] = data[o + 2] = Math.round(255 * Math.min(1, light));
              data[o + 3] = Math.round(255 * alpha);
            }
          }
        }
      }
      (isField ? fctx : octx).putImageData(img, 0, 0);
    }
    return { field: fieldCanvas, overlay: overlayCanvas };
  } catch (err) {
    console.warn("renderCanvases error:", err);
    return { field: null, overlay: null };
  }
}

// --------------------------------------------------------------------------
// Capsule Baking & Slicing
// --------------------------------------------------------------------------

const bakeCache = new Map();

function capsuleShape(w, h, radius) {
  return radius >= Math.min(w, h) / 2 - 0.75 && w >= h * 2;
}

function slicedURLs(baked, w, h) {
  const cap = h / 2;
  const bake = (source, sourcePad, destPad) => {
    const cw = w + destPad * 2, ch = h + destPad * 2;
    const scale = pixelScale(cw, ch);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(cw * scale));
    canvas.height = Math.max(1, Math.round(ch * scale));
    const ctx = canvas.getContext("2d");
    const sh = source.height;
    const sk = sh / (h + sourcePad * 2);
    const startX = sourcePad * sk;
    const capPx = cap * sk;
    const destCap = cap * scale;
    const startDest = destPad * scale;
    const capSrc = startX + capPx;
    const capDest = Math.round(startDest + destCap);
    const midDest = Math.max(1, canvas.width - 2 * capDest);
    ctx.drawImage(source, 0, 0, capSrc, sh, 0, 0, capDest, canvas.height);
    ctx.drawImage(source, capSrc, 0, Math.max(1, source.width - 2 * capSrc), sh, capDest, 0, midDest, canvas.height);
    ctx.drawImage(source, source.width - capSrc, 0, capSrc, sh, canvas.width - capDest, 0, capDest, canvas.height);
    return canvas;
  };
  return {
    field: baked.field ? bake(baked.field, 0, 0).toDataURL("image/png") : "",
    overlay: baked.overlay ? bake(baked.overlay, 2, 2).toDataURL("image/png") : "",
  };
}

const fieldCache = new Map();
const overlayCache = new Map();
const CACHE_LIMIT = 64;

function remember(cache, key, make) {
  const cached = cache.get(key);
  if (cached) return cached;
  const value = make();
  if (!value) return value;
  cache.set(key, value);
  if (cache.size > CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  return value;
}

function fieldURL(w, h, radius, o) {
  return remember(fieldCache, `${w}x${h}r${radius}b${o.bezel}`, () => {
    if (capsuleShape(w, h, radius)) {
      const baked = capsuleBake(h, radius, o);
      if (baked.field) return slicedURLs(baked, w, h).field;
    }
    return renderCanvases(w, h, radius, o.bezel, o.dark, o.tint).field?.toDataURL("image/png") || "";
  });
}

function overlayURL(w, h, radius, o) {
  return remember(overlayCache, `${w}x${h}r${radius}${o.dark ? "d" : "l"}${o.tint || ""}`, () => {
    if (capsuleShape(w, h, radius)) {
      const baked = capsuleBake(h, radius, o);
      if (baked.overlay) return slicedURLs(baked, w, h).overlay;
    }
    return renderCanvases(w, h, radius, o.bezel, o.dark, o.tint).overlay?.toDataURL("image/png") || "";
  });
}

function capsuleBake(h, radius, o) {
  const key = `bake|h${h}|r${radius}|${o.dark ? "d" : "l"}|${o.tint || ""}`;
  let baked = bakeCache.get(key);
  if (!baked) {
    baked = renderCanvases(h * 3, h, radius, o.bezel, o.dark, o.tint);
    if (bakeCache.size > 16) bakeCache.delete(bakeCache.keys().next().value);
    bakeCache.set(key, baked);
  }
  return baked;
}

// --------------------------------------------------------------------------
// Shared SVG Filter Host
// --------------------------------------------------------------------------

let defsHost = null;
const filterRefs = new Map();

function host() {
  if (defsHost && document.body.contains(defsHost)) return defsHost;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.position = "fixed";
  svg.style.width = "0";
  svg.style.height = "0";
  svg.style.overflow = "hidden";
  svg.style.pointerEvents = "none";
  document.body.appendChild(svg);
  defsHost = svg;
  return svg;
}

function acquireFilter(id, markup) {
  const existing = filterRefs.get(id);
  if (existing) {
    existing.count++;
    return;
  }
  const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
  filter.setAttribute("id", id);
  filter.setAttribute("color-interpolation-filters", "sRGB");
  filter.innerHTML = markup;
  host().appendChild(filter);
  filterRefs.set(id, { el: filter, count: 1 });
}

function releaseFilter(id) {
  const entry = filterRefs.get(id);
  if (!entry) return;
  if (--entry.count <= 0) {
    entry.el.remove();
    filterRefs.delete(id);
  }
}

function filterMarkup(opts) {
  const { w, h, field, material, appearance, refraction, dispersion, tint, nested } = opts;
  const dark = appearance === "dark";
  const spec = material === "regular" ? (dark ? MATERIALS.regular.dark : MATERIALS.regular.light) : null;
  const parts = [
    `<feImage href="${field}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="field"/>`,
  ];
  let base = "SourceGraphic";
  if (spec) {
    parts.push(
      `<feGaussianBlur in="SourceGraphic" stdDeviation="${MATERIALS.regular.blur}" result="frost"/>`,
      `<feGaussianBlur in="SourceGraphic" stdDeviation="${spec.fillSigma}" result="fill"/>`,
      `<feBlend in="frost" in2="fill" mode="${dark ? "darken" : "lighten"}" result="blend"/>`,
      `<feComposite in="blend" in2="frost" operator="arithmetic" k2="${spec.fillOpacity}" k3="${1 - spec.fillOpacity}" result="mix"/>`
    );
    base = "mix";
  }
  if (dispersion > 0) {
    const s = refraction * 2;
    parts.push(
      `<feDisplacementMap in="${base}" in2="field" scale="${s * (1 + dispersion)}" xChannelSelector="R" yChannelSelector="G" result="dr"/>`,
      `<feDisplacementMap in="${base}" in2="field" scale="${s}" xChannelSelector="R" yChannelSelector="G" result="dg"/>`,
      `<feDisplacementMap in="${base}" in2="field" scale="${s * (1 - dispersion)}" xChannelSelector="R" yChannelSelector="G" result="db"/>`,
      `<feColorMatrix in="dr" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="r"/>`,
      `<feColorMatrix in="dg" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="g"/>`,
      `<feColorMatrix in="db" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="b"/>`,
      `<feBlend in="r" in2="g" mode="screen" result="rg"/>`,
      `<feBlend in="rg" in2="b" mode="screen" result="refracted"/>`
    );
  } else {
    parts.push(
      `<feDisplacementMap in="${base}" in2="field" scale="${refraction * 2}" xChannelSelector="R" yChannelSelector="G" result="refracted"/>`
    );
  }
  const table = toneTable(material, appearance, nested);
  parts.push(
    `<feComponentTransfer in="refracted" result="tone"><feFuncR type="table" tableValues="${table}"/><feFuncG type="table" tableValues="${table}"/><feFuncB type="table" tableValues="${table}"/></feComponentTransfer>`
  );
  let color = "tone";
  if (material === "regular") {
    parts.push(`<feColorMatrix in="tone" type="saturate" values="${spec.tone[3]}" result="color"/>`);
    color = "color";
  }
  if (tint) {
    const body = material === "regular" ? 0.78 : 0.68;
    const rest = 1 - body;
    parts.push(
      `<feColorMatrix in="${color}" type="saturate" values="0" result="luminance"/>`,
      `<feComponentTransfer in="luminance" result="tinted">`,
      `<feFuncR type="linear" slope="${tint[0] * rest}" intercept="${tint[0] * body}"/>`,
      `<feFuncG type="linear" slope="${tint[1] * rest}" intercept="${tint[1] * body}"/>`,
      `<feFuncB type="linear" slope="${tint[2] * rest}" intercept="${tint[2] * body}"/>`,
      `<feFuncA type="linear" slope="${rest}" intercept="${body}"/>`,
      `</feComponentTransfer>`
    );
    color = "tinted";
  }
  parts.push(`<feComposite in="${color}" in2="field" operator="in"/>`);
  return parts.join("");
}

// --------------------------------------------------------------------------
// Interaction & Spring Physics
// --------------------------------------------------------------------------

const claimed = new WeakSet();
const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

function disabled(element) {
  return element.matches(":disabled, [data-disabled], [aria-disabled='true']");
}

export function attachInteraction(element, motionFn = () => "full") {
  const view = element.ownerDocument.defaultView || window;
  const saved = { translate: element.style.translate || "", scale: element.style.scale || "" };
  const tx = new Spring(0, springs.track);
  const ty = new Spring(0, springs.track);
  const press = new Spring(0, springs.press);
  const glow = new Spring(0, springs.glow);
  let pointer = null;
  let keyboard = false, hovering = false, previous = 0, written = false;
  let glowX = 0, glowY = 0;
  let raf = 0, awake = false;

  const writeStyle = (name, value) => {
    if (element.style.getPropertyValue(name) !== value) element.style.setProperty(name, value);
  };
  const size = () => ({ width: element.offsetWidth || 1, height: element.offsetHeight || 1 });
  const layout = () => {
    const rect = element.getBoundingClientRect();
    const { width, height } = size();
    return {
      cx: rect.left + rect.width / 2 - tx.value,
      cy: rect.top + rect.height / 2 - ty.value,
      width, height, rect,
    };
  };
  const light = (x, y) => {
    const { rect, width, height } = layout();
    glowX = ((x - rect.left) * width) / (rect.width || 1);
    glowY = ((y - rect.top) * height) / (rect.height || 1);
  };
  const set = (spring, target, options) => {
    spring.configure(options).target = target;
  };

  function move(event) {
    if (!pointer || event.pointerId !== pointer.id) return;
    pointer.clientX = event.clientX;
    pointer.clientY = event.clientY;
  }
  function release(event) {
    if (event && (!pointer || event.pointerId !== pointer.id)) return;
    pointer = null;
    view.removeEventListener("pointermove", move);
    view.removeEventListener("pointerup", release);
    view.removeEventListener("pointercancel", release);
    set(press, 0, springs.release);
    set(tx, 0, springs.release);
    set(ty, 0, springs.release);
    set(glow, hovering ? 0.35 : 0, springs.glow);
  }
  function down(event) {
    if (claimed.has(event) || event.button !== 0 || disabled(element)) return;
    claimed.add(event);
    const { cx, cy } = layout();
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, cx, cy, clientX: event.clientX, clientY: event.clientY };
    light(event.clientX, event.clientY);
    set(press, 1, springs.press);
    set(glow, 1, springs.press);
    const { width, height } = size();
    const follow = { duration: springs.track.duration + 0.0005 * Math.max(width, height), bounce: 0 };
    set(tx, 0, follow);
    set(ty, 0, follow);
    view.addEventListener("pointermove", move);
    view.addEventListener("pointerup", release);
    view.addEventListener("pointercancel", release);
  }
  function hover(event) {
    if (event.pointerType === "touch" || !view.matchMedia(HOVER_QUERY).matches) return;
    hovering = event.type !== "pointerleave";
    if (hovering) light(event.clientX, event.clientY);
    if (!pointer && !keyboard) set(glow, hovering ? 0.35 : 0, springs.glow);
  }
  function key(event) {
    if (event.key !== " " && event.key !== "Enter") return;
    if (event.type === "keydown") {
      if (event.repeat || claimed.has(event) || disabled(element) || pointer) return;
      claimed.add(event);
      keyboard = true;
      const { width, height } = size();
      glowX = width / 2;
      glowY = height / 2;
      set(press, 1, springs.press);
      set(glow, 1, springs.press);
    } else if (keyboard) {
      keyboard = false;
      set(press, 0, springs.release);
      set(glow, hovering ? 0.35 : 0, springs.glow);
    }
  }
  function drag(event) {
    if (!pointer) return;
    const origin = event.target;
    const source = origin?.nodeType === 1 ? origin : origin?.parentElement;
    if (!source?.closest?.('[draggable="true"]')) event.preventDefault();
  }
  const blur = () => {
    if (keyboard) {
      keyboard = false;
      set(press, 0, springs.release);
      set(glow, 0, springs.glow);
    }
  };

  function frame(now) {
    const dt = previous ? Math.max(0, (now - previous) / 1000) : 1 / 60;
    previous = now;
    const level = motionFn();
    const { width, height } = size();
    if (pointer) {
      const { cx, cy } = layout();
      const small = Math.max(width, height) <= 72;
      const ox = small
        ? pointer.clientX - pointer.x - (cx - pointer.cx)
        : pointer.clientX - Math.max(cx - width / 2, Math.min(cx + width / 2, pointer.clientX));
      const oy = small
        ? pointer.clientY - pointer.y - (cy - pointer.cy)
        : pointer.clientY - Math.max(cy - height / 2, Math.min(cy + height / 2, pointer.clientY));
      const limit = small
        ? 4 + 0.15 * Math.max(width, height)
        : Math.min(10, 3 + 0.04 * Math.max(width, height));
      tx.target = rubberBand(ox, limit);
      ty.target = rubberBand(oy, limit);
      light(pointer.clientX, pointer.clientY);
    }
    for (const spring of [tx, ty, press, glow]) spring.step(dt);
    const elastic = level === "full";
    const grow = elastic ? Math.min(0.16, 8 / Math.max(width, height)) * press.value : 0;
    const cap = Math.max(width, height) <= 72 ? 0.2 : 0.12;
    const ex = elastic ? Math.min(cap, 0.5 * Math.abs(tx.value) / width + 0.00007 * Math.abs(tx.velocity)) : 0;
    const ey = elastic ? Math.min(cap, 0.5 * Math.abs(ty.value) / height + 0.00007 * Math.abs(ty.velocity)) : 0;
    const sx = ((1 + grow) * (1 + ex)) / Math.sqrt(1 + ey);
    const sy = ((1 + grow) * (1 + ey)) / Math.sqrt(1 + ex);
    const moved = elastic && (Math.abs(tx.value) > 0.01 || Math.abs(ty.value) > 0.01);
    const scaled = Math.abs(sx - 1) > 1e-4 || Math.abs(sy - 1) > 1e-4;
    const lit = glow.value > 0.001;
    if (moved || scaled || lit || pointer || keyboard) {
      written = true;
      writeStyle("translate", moved ? `${tx.value.toFixed(3)}px ${ty.value.toFixed(3)}px` : saved.translate);
      writeStyle("scale", scaled ? `${sx.toFixed(5)} ${sy.toFixed(5)}` : saved.scale);
      writeStyle("--lg-glow", lit ? glow.value.toFixed(4) : "0");
      writeStyle("--lg-glow-x", `${glowX.toFixed(2)}px`);
      writeStyle("--lg-glow-y", `${glowY.toFixed(2)}px`);
      writeStyle("--lg-glow-size", `${Math.max(36, Math.min(180, Math.max(width, height) * 0.9)).toFixed(1)}px`);
      if (pointer || keyboard) {
        if (element.dataset.glassPressed !== "") element.dataset.glassPressed = "";
      } else if (element.dataset.glassPressed !== undefined) delete element.dataset.glassPressed;
    } else if (written) {
      written = false;
      element.style.translate = saved.translate;
      element.style.scale = saved.scale;
      for (const name of ["--lg-glow", "--lg-glow-x", "--lg-glow-y", "--lg-glow-size"])
        element.style.removeProperty(name);
      delete element.dataset.glassPressed;
    }
    const active = Boolean(pointer) || [tx, ty, press, glow].some((s) => !s.settled);
    if (!active) previous = 0;
    return active;
  }

  const loop = (now) => {
    const active = frame(now);
    if (active) raf = view.requestAnimationFrame(loop);
    else awake = false;
  };
  const wake = () => {
    if (!awake) {
      awake = true;
      raf = view.requestAnimationFrame(loop);
    }
  };

  element.addEventListener("pointerdown", down);
  element.addEventListener("dragstart", drag);
  element.addEventListener("pointerenter", hover);
  element.addEventListener("pointermove", hover);
  element.addEventListener("pointerleave", hover);
  element.addEventListener("keydown", key);
  element.addEventListener("keyup", key);
  element.addEventListener("focusout", blur);
  element.addEventListener("pointerdown", wake);
  element.addEventListener("pointerenter", wake);
  element.addEventListener("keydown", wake);

  return {
    dispose() {
      release();
      view.cancelAnimationFrame(raf);
      awake = false;
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("dragstart", drag);
      element.removeEventListener("pointerenter", hover);
      element.removeEventListener("pointermove", hover);
      element.removeEventListener("pointerleave", hover);
      element.removeEventListener("keydown", key);
      element.removeEventListener("keyup", key);
      element.removeEventListener("focusout", blur);
      element.removeEventListener("pointerdown", wake);
      element.removeEventListener("pointerenter", wake);
      element.removeEventListener("keydown", wake);
      element.style.translate = saved.translate;
      element.style.scale = saved.scale;
      for (const name of ["--lg-glow", "--lg-glow-x", "--lg-glow-y", "--lg-glow-size"])
        element.style.removeProperty(name);
      delete element.dataset.glassPressed;
    },
  };
}

// --------------------------------------------------------------------------
// Core Liquid Glass Applicator
// --------------------------------------------------------------------------

export function applyLiquidGlass(element, options = {}) {
  if (!element || element._liquidGlassInstance) return element._liquidGlassInstance;

  const {
    material = "clear",
    appearance = "dark",
    refraction = 18,
    bezel,
    blur = 1,
    saturation = 1.25,
    brightness = 1.05,
    dispersion = 0.08,
    fallbackBlur = 12,
    mode: requestedMode = "auto",
    interactive = true,
    motion = "full",
    tint = undefined,
  } = options;

  element.classList.add("liquid-glass");
  element.dataset.liquidGlass = "";
  element.dataset.material = material;
  element.dataset.appearance = appearance;

  const computedPos = window.getComputedStyle(element).position;
  if (!computedPos || computedPos === "static") {
    element.style.position = "relative";
  }

  // Create sub-layers: Lens (refraction), Overlay (specular rim), Glow (pointer light)
  let lens = element.querySelector(":scope > .lg-lens");
  if (!lens) {
    lens = document.createElement("span");
    lens.className = "lg-lens";
    lens.setAttribute("aria-hidden", "true");
    element.insertBefore(lens, element.firstChild);
  }

  let overlay = element.querySelector(":scope > .lg-overlay");
  if (!overlay) {
    overlay = document.createElement("span");
    overlay.className = "lg-overlay";
    overlay.setAttribute("aria-hidden", "true");
    element.insertBefore(overlay, lens.nextSibling);
  }

  let glow = element.querySelector(":scope > .lg-glow");
  if (!glow && interactive) {
    glow = document.createElement("span");
    glow.className = "lg-glow";
    glow.setAttribute("aria-hidden", "true");
    element.insertBefore(glow, overlay.nextSibling);
  }

  const dark = appearance === "dark";
  const tintRGB = tintChannels(tint);
  const activeMode = requestedMode === "auto" ? detectMode() : requestedMode;
  const engine = detectEngine();
  let heldFilter = null;
  let raf = 0;

  const build = (w, h, radius) => {
    const bz = Math.round(bezel ?? Math.min(32, Math.min(w, h) / 2));
    const planes = { bezel: bz, dark, tint: tintRGB };
    const outline = squircleOutline(w, h, radius);
    const overlayImg = overlayURL(w, h, radius, planes);

    overlay.style.backgroundImage = `url(${overlayImg})`;
    lens.style.clipPath = outline.polygon;

    if (activeMode !== "refract") {
      if (heldFilter) {
        releaseFilter(heldFilter);
        heldFilter = null;
      }
      const engineBlur = engine === "webkit" ? Math.min(fallbackBlur, 16) : fallbackBlur;
      const cssTone = `saturate(${saturation}) brightness(${dark ? brightness * 0.88 : brightness})`;
      const backdrop = `blur(${engineBlur}px) ${cssTone}`;
      lens.style.backdropFilter = backdrop;
      lens.style.webkitBackdropFilter = backdrop;
      return;
    }

    const field = fieldURL(w, h, radius, planes);
    const nested = Boolean(element.parentElement?.closest?.("[data-liquid-glass]"));
    const amount = refraction ?? (nested ? 8 : 18);
    const filterId = `lgf${w}x${h}r${radius}b${bz}f${Math.round(amount * 10)}${appearance === "dark" ? "d" : "l"}${material === "regular" ? "R" : "C"}${tint || ""}p${Math.round(dispersion * 100)}${nested ? "n" : ""}`.replace(/[^a-zA-Z0-9-]/g, "");

    if (field) {
      const markup = filterMarkup({
        w, h, field, material, appearance, refraction: amount, dispersion, tint: tintRGB, nested,
      });
      if (heldFilter && heldFilter !== filterId) releaseFilter(heldFilter);
      acquireFilter(filterId, markup);
      heldFilter = filterId;

      const backdrop = `url(#${filterId})${blur > 0 ? ` blur(${blur}px)` : ""}`;
      lens.style.backdropFilter = backdrop;
      lens.style.webkitBackdropFilter = backdrop;
    } else if (heldFilter) {
      releaseFilter(heldFilter);
      heldFilter = null;
    }
  };

  const measure = () => {
    raf = 0;
    const w = Math.round(element.offsetWidth);
    const h = Math.round(element.offsetHeight);
    if (w < 2 || h < 2) return;
    const radius = Math.round(resolveRadius(window.getComputedStyle(element).borderTopLeftRadius, w, h));
    build(w, h, radius);
  };

  const observer = new ResizeObserver(() => {
    if (!raf) raf = requestAnimationFrame(measure);
  });
  measure();
  observer.observe(element);

  let interaction = null;
  if (interactive) {
    interaction = attachInteraction(element, () => resolveMotion(motion));
  }

  const instance = {
    element,
    measure,
    destroy() {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
      if (heldFilter) releaseFilter(heldFilter);
      if (interaction) interaction.dispose();
      lens.remove();
      overlay.remove();
      if (glow) glow.remove();
      delete element._liquidGlassInstance;
    },
  };

  element._liquidGlassInstance = instance;
  return instance;
}

/**
 * Initializes Liquid Glass on all buttons and interactive controls across mir.ai
 */
export function initLiquidGlass(selector = ".hud-btn, .btn-apply, .btn-ghost, .btn-go, .btn-snap-now, .cat-pill, .catalog-add-btn, .btn-resume-idle, .btn-thumb-flip, .credit-watchdog-pill, .btn-remove-preview") {
  const applyAll = () => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      // Don't double wrap
      if (el._liquidGlassInstance) return;
      applyLiquidGlass(el, {
        appearance: "dark",
        refraction: 16,
        dispersion: 0.08,
        interactive: true,
      });
    });
  };

  // Initial apply
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyAll);
  } else {
    applyAll();
  }

  // Observe for dynamically created elements (dialogs, pills, drawers)
  const observer = new MutationObserver((mutations) => {
    let shouldRun = false;
    for (const m of mutations) {
      if (m.addedNodes.length > 0) {
        shouldRun = true;
        break;
      }
    }
    if (shouldRun) {
      applyAll();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}
