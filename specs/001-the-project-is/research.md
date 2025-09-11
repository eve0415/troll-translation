# Research Findings: Apple Live Translation Meme Generator

**Date**: 2025-09-11  
**Phase**: 0 - Technical Research  
**Status**: Complete

## Technology Stack Decisions

### Frontend Framework: TanStack Start
**Decision**: TanStack Start with React SSR  
**Rationale**: 
- Native TypeScript support and type safety
- Server-side rendering for better SEO and Open Graph support
- File-based routing ideal for single-page application
- Built-in Vite integration for fast development
- Cloudflare Workers deployment support

**Alternatives considered**: 
- Next.js (heavier, more complex for simple use case)
- Remix (good option but TanStack Start has better CF Workers integration)
- Vanilla React SPA (lacks SSR needed for OG images)

### Build Tool: Rolldown-Vite  
**Decision**: Rolldown-Vite build pipeline  
**Rationale**: 
- Fast HMR for real-time development
- TypeScript compilation out of the box
- Tree-shaking for smaller bundles (important for CF Workers size limits)
- Native ES modules support

**Alternatives considered**: 
- Webpack (slower, more complex configuration)
- esbuild (fast but less ecosystem support)
- Parcel (good option but less control over output)

### Styling: Tailwind CSS
**Decision**: Tailwind CSS with custom color configuration  
**Rationale**: 
- Utility-first approach speeds development
- Custom gradient utilities for purple-to-red text effect
- Responsive design utilities for mobile support
- Small bundle size with purging
- Excellent accessibility utilities

**Alternatives considered**: 
- CSS Modules (more verbose for utility patterns)
- Styled Components (runtime overhead in edge functions)
- Plain CSS (maintenance burden for responsive design)

### Image Generation: HTML Canvas + Satori
**Decision**: Canvas API for frontend preview, Satori for server-side OG generation  
**Rationale**: 
- Canvas API provides real-time rendering in browser
- Satori generates static PNG images from React components
- Both support custom fonts and gradients
- Satori perfect for edge function image generation
- Consistent styling between preview and final output

**Alternatives considered**: 
- SVG rendering (limited gradient and font support)
- Server-only image generation (no real-time preview)
- Third-party image APIs (dependency, cost, latency concerns)

### Deployment: Cloudflare Workers
**Decision**: Cloudflare Workers with Pages integration  
**Rationale**: 
- Global edge deployment for low latency
- Built-in CDN for static assets
- Native support for dynamic OG image generation
- Cost-effective for viral traffic spikes
- WebAssembly support if needed for advanced image processing

**Alternatives considered**: 
- Vercel Edge Functions (good option, but CF has better pricing model)
- Netlify Functions (lacks edge deployment)
- Traditional VPS (higher latency, scaling complexity)

## Font and Legal Considerations

### License-Safe Fonts
**Decision**: Use Inter font family with fallbacks  
**Rationale**: 
- Open Font License compatible
- Excellent readability at various sizes
- Modern, clean appearance matching Apple aesthetic
- Available via Google Fonts CDN
- Good Unicode support for international text

**Legal Compliance**: 
- Avoid "AirPods" terminology (use "earbud silhouette")
- No Apple logos or trademarks
- Generic geometric shapes only
- Original color scheme implementation

## Performance and Accessibility

### Performance Strategy
**Decision**: Client-side Canvas for preview, edge generation for sharing  
**Rationale**: 
- Immediate visual feedback improves UX
- Edge-generated images ensure consistency across platforms
- Caching strategy: static assets at CDN, dynamic images short-term cache
- Bundle size optimization through code splitting

### Accessibility Implementation  
**Decision**: Full WCAG 2.1 AA compliance  
**Rationale**: 
- Alt text for all generated images
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Mobile-first responsive design

## Open Graph and Sharing Integration

### Dynamic OG Images
**Decision**: Cloudflare Workers function with Satori rendering  
**Rationale**: 
- URL-based parameters encode meme content
- Server-side rendering ensures consistent OG previews
- Edge caching reduces generation overhead
- Platform-agnostic image format (PNG)

### X (Twitter) Integration
**Decision**: Web Intent API with image attachment  
**Rationale**: 
- No API keys required for basic sharing
- User controls their own posting
- Pre-populated text with link
- Image attachment via blob URL

## State Management and URL Strategy

### State Persistence
**Decision**: URL query parameters for meme state  
**Rationale**: 
- Stateless application design
- Shareable URLs inherently contain content
- No database or session storage needed
- Deep linking support
- Browser back/forward compatibility

**URL Schema**: `/?left=Hello&right=Bonjour&v=1`

## Development and Testing Strategy

### Testing Approach
**Decision**: Contract-first TDD with real browser testing  
**Rationale**: 
- Canvas API testing requires real browser environment
- Image generation testing needs visual regression
- OG image testing requires HTTP requests
- Real Cloudflare Workers environment for integration tests

### Development Environment
**Decision**: Wrangler local development with Vitest  
**Rationale**: 
- Local CF Workers simulation
- Hot reload for rapid iteration
- Integrated testing environment
- Production parity

## Conclusion

All technical unknowns have been resolved. The technology stack provides a solid foundation for rapid development, global deployment, and viral scaling while maintaining legal compliance and accessibility standards.