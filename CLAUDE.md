# Claude Code Context: Apple Live Translation Meme Generator

## Project Overview

A web-based meme generator that creates parody images in the style of Apple's Live Translation feature demonstrations. Built with TanStack Start, React, TypeScript, and Tailwind CSS, deployed on Cloudflare Workers.

## Technology Stack

**Frontend**: TanStack Start (React SSR), TypeScript, Tailwind CSS  
**Backend**: Cloudflare Workers edge functions  
**Build**: Rolldown-Vite, Node.js 18+  
**Image Generation**: Canvas API (client), Satori (server OG images)  
**Testing**: Vitest, TanStack Start testing utilities  
**Deployment**: Cloudflare Workers + Pages

## Key Architecture Decisions

1. **Stateless Design**: URL parameters store meme state, no database
2. **Library-First**: Core functionality as reusable libraries with CLI
3. **Edge-First**: Real-time generation in browser, OG images at edge
4. **Test-Driven**: Contract tests before implementation, RED-GREEN-Refactor

## Core Libraries

### `meme-generator`
Canvas-based image generation with Apple styling
- CLI: `image-gen --text-left="Hi" --text-right="Salut" --output=image.png`
- Purpose: Generate meme images from text input with exact Apple styling

### `text-processor` 
Input validation and formatting utilities
- CLI: `text-process --validate --max-length=100 --input="Hello World"`
- Purpose: Sanitize and validate user text input

### `share-utils`
X integration and permalink generation
- CLI: `share-gen --left="Hi" --right="Salut" --base-url="https://example.com"`
- Purpose: Generate shareable URLs and social media integrations

## File Structure

```
/
├── src/
│   ├── components/          # React components
│   ├── lib/                # Core libraries
│   ├── pages/              # TanStack Start routes
│   └── services/           # Business logic services
├── functions/              # Cloudflare Workers functions
├── tests/
│   ├── contract/           # API contract tests
│   ├── integration/        # End-to-end tests  
│   └── unit/              # Library unit tests
└── specs/001-the-project-is/  # Feature specification
```

## Development Commands

```bash
npm run dev                 # Start development server
npm test                   # Run all tests
npm run test:contract      # Run contract tests only
npm run build             # Production build
npm run deploy:staging    # Deploy to CF Workers staging
npm run lint              # ESLint + TypeScript checks
```

## Testing Strategy

**Order**: Contract → Integration → E2E → Unit (TDD enforced)  
**Tools**: Vitest for logic, real browser for Canvas API testing  
**Coverage**: All libraries must have CLI + integration tests  
**Environment**: Cloudflare Workers local dev with Wrangler

## Key Technical Constraints

- **Legal**: No Apple trademarks, license-safe fonts only (Inter font family)
- **Performance**: <100ms image generation, real-time preview updates
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation
- **Browser Support**: Chrome 120+, Firefox 115+, Safari 16+, Mobile
- **Bundle Size**: Optimized for Cloudflare Workers limits

## Implementation Patterns

### Component Structure
```typescript
interface MemeGeneratorProps {
  initialContent?: Partial<MemeContent>;
  onContentChange?: (content: MemeContent) => void;
}

const MemeGenerator: React.FC<MemeGeneratorProps> = ({ ... }) => {
  // Real-time preview with Canvas API
  // URL sync for shareable state
  // Error boundaries for graceful degradation
};
```

### Library Interface
```typescript
// Each library exports CLI + programmatic API
export interface MemeGeneratorService {
  generateImage(content: MemeContent, config: ImageConfig): Promise<DownloadableImage>;
  renderToCanvas(content: MemeContent, config: ImageConfig, canvas: HTMLCanvasElement): Promise<void>;
}
```

### Error Handling
```typescript
interface MemeGeneratorError extends Error {
  code: MemeGeneratorErrorCode;
  context?: Record<string, unknown>;
  recoverable: boolean;
}
```

## Recent Changes

### 2025-09-11: Initial feature specification and planning
- Created comprehensive spec with 13 functional requirements
- Established TanStack Start + Cloudflare Workers architecture  
- Defined library-first approach with CLI interfaces
- Set up TDD workflow with contract-first testing

### Next: Implementation phase (/tasks command)
- Generate specific implementation tasks from Phase 1 design
- Create contract tests that fail before implementation
- Follow RED-GREEN-Refactor cycle strictly

## Useful Context

**Apple Live Translation Style**: Centered earbud silhouette, black text left, gradient text right (purple→pink→red), white background, generous spacing, clean typography

**Viral Sharing Features**: Real-time preview, one-click download, X share button, automatic OG image generation, permalink encoding in URL

**Constitutional Compliance**: Library-first architecture, CLI per library, test-driven development, no implementation before failing tests

---

*Generated from specs/001-the-project-is/plan.md - Updated 2025-09-11*