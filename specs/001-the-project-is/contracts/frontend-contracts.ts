/**
 * Frontend Contract Definitions
 * Type-safe interfaces for meme generator functionality
 */

// =============================================================================
// Core Data Contracts
// =============================================================================

export interface MemeContent {
  leftText: string;
  rightText: string;
  version: number;
}

export interface ImageConfig {
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

export interface GradientConfig {
  startColor: string;
  middleColor: string;
  endColor: string;
  direction: 'horizontal' | 'vertical';
}

export interface SilhouetteConfig {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
}

export interface DownloadableImage {
  blob: Blob;
  filename: string;
  width: number;
  height: number;
  mimeType: string;
}

// =============================================================================
// Component Props Contracts
// =============================================================================

export interface MemeGeneratorProps {
  initialContent?: Partial<MemeContent>;
  onContentChange?: (content: MemeContent) => void;
  onDownloadRequest?: (image: DownloadableImage) => void;
  onShareRequest?: (content: MemeContent) => void;
}

export interface TextInputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  'aria-label'?: string;
  'data-testid'?: string;
}

export interface MemePreviewProps {
  content: MemeContent;
  config: ImageConfig;
  onRenderComplete?: (canvas: HTMLCanvasElement) => void;
  onRenderError?: (error: Error) => void;
}

export interface ActionButtonsProps {
  onDownload: () => void;
  onShare: () => void;
  disabled?: boolean;
  'data-testid'?: string;
}

// =============================================================================
// Service Contracts
// =============================================================================

export interface MemeGeneratorService {
  generateImage(content: MemeContent, config: ImageConfig): Promise<DownloadableImage>;
  renderToCanvas(content: MemeContent, config: ImageConfig, canvas: HTMLCanvasElement): Promise<void>;
  validateContent(content: Partial<MemeContent>): MemeContentValidationResult;
}

export interface URLService {
  generateShareableLink(content: MemeContent): string;
  parseContentFromURL(url: string): MemeContent | null;
  generateOGImageURL(content: MemeContent): string;
}

export interface ShareService {
  shareToX(content: MemeContent, imageBlob: Blob): Promise<void>;
  generateShareText(content: MemeContent): string;
  copyLinkToClipboard(url: string): Promise<boolean>;
}

export interface DownloadService {
  downloadImage(image: DownloadableImage): Promise<void>;
  generateFilename(content: MemeContent): string;
  createBlobFromCanvas(canvas: HTMLCanvasElement): Promise<Blob>;
}

// =============================================================================
// Validation Contracts
// =============================================================================

export interface MemeContentValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: keyof MemeContent;
  code: string;
  message: string;
  value?: unknown;
}

export interface ValidationWarning {
  field: keyof MemeContent;
  code: string;
  message: string;
  suggestion?: string;
}

// =============================================================================
// Hook Contracts
// =============================================================================

export interface UseMemeGeneratorReturn {
  content: MemeContent;
  setContent: (content: Partial<MemeContent>) => void;
  config: ImageConfig;
  isGenerating: boolean;
  error: Error | null;
  download: () => Promise<void>;
  share: () => Promise<void>;
  reset: () => void;
}

export interface UseURLSyncReturn {
  content: MemeContent;
  updateURL: (content: MemeContent) => void;
  isURLValid: boolean;
}

export interface UseCanvasRenderReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  render: (content: MemeContent) => Promise<void>;
  isRendering: boolean;
  renderError: Error | null;
  lastRenderTime: number | null;
}

// =============================================================================
// Error Handling Contracts
// =============================================================================

export interface MemeGeneratorError extends Error {
  code: string;
  context?: Record<string, unknown>;
  recoverable: boolean;
}

export type MemeGeneratorErrorCode =
  | 'CANVAS_RENDER_FAILED'
  | 'FONT_LOAD_FAILED'
  | 'INVALID_CONTENT'
  | 'DOWNLOAD_FAILED'
  | 'SHARE_FAILED'
  | 'URL_PARSE_FAILED';

// =============================================================================
// Event Contracts
// =============================================================================

export interface MemeGeneratorEvents {
  contentChanged: (content: MemeContent) => void;
  imageGenerated: (image: DownloadableImage) => void;
  downloadStarted: () => void;
  downloadCompleted: (success: boolean) => void;
  shareStarted: () => void;
  shareCompleted: (success: boolean) => void;
  errorOccurred: (error: MemeGeneratorError) => void;
}

// =============================================================================
// Configuration Contracts
// =============================================================================

export interface DefaultConfiguration {
  imageConfig: ImageConfig;
  validationRules: {
    maxTextLength: number;
    allowedCharacters: RegExp;
    maxURLLength: number;
  };
  performance: {
    debounceDelay: number;
    maxRenderTime: number;
    cacheSize: number;
  };
  sharing: {
    baseURL: string;
    ogImagePath: string;
    twitterHandle?: string;
  };
}

// =============================================================================
// Test Contracts
// =============================================================================

export interface MemeGeneratorTestUtils {
  createMockContent: (overrides?: Partial<MemeContent>) => MemeContent;
  createMockConfig: (overrides?: Partial<ImageConfig>) => ImageConfig;
  createMockCanvas: () => HTMLCanvasElement;
  simulateUserInput: (text: string, delay?: number) => Promise<void>;
  waitForRender: (canvas: HTMLCanvasElement) => Promise<void>;
}

export interface RenderTestResult {
  success: boolean;
  renderTime: number;
  imageDataURL?: string;
  error?: Error;
}

// =============================================================================
// Default Values
// =============================================================================

export const DEFAULT_MEME_CONTENT: MemeContent = {
  leftText: '',
  rightText: '',
  version: 1,
};

export const DEFAULT_IMAGE_CONFIG: ImageConfig = {
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  leftTextColor: '#000000',
  rightTextGradient: {
    startColor: '#8B5CF6',
    middleColor: '#EC4899', 
    endColor: '#EF4444',
    direction: 'horizontal',
  },
  silhouetteConfig: {
    centerX: 50,
    centerY: 50,
    width: 120,
    height: 80,
    color: '#6B7280',
    opacity: 0.8,
  },
  fontFamily: 'Inter',
  fontSize: 32,
  padding: 60,
};