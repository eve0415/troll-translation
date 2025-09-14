import { initWasm, Resvg } from '@resvg/resvg-wasm';
// WASM bytes provided by Vite at build time, decoded at runtime
// @ts-expect-error
import wasmBytes from '@resvg/resvg-wasm/index_bg.wasm?wasm64';
import { createServerFileRoute } from '@tanstack/react-start/server';

// Inline the earbud image, too, so the renderer never needs external fetches.
import { AIRPOD_PNG_BASE64 } from '../../assets/airpodBase64';

// Precomputed constants and module-level caches (persist across requests per isolate)
const EARBUD_DATA_HREF = `data:image/png;base64,${AIRPOD_PNG_BASE64}`;
let wasmInitPromise: Promise<unknown> | null = null;
let interFontPromise: Promise<Uint8Array | null> | null = null;

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

async function getInterFont(): Promise<Uint8Array | null> {
  interFontPromise ??= downloadInter();
  return interFontPromise;
}

const esc = (s: string) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const normalizeLines = (text: string) =>
  (text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/(?:\\|\u00A5)n/gi, '\n')
    .split('\n')
    .slice(0, 3);
// Rough text width estimation: treat spaces narrower than letters so
// leading/trailing spaces don't unfairly shrink the font size.
const approxWidth = (text: string, fs: number) => {
  const s = text || '';
  let sum = 0;
  for (const ch of s) {
    // space and thin punctuation narrower
    if (ch === ' ') sum += fs * 0.28;
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

    // Try to download Inter font, but don't rely on it exclusively
    const interFont = await getInterFont();

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

    // Dynamic font sizing
    const baseFont = Math.round(WIDTH * 0.21); // 2× larger (~252 at 1200px)
    const minFont = 12;
    const lineHeight = (fs: number) => fs * 1.15;
    const fitFontForLines = (lines: string[], maxWidth: number, maxHeight: number) => {
      let lo = minFont;
      let hi = baseFont;
      const fits = (fs: number) => {
        const longest = Math.max(1, ...lines.map(l => approxWidth(l, fs)));
        const totalH = lineHeight(fs) * Math.max(1, lines.length);
        return longest <= maxWidth && totalH <= maxHeight;
      };
      if (fits(hi)) return hi;
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (fits(mid)) lo = mid + 1;
        else hi = mid;
      }
      return Math.max(minFont, lo - 1);
    };

    const leftLines = normalizeLines(says);
    const rightLines = normalizeLines(hear);
    const maxLaneHeight = HEIGHT * 0.8;
    const leftFs = fitFontForLines(leftLines.length ? leftLines : [''], leftAvail, maxLaneHeight);
    const rightFs = fitFontForLines(rightLines.length ? rightLines : [''], rightAvail, maxLaneHeight);
    const leftLH = lineHeight(leftFs);
    const rightLH = lineHeight(rightFs);
    const leftStartY = centerY - ((Math.max(1, leftLines.length) - 1) * leftLH) / 2;
    const rightStartY = centerY - ((Math.max(1, rightLines.length) - 1) * rightLH) / 2;

    // Use a more robust font fallback chain for SVG
    const fontFallback = "system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
    const fontFamily = interFont ? `Inter, ${fontFallback}` : fontFallback;

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

    const resvg = new Resvg(svg, {
      background: 'white',
      fitTo: { mode: 'original' },
      font: {
        ...(interFont ? { fontBuffers: [interFont] } : {}),
        defaultFontFamily: interFont ? 'Inter' : 'system-ui',
        sansSerifFamily: interFont ? 'Inter' : 'system-ui',
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
