/**
 * Piezas compartidas del mundo 3D: paleta, materiales tipo arcilla, formas redondeadas,
 * resortes y texturas dibujadas en canvas.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// La base es el monocromo cálido del sitio con el ámbar de la lámpara. Encima, unos pocos acentos
// apagados (terracota, salvia, azul, madera) para que los objetos tengan vida sin volverse un arcoíris.
export const C = {
  paper: 0xe9e5dc, cream: 0xd9d4c8, stone: 0xb1ada4, slate: 0x5b5b60, ink: 0x242427,
  amber: 0xf3b949, warm: 0xffdfa6, skin: 0xe6c3a2, hair: 0x6e5a4e, leaf: 0x7f927b, metal: 0xc9c9cd,
  terra: 0xc9714f, clayRed: 0xb4543f, sage: 0x8fa68a, moss: 0x5f7a5c, blue: 0x6f8fb5, denim: 0x45556c,
  blush: 0xe3a796, mustard: 0xd9a441, oak: 0xc29466, walnut: 0x7b5639, night: 0x9fb4ff,
};
// los acentos en orden: sirven para colorear series (teclas por categoría, escalones, lomos de libro)
export const ACCENTS = [C.terra, C.sage, C.blue, C.mustard, C.blush, C.moss];

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
// acercarse a un valor sin depender de los cuadros por segundo
export const damp = (a, b, rate, dt) => lerp(a, b, 1 - Math.exp(-rate * dt));

const clays = new Map();
/** Material mate, como arcilla. Sin opciones se comparte entre todas las piezas del mismo color. */
export function clay(color, options) {
  if (options) return new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...options });
  if (!clays.has(color)) clays.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0 }));
  return clays.get(color);
}

export const box = (w, h, d, r = 0.08, seg = 5) => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2));

export function mesh(geometry, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** Resorte amortiguado: `to` es adonde quiere ir, `x` donde está. */
export class Spring {
  constructor(x = 0, stiffness = 150, damping = 16) {
    this.x = this.to = x;
    this.v = 0;
    this.k = stiffness;
    this.c = damping;
  }

  step(dt) {
    this.v += ((this.to - this.x) * this.k - this.v * this.c) * dt;
    this.x += this.v * dt;
    return this.x;
  }
}

export function texture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext('2d');
  if (draw) draw(g, width, height);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  return Object.assign(map, { g });
}

/** Una imagen lista para dibujar en canvas. A los SVG sin medidas se les pone tamaño: si no, Firefox no los dibuja. */
export async function loadImage(src) {
  // de otro origen solo sirven los que mandan CORS: sin eso el canvas queda contaminado y no puede ser textura
  const { origin, hostname } = new URL(src, location.href);
  if (origin !== location.origin && !/(^|\.)(jsdelivr\.net|unpkg\.com|cloudflare\.com)$/.test(hostname)) throw new Error(`sin CORS: ${hostname}`);
  let url = src;
  if (/\.svg(\?|$)/i.test(src)) {
    const text = await (await fetch(src)).text();
    const sized = /<svg[^>]*\swidth=/.test(text) ? text : text.replace('<svg', '<svg width="256" height="256"');
    url = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml' }));
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  await img.decode();
  return img;
}

/** Dibuja la imagen cubriendo (o conteniendo) el rectángulo, sin deformarla. */
export function fit(g, img, x, y, w, h, contain = false) {
  const k = (contain ? Math.min : Math.max)(w / img.width, h / img.height);
  g.drawImage(img, x + (w - img.width * k) / 2, y + (contain ? (h - img.height * k) / 2 : 0), img.width * k, img.height * k);
}

/** Texto partido en líneas que entran en el ancho dado. Devuelve la y que sigue. */
export function wrap(g, text, x, y, width, lineHeight, maxLines = 3) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (g.measureText(next).width > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/.{2}$/, '…');
  }
  lines.forEach((l, i) => g.fillText(l, x, y + i * lineHeight));
  return y + lines.length * lineHeight;
}

const glowMap = texture(128, 128, (g) => {
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.4)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
});

/** Resplandor suave que siempre mira a la cámara. */
export function glow(size, color = C.warm) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.setScalar(size);
  return s;
}

export const fonts = {
  heading: '"Sora", "Inter", system-ui, sans-serif',
  body: '"Inter", system-ui, sans-serif',
};
