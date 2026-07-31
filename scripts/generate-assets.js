#!/usr/bin/env node
// Generates assets/icon.png (1024x1024), assets/splash.png (1284x2778), and
// assets/parchment.png (1284x2778) — the FANSTAMP brand mark (a rounded
// double-border, red-ink, -8deg tilted stamp matching logoStamp in
// styles.js) and the retro-mode aged-paper background texture, all rendered
// procedurally with the `canvas` package since we can't produce binary PNGs
// directly. The parchment texture is generated rather than sourced from a
// photo so there's no stock-image licensing to track.
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const RED = '#CC0000';
const DARK_BG = '#1a1a2e';

function drawStamp(ctx, cx, cy, scale) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-8 * Math.PI) / 180);

  const w = 640 * scale;
  const h = 208 * scale;
  const outerBorder = 10 * scale;
  const outerRadius = 24 * scale;
  const inset = 20 * scale;
  const innerBorder = 6 * scale;
  const innerRadius = 12 * scale;

  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, outerRadius);
  ctx.fillStyle = 'rgba(204, 0, 0, 0.10)';
  ctx.fill();
  ctx.lineWidth = outerBorder;
  ctx.strokeStyle = RED;
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(-w / 2 + inset, -h / 2 + inset, w - inset * 2, h - inset * 2, innerRadius);
  ctx.lineWidth = innerBorder;
  ctx.strokeStyle = RED;
  ctx.stroke();

  // "FANSTAMP" text, manually letter-spaced — node-canvas has no ctx.letterSpacing.
  const text = 'FANSTAMP';
  const fontSize = 72 * scale;
  const spacing = 10 * scale;
  ctx.font = `800 ${fontSize}px sans-serif`;
  ctx.fillStyle = RED;
  ctx.textBaseline = 'middle';

  const widths = [...text].map((ch) => ctx.measureText(ch).width);
  const totalWidth = widths.reduce((a, b) => a + b, 0) + spacing * (text.length - 1);
  let x = -totalWidth / 2;
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], x, fontSize * 0.03);
    x += widths[i] + spacing;
  }

  ctx.restore();
}

function writePng(canvas, filename) {
  const out = path.join(__dirname, '..', 'assets', filename);
  fs.writeFileSync(out, canvas.toBuffer('image/png'));
  console.log('Wrote', out);
}

function generateIcon() {
  const size = 1024;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = DARK_BG;
  ctx.fillRect(0, 0, size, size);
  drawStamp(ctx, size / 2, size / 2, 1.05);
  writePng(canvas, 'icon.png');
}

function generateSplash() {
  const width = 1284;
  const height = 2778;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = DARK_BG;
  ctx.fillRect(0, 0, width, height);
  drawStamp(ctx, width / 2, height / 2, 1.35);
  writePng(canvas, 'splash.png');
}

function generateParchmentTexture() {
  const width = 1284;
  const height = 2778;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy);

  // Base wash — warm cream center fading to a deeper aged-brown edge. This
  // is a gentle gradient; the crisp edge darkening is a separate overlay
  // added at runtime (see parchmentVignette in styles.js) so the two don't
  // fight each other.
  const base = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
  base.addColorStop(0,    '#EFE3C4');
  base.addColorStop(0.55, '#E2D0A0');
  base.addColorStop(0.85, '#C7A56A');
  base.addColorStop(1,    '#9A7A46');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  // Soft stain blotches scattered across the sheet, darker and more frequent
  // toward the edges — mottled aged-paper look rather than a flat tint.
  for (let i = 0; i < 260; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / maxR; // 0 center, 1 edge
    const radius = 50 + Math.random() * 180;
    const opacity = 0.015 + dist * 0.09 * Math.random();
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(90, 60, 20, ${opacity})`);
    grad.addColorStop(1, 'rgba(90, 60, 20, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine grain — scattered light/dark 1px specks for paper fiber texture.
  for (let i = 0; i < 45000; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const light = Math.random() < 0.5;
    const alpha = Math.random() * 0.05;
    ctx.fillStyle = light ? `rgba(255, 250, 230, ${alpha})` : `rgba(60, 40, 10, ${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }

  writePng(canvas, 'parchment.png');
}

generateIcon();
generateSplash();
generateParchmentTexture();
