import { initWasm, Resvg } from '@resvg/resvg-wasm';
// WASM bytes provided by Vite at build time, decoded at runtime
// @ts-expect-error
import wasmBytes from '@resvg/resvg-wasm/index_bg.wasm';
import { createServerFileRoute } from '@tanstack/react-start/server';

// Inline the earbud image, too, so the renderer never needs external fetches.
import { AIRPOD_PNG_BASE64 } from '../../assets/airpodBase64';

// Precomputed constants and module-level caches (persist across requests per isolate)
const EARBUD_DATA_HREF = `data:image/png;base64,${AIRPOD_PNG_BASE64}`;
let wasmInitPromise: Promise<unknown> | null = null;
let interFontPromise: Promise<Uint8Array | null> | null = null;
let japaneseFontPromise: Promise<Uint8Array | null> | null = null;

function ensureWasmInitialized() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  wasmInitPromise ??= initWasm(wasmBytes).catch(() => null);
  return wasmInitPromise;
}

const WIDTH = 1200;
const HEIGHT = 630;

async function fetchArrayBuffer(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed: ${url}`);
  return new Uint8Array(await res.arrayBuffer());
}

async function downloadInter(): Promise<Uint8Array | null> {
  const candidates = ['https://rsms.me/inter/font-files/InterVariable.ttf', 'https://github.com/rsms/inter/releases/download/v4.1/InterVariable.ttf'];
  for (const u of candidates) {
    try {
      return await fetchArrayBuffer(u);
    } catch {}
  }
  return null;
}

async function downloadJapaneseFont(): Promise<Uint8Array | null> {
  // For Google Fonts, we need to get the actual TTF file URL
  try {
    // Try Google Fonts API first
    const googleFontsUrl = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600&display=swap';
    const cssRes = await fetch(googleFontsUrl);
    if (cssRes.ok) {
      const cssText = await cssRes.text();
      const ttfMatch = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.ttf)\)/.exec(cssText);
      if (ttfMatch?.[1]) {
        return await fetchArrayBuffer(ttfMatch[1]);
      }
    }
  } catch {}

  // Fallback to a known working Noto Sans JP URL
  try {
    return await fetchArrayBuffer('https://fonts.gstatic.com/s/notosansjp/v52/nwpBtLy2gfQ9L9mqZ-FRP7JdMZG7FA.ttf');
  } catch {}

  return null;
}

async function getInterFont(): Promise<Uint8Array | null> {
  interFontPromise ??= downloadInter();
  return interFontPromise;
}

async function getJapaneseFont(): Promise<Uint8Array | null> {
  japaneseFontPromise ??= downloadJapaneseFont();
  return japaneseFontPromise;
}

const esc = (s: string) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Wrap long text automatically, but respect explicit line breaks
const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
  if (!text) return [''];

  // First normalize line endings and explicit breaks
  const normalizedText = text.replace(/\r\n?/g, '\n').replace(/(?:\\|\u00A5)n/gi, '\n');

  const paragraphs = normalizedText.split('\n');
  const wrappedLines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      wrappedLines.push('');
      continue;
    }

    // If paragraph fits within maxWidth, keep it as is
    if (approxWidth(paragraph, fontSize) <= maxWidth) {
      wrappedLines.push(paragraph);
      continue;
    }

    // Otherwise, wrap the paragraph
    const words = paragraph.split(' ').filter(w => w.length > 0); // Simple word split
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;

      if (approxWidth(testLine, fontSize) <= maxWidth) {
        currentLine = testLine;
      } else if (currentLine) {
        wrappedLines.push(currentLine);
        currentLine = word;
      } else {
        // Single word too long, just add it anyway
        wrappedLines.push(word);
      }
    }

    if (currentLine) {
      wrappedLines.push(currentLine);
    }
  }

  return wrappedLines; // Don't limit lines here, let font fitting decide
};


// Check if text contains Japanese characters
const hasJapaneseChars = (text: string) => {
  // Japanese unicode ranges: Hiragana, Katakana, Kanji (CJK Unified Ideographs)
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
};

// Rough text width estimation: treat spaces narrower than letters so
// leading/trailing spaces don't unfairly shrink the font size.
const approxWidth = (text: string, fs: number) => {
  const s = text || '';
  let sum = 0;
  for (const ch of s) {
    // Check for Japanese characters first (CJK characters are typically wider)
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(ch)) {
      sum += fs * 1.0; // Full-width for Japanese characters
    }
    // space and thin punctuation narrower
    else if (ch === ' ') sum += fs * 0.28;
    else if (',.:;!|'.includes(ch)) sum += fs * 0.35;
    else if ('ilI\'"`'.includes(ch)) sum += fs * 0.4;
    else if ('MWmw@#'.includes(ch))
      sum += fs * 0.66; // wider glyphs
    else sum += fs * 0.56;
  }
  return Math.max(1, sum);
};

