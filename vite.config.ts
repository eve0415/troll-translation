import type { Plugin } from 'vite';

import browserEcho from '@browser-echo/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import tsconfigPaths from 'vite-tsconfig-paths';

// Inline WASM as base64 for SSR so Cloudflare Workers don't need to fetch
// the .wasm file at runtime. Usage:
//   import wasmBytes from 'path/to/file.wasm?wasm64'
// Then pass `wasmBytes` (Uint8Array) to the library's init function.
function inlineWasmBase64(): Plugin {
  const VIRTUAL_PREFIX = '\0inline-wasm|';
  return {
    name: 'inline-wasm-base64',
    enforce: 'pre',
    async resolveId(id, importer) {
      if (/\.wasm\?(?:wasm64|base64)$/.test(id)) {
        const cleaned = id.replace(/\?(?:wasm64|base64)$/, '');
        const res = await this.resolve(cleaned, importer, { skipSelf: true });
        if (res?.id) return VIRTUAL_PREFIX + res.id;
      }
      return null;
    },
    async load(id, opts) {
      if (!id.startsWith(VIRTUAL_PREFIX)) return null;
      // SSR only. For client, let default handling apply.
      if (!opts?.ssr) return null;
      const realId = id.slice(VIRTUAL_PREFIX.length);
      const fs = await import('node:fs/promises');
      const buf = await fs.readFile(realId);
      const b64 = Buffer.from(buf).toString('base64');
      // Decode at runtime using atob (available in Workers) into Uint8Array
      const code = `const b64 = ${JSON.stringify(b64)};
const bin = atob(b64);
const bytes = new Uint8Array(bin.length);
for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
export default bytes;`;
      return code;
    },
  };
}

export default defineConfig({
  plugins: [
    inlineWasmBase64(),
    tsconfigPaths({ root: '.', configNames: ['tsconfig.cloudflare.json'] }),
    tailwindcss(),
    tanstackStart(),
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    cloudflare(),
    devtoolsJson(),
    browserEcho({
      injectHtml: false,
      stackMode: 'condensed',
    }),
  ],
  build: { cssMinify: 'lightningcss', minify: true },
});
