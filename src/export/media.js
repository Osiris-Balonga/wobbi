import { renderParts } from '../../packages/core/render.js';
import {
  sampleCharacter,
  applyCharacterFrame,
} from '../../packages/core/motion.js';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
export function svgNode(tag, props, ...children) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(props || {})) {
    if (key === 'key' || value == null) continue;
    if (key === 'style') {
      Object.assign(el.style, value);
      continue;
    }
    el.setAttribute(
      key === 'viewBox'
        ? key
        : key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()),
      String(value),
    );
  }
  children.flat(Infinity).forEach((child) => {
    if (child != null) el.append(child);
  });
  return el;
}
export function createSvg(
  config,
  state = 'idle',
  { size = 512, transparent = true, time = 0 } = {},
) {
  const svg = svgNode('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '-16 -16 288 288',
    width: size,
    height: size,
    role: 'img',
    'aria-label': config.accessibility.label,
  });
  if (!transparent)
    svg.append(
      svgNode('rect', {
        x: -16,
        y: -16,
        width: 288,
        height: 288,
        fill: config.background.color,
      }),
    );
  svg.append(renderParts(svgNode, config, state));
  applyCharacterFrame(svg, sampleCharacter(config, state, time), time);
  return new XMLSerializer().serializeToString(svg);
}
async function drawFrame(ctx, config, state, options) {
  const blob = new Blob([createSvg(config, state, options)], {
      type: 'image/svg+xml',
    }),
    url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    ctx.clearRect(0, 0, options.size, options.size);
    ctx.drawImage(image, 0, 0, options.size, options.size);
  } finally {
    URL.revokeObjectURL(url);
  }
}
export async function exportPng(config, state, options) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = options.size;
  await drawFrame(canvas.getContext('2d'), config, state, options);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error('Impossible de créer cette image.')),
      'image/png',
    ),
  );
}
function checkAbort(signal) {
  if (signal?.aborted) throw new DOMException('Export annulé', 'AbortError');
}

const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function indexGifFrame(source, width) {
  const rgba = new Uint8Array(source);
  const opaque = [];
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] < 128) {
      rgba[i] = 1;
      rgba[i + 1] = 255;
      rgba[i + 2] = 1;
    } else {
      opaque.push(rgba[i], rgba[i + 1], rgba[i + 2], 255);
      const pixel = i / 4;
      const dither =
        (BAYER_4[Math.floor(pixel / width) % 4][(pixel % width) % 4] - 7.5) *
        0.62;
      rgba[i] = Math.max(0, Math.min(255, rgba[i] + dither));
      rgba[i + 1] = Math.max(0, Math.min(255, rgba[i + 1] + dither));
      rgba[i + 2] = Math.max(0, Math.min(255, rgba[i + 2] + dither));
    }
    rgba[i + 3] = 255;
  }
  const palette = [
    [1, 255, 1],
    ...quantize(new Uint8Array(opaque), 255, { format: 'rgb565' }),
  ];
  return {
    indexed: applyPalette(rgba, palette, 'rgb565'),
    palette,
    transparentIndex: 0,
  };
}

export async function exportGif(config, state, options, onProgress, signal) {
  const size = options.size,
    frames = 54,
    canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true }),
    gif = GIFEncoder();
  for (let i = 0; i < frames; i++) {
    checkAbort(signal);
    await drawFrame(ctx, config, state, {
      ...options,
      transparent: options.transparent,
      time: i / 15,
    });
    const { data } = ctx.getImageData(0, 0, size, size);
    const { indexed, palette, transparentIndex } = indexGifFrame(data, size);
    gif.writeFrame(indexed, size, size, {
      palette,
      delay: 1000 / 15,
      repeat: 0,
      transparent: true,
      transparentIndex,
    });
    onProgress((i + 1) / frames);
    await new Promise((r) => setTimeout(r, 0));
  }
  checkAbort(signal);
  gif.finish();
  return new Blob([gif.bytes()], { type: 'image/gif' });
}
export function videoSupported() {
  return (
    typeof MediaRecorder !== 'undefined' &&
    MediaRecorder.isTypeSupported('video/webm') &&
    typeof HTMLCanvasElement.prototype.captureStream === 'function'
  );
}
export async function exportVideo(config, state, options, onProgress, signal) {
  if (!videoSupported())
    throw new Error(
      'Ce navigateur ne permet pas cet export vidéo. Choisissez GIF.',
    );
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = options.size;
  const ctx = canvas.getContext('2d');
  await drawFrame(ctx, config, state, {
    ...options,
    transparent: options.transparent,
    time: 0,
  });
  checkAbort(signal);
  const stream = canvas.captureStream(30),
    chunks = [];
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 6_000_000,
  });
  const completed = new Promise((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
    recorder.onerror = () => reject(new Error('L’encodage vidéo a échoué.'));
  });
  recorder.start();
  try {
    const start = performance.now();
    while (performance.now() - start < 3600) {
      checkAbort(signal);
      const time = (performance.now() - start) / 1000;
      await drawFrame(ctx, config, state, {
        ...options,
        transparent: options.transparent,
        time,
      });
      onProgress(Math.min(1, time / 3.6));
      await new Promise((r) => setTimeout(r, 16));
    }
    recorder.stop();
    const result = await completed;
    onProgress(1);
    return result;
  } catch (error) {
    if (recorder.state !== 'inactive') recorder.stop();
    await completed.catch(() => undefined);
    throw error;
  } finally {
    if (recorder.state !== 'inactive') recorder.stop();
    stream.getTracks().forEach((t) => t.stop());
  }
}