export const ServerRoute = createServerFileRoute('/api/ogp').methods(_api => ({
  GET: async ({ request }) => {
    await ensureWasmInitialized();

    const url = new URL(request.url);
    const says = url.searchParams.get('says') ?? 'Hola';
    const hear = url.searchParams.get('hear') ?? 'Hello';

    // Try to download Inter font and Japanese font, but don't rely on them exclusively
    const interFont = await getInterFont();
    const japaneseFont = await getJapaneseFont();

    // Check if we need Japanese font support
    const needsJapanese = hasJapaneseChars(says) || hasJapaneseChars(hear);

    // Match page preview layout
    const centerX = WIDTH / 2;
    const centerY = HEIGHT / 2;
    const earbudSize = Math.min(WIDTH, HEIGHT) * 0.625;
    const earbudX = centerX - earbudSize / 2;
    const earbudY = centerY - earbudSize / 2;
    const sidePad = 30; // smaller gap to allow larger text
    const laneMargin = 24; // reduce margins to widen lanes
    const leftStopX = centerX - earbudSize / 2 - sidePad;
    const rightStartX = centerX + earbudSize / 2 + sidePad;
    const leftAvail = Math.max(80, leftStopX - laneMargin);
    const rightAvail = Math.max(80, WIDTH - rightStartX - laneMargin);

    // Dynamic font sizing with text wrapping
    const baseFont = Math.min(120, Math.round(WIDTH * 0.1)); // More reasonable max size (~120px at 1200px)
    const minFont = 24;
    const lineHeight = (fs: number) => fs * 1.15;

    const fitFontAndWrap = (text: string, maxWidth: number, maxHeight: number) => {
      if (!text.trim()) return { fontSize: baseFont, lines: [''] };

      // Try font sizes from large to small
      for (let fs = baseFont; fs >= minFont; fs -= 2) {
        const lines = wrapText(text, maxWidth, fs);

        // Check if all constraints are met
        const fits = lines.every(line => approxWidth(line, fs) <= maxWidth);
        const totalHeight = lineHeight(fs) * lines.length;
        const heightFits = totalHeight <= maxHeight;

        if (fits && heightFits) {
          return { fontSize: fs, lines };
        }
      }

      // Fallback: use minimum font size and truncate to fit height
      const fallbackLines = wrapText(text, maxWidth, minFont);
      const maxLinesForHeight = Math.floor(maxHeight / lineHeight(minFont));
      const truncatedLines = fallbackLines.slice(0, Math.max(1, maxLinesForHeight));
      return { fontSize: minFont, lines: truncatedLines };
    };

    const maxLaneHeight = HEIGHT * 0.8;
    const leftResult = fitFontAndWrap(says || '', leftAvail, maxLaneHeight);
    const rightResult = fitFontAndWrap(hear || '', rightAvail, maxLaneHeight);

    const leftLines = leftResult.lines;
    const rightLines = rightResult.lines;
    const leftFs = leftResult.fontSize;
    const rightFs = rightResult.fontSize;
    const leftLH = lineHeight(leftFs);
    const rightLH = lineHeight(rightFs);
    const leftStartY = centerY - ((Math.max(1, leftLines.length) - 1) * leftLH) / 2;
    const rightStartY = centerY - ((Math.max(1, rightLines.length) - 1) * rightLH) / 2;

    // Use a more robust font fallback chain for SVG, including Japanese support
    const fontFallback = "system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif";
    let fontFamily = fontFallback;

    if (needsJapanese && japaneseFont) {
      fontFamily = `'Noto Sans JP', ${fontFamily}`;
    } else if (interFont) {
      fontFamily = `Inter, ${fontFamily}`;
    }

    const leftTexts = (leftLines.length ? leftLines : [''])
      .map(
        (line, i) =>
          `<text x="${leftStopX}" y="${leftStartY + i * leftLH}" text-anchor="end" font-size="${leftFs}" fill="#6B7280" font-family="${fontFamily}" font-weight="600" dominant-baseline="middle" xml:space="preserve" style="white-space:pre">${esc(line)}</text>`,
      )
      .join('');
    const rightTexts = (rightLines.length ? rightLines : [''])
      .map(
        (line, i) =>
          `<text x="${rightStartX}" y="${rightStartY + i * rightLH}" font-size="${rightFs}" fill="url(#grad)" font-family="${fontFamily}" font-weight="600" dominant-baseline="middle" xml:space="preserve" style="white-space:pre">${esc(line)}</text>`,
      )
      .join('');

    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">\n  <defs>\n    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">\n      <stop offset="0%" stop-color="#0E4BFF" />\n      <stop offset="55%" stop-color="#7C3AED" />\n      <stop offset="100%" stop-color="#FF2D55" />\n    </linearGradient>\n  </defs>\n  <rect width="100%" height="100%" fill="#ffffff"/>\n  <image href="${EARBUD_DATA_HREF}" x="${earbudX}" y="${earbudY}" width="${earbudSize}" height="${earbudSize}"/>\n  ${leftTexts}\n  ${rightTexts}\n</svg>`;

    // Prepare font buffers
    const fontBuffers = [];
    if (interFont) fontBuffers.push(interFont);
    if (japaneseFont) fontBuffers.push(japaneseFont);

    const resvg = new Resvg(svg, {
      background: 'white',
      fitTo: { mode: 'original' },
      font: {
        ...(fontBuffers.length > 0 ? { fontBuffers } : {}),
        defaultFontFamily: needsJapanese && japaneseFont ? 'Noto Sans JP' : interFont ? 'Inter' : 'system-ui',
        sansSerifFamily: needsJapanese && japaneseFont ? 'Noto Sans JP' : interFont ? 'Inter' : 'system-ui',
        serifFamily: 'serif',
        monospaceFamily: 'monospace',
        loadSystemFonts: true,
      },
    });
    const png = resvg.render().asPng();
    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  },
}));
