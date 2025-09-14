# Apple Live Translation Meme Generator

A web-based meme generator that creates parody images in the style of [Apple](https://www.apple.com)'s Live Translation feature demonstrations.

⚠️ **Not affiliated with Apple Inc.** This is an unofficial parody project created for entertainment purposes only.

🌐 **[Visit the website here](https://troll-translation.eve0415.workers.dev/)**

## What it does

This project generates meme images that mimic Apple's Live Translation interface, featuring:
- Centered earbud silhouette design
- Black text on the left, gradient text (purple→pink→red) on the right
- Clean typography with generous spacing
- Real-time preview and one-click download
- Social media sharing with automatic OG image generation

## Main Libraries

- **[TanStack Start](https://tanstack.com/start)** - React SSR framework
- **[TanStack Router](https://tanstack.com/router)** - Type-safe routing
- **[TanStack Pacer](https://tanstack.com/pacer)** - Debouncing utilities
- **[React](https://react.dev)** - UI library
- **[TypeScript](https://www.typescriptlang.org)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[@resvg/resvg-wasm](https://github.com/yisibl/resvg-js)** - SVG to PNG conversion for image generation
- **[Vite](https://vitejs.dev)** (rolldown-vite) - Build tool and bundler
- **[Biome](https://biomejs.dev)** - Linting and formatting
- **[ESLint](https://eslint.org)** - Additional linting

## Deployment

This project is deployed on **[Cloudflare Workers](https://workers.cloudflare.com)** with edge functions for optimal performance worldwide.

## AI Development

99% of the code in the `src/` directory is written by [Claude](https://claude.ai) and [Codex](https://openai.com/index/openai-codex/) AI assistants.

This README is also written by Claude.

## Contributing

PRs are welcome! Please ensure you follow the test-driven development approach outlined in the project documentation.

## Development

```bash
pnpm run dev                 # Start development server
pnpm run build              # Production build
pnpm run lint               # ESLint + TypeScript checks
```

## Disclaimer

This project is not affiliated with [Apple Inc](https://www.apple.com/). in any way. Apple, Live Translation, and related trademarks are property of Apple Inc. This is a parody project created purely for fun and entertainment purposes.

The earbud asset used in this project is sourced from [Apple's AirPods Pro page](https://www.apple.com/airpods-pro/).

**No Liability**: The author takes no responsibility whatsoever for any issues, damages, or consequences that may arise from using this project or website. Use at your own risk.
