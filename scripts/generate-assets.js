#!/usr/bin/env node
// Generates assets/icon.png (1024x1024) and assets/splash.png (1284x2778) for
// the FANSTAMP brand mark — the same rounded double-border, red-ink, -8deg
// tilted stamp used for the in-app header logo (see logoStamp in styles.js),
// rendered here at full resolution with the `canvas` package since we can't
// produce binary PNGs directly.
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

generateIcon();
generateSplash();
