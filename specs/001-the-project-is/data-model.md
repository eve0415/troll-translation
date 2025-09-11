# Data Model: Apple Live Translation Meme Generator

**Date**: 2025-09-11  
**Phase**: 1 - Data Design  
**Status**: Complete

## Core Entities

### MemeContent
The primary data structure representing user-generated meme content.

**Fields**:
- `leftText: string` - Text displayed on left side in black
- `rightText: string` - Text displayed on right side with gradient
- `version: number` - URL schema version for backward compatibility

**Validation Rules**:
- leftText: 0-100 characters, Unicode support, HTML-escaped
- rightText: 0-100 characters, Unicode support, HTML-escaped  
- version: positive integer, defaults to 1

**State Transitions**:
- Created → Rendered (when Canvas draws content)
- Rendered → Downloading (when user clicks download)
- Rendered → Sharing (when user clicks share button)

### ImageConfig  
Configuration for generated image styling and layout.

**Fields**:
- `width: number` - Canvas width in pixels (default: 800)
- `height: number` - Canvas height in pixels (default: 600)  
- `backgroundColor: string` - Background color (default: "#ffffff")
- `leftTextColor: string` - Left text color (default: "#000000")
- `rightTextGradient: GradientConfig` - Right text gradient settings
- `silhouetteConfig: SilhouetteConfig` - Earbud shape configuration
- `fontFamily: string` - Font family name (default: "Inter")
- `fontSize: number` - Base font size (default: 32)
- `padding: number` - Canvas padding (default: 60)

**Relationships**:
- One-to-one with MemeContent
- Immutable after creation (no runtime config changes)

### GradientConfig
Gradient configuration for right-side text styling.

**Fields**:
- `startColor: string` - Gradient start color (default: "#8B5CF6") 
- `middleColor: string` - Gradient middle color (default: "#EC4899")
- `endColor: string` - Gradient end color (default: "#EF4444")
- `direction: 'horizontal' | 'vertical'` - Gradient direction (default: horizontal)

### SilhouetteConfig  
Earbud silhouette shape and positioning.

**Fields**:
- `centerX: number` - Horizontal center position (percentage)
- `centerY: number` - Vertical center position (percentage) 
- `width: number` - Silhouette width (default: 120px)
- `height: number` - Silhouette height (default: 80px)
- `color: string` - Silhouette fill color (default: "#6B7280")
- `opacity: number` - Silhouette opacity (default: 0.8)

### ShareableLink
URL structure for meme sharing and Open Graph generation.

**Fields**:
- `baseUrl: string` - Domain and path
- `leftText: string` - URL-encoded left text
- `rightText: string` - URL-encoded right text  
- `version: number` - URL schema version
- `timestamp: number` - Creation timestamp for cache busting

**Methods**:
- `toString(): string` - Generate full URL
- `fromUrl(url: string): ShareableLink` - Parse URL into components
- `toOGImageUrl(): string` - Generate OG image endpoint URL

### DownloadableImage
Generated image file ready for download.

**Fields**:
- `blob: Blob` - Image data as PNG blob
- `filename: string` - Suggested filename (meme-YYYY-MM-DD-HHmm.png)
- `width: number` - Image width in pixels
- `height: number` - Image height in pixels
- `mimeType: string` - MIME type (image/png)

## Type Definitions

```typescript
interface MemeContent {
  leftText: string;
  rightText: string;
  version: number;
}

interface ImageConfig {
  width: number;
  height: number;
  backgroundColor: string;
  leftTextColor: string;
  rightTextGradient: GradientConfig;
  silhouetteConfig: SilhouetteConfig;
  fontFamily: string;
  fontSize: number;
  padding: number;
}

interface GradientConfig {
  startColor: string;
  middleColor: string;
  endColor: string;
  direction: 'horizontal' | 'vertical';
}

interface SilhouetteConfig {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
}

interface ShareableLink {
  baseUrl: string;
  leftText: string;
  rightText: string;
  version: number;
  timestamp: number;
}

interface DownloadableImage {
  blob: Blob;
  filename: string;
  width: number;
  height: number;
  mimeType: string;
}
```

## Validation Schema

### Input Validation
- Text length: Maximum 100 characters per field
- Character encoding: UTF-8 with HTML entity escaping
- Special characters: Allowed but sanitized for URL encoding
- Empty fields: Permitted (graceful degradation)

### URL Parameter Validation  
- Query parameter names: `left`, `right`, `v`
- URL encoding: Standard percent-encoding for special characters
- Maximum URL length: 2048 characters (browser compatibility)
- Version validation: Positive integers only

### Image Generation Validation
- Canvas dimensions: 400x300 minimum, 1600x1200 maximum
- Font size: 16px minimum, 64px maximum (responsive scaling)
- Text overflow: Automatic font size reduction or text wrapping
- Color validation: Valid hex colors or CSS color names

## Error Handling

### Client-Side Errors
- Invalid text input → sanitize and proceed
- Canvas rendering failure → show error state with retry
- Font loading failure → fallback to system fonts
- Download failure → show error message with manual save option

### Server-Side Errors  
- OG image generation failure → return default placeholder image
- Invalid URL parameters → redirect to clean URL with defaults
- Rate limiting → return 429 with retry-after header
- Font loading error → fallback to system fonts

## Performance Considerations

### Memory Management
- Canvas context reuse across renders
- Blob cleanup after download
- Gradient object caching
- Font metrics caching

### Caching Strategy
- Static assets: Long-term CDN caching
- Generated images: Short-term edge caching (5 minutes)
- Font files: Persistent browser caching  
- URL parameter state: No caching (always fresh)

## Security Considerations

### Input Sanitization
- XSS prevention: HTML entity encoding
- Injection prevention: Parameter validation
- Content filtering: No executable code in text fields
- Length limits: Prevent DoS via large inputs

### Rate Limiting
- Image generation: 10 requests per minute per IP
- Download requests: 5 downloads per minute per IP
- OG image generation: 60 requests per hour per unique URL
- Share requests: No rate limiting (client-side only)