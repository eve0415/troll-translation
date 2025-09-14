import type { FC } from 'react';

import { debounce } from '@tanstack/pacer';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Lightweight image wrapper that reserves space and shows a
// loading skeleton to prevent layout shift while the image loads.
const ImageWithSkeleton: FC<{ src?: string; alt: string }> = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className='relative w-full overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5'
      style={{ aspectRatio: '1200 / 630' }}
      aria-busy={!loaded}
      aria-live='polite'
    >
      {/* Image (fades in when loaded) */}
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          loading='lazy'
          decoding='async'
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
      ) : null}

      {/* Skeleton / spinner overlay while loading or before src is ready */}
      {!loaded && (
        <div className='absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100'>
          <div className='absolute inset-0 animate-pulse bg-gradient-to-br from-gray-50 via-white to-gray-100 opacity-50' />
          <div className='relative z-10 flex flex-col items-center gap-4 text-gray-700'>
            <div className='relative'>
              <div className='h-12 w-12 animate-spin rounded-full border-4 border-gray-200' />
              <div className='absolute top-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-blue-500' />
            </div>
            <span className='font-medium text-gray-600 text-sm'>Generating your meme…</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface MemeSearch {
  says?: string;
  hear?: string;
}

const RouteComponent: FC = () => {
  const navigate = useNavigate();

  const search = Route.useSearch();
  const [leftText, setLeftText] = useState(search.says ?? 'Hola');
  const [rightText, setRightText] = useState(search.hear ?? 'Hello');
  const [previewSrc, setPreviewSrc] = useState('');

  // Debounced navigation function
  const debouncedNavigate = useMemo(
    () =>
      debounce(
        (says: string, hear: string) => {
          navigate({
            to: '/',
            search: { says, hear },
            replace: true,
          }).catch(() => {
            // Ignore navigation errors
          });
        },
        { wait: 500 },
      ),
    [navigate],
  );

  // Update URL when text changes
  useEffect(() => {
    debouncedNavigate(leftText, rightText);
  }, [leftText, rightText, debouncedNavigate]);

  // Helper to build the exact OGP URL used both for preview and download
  const buildOgpUrl = useCallback((left: string, right: string) => {
    const v = encodeURIComponent(`${left}|${right}`);
    const leftParam = String(left ?? '');
    const rightParam = String(right ?? '');
    return `/api/ogp?says=${encodeURIComponent(leftParam)}&hear=${encodeURIComponent(rightParam)}&format=png&v=${v}`;
  }, []);

  // Debounced preview update function
  const debouncedPreviewUpdate = useMemo(
    () =>
      debounce(
        (left: string, right: string) => {
          setPreviewSrc(buildOgpUrl(left, right));
        },
        { wait: 150 },
      ),
    [buildOgpUrl],
  );

  // Use OGP endpoint for preview to ensure perfect match
  useEffect(() => {
    debouncedPreviewUpdate(leftText, rightText);
  }, [leftText, rightText, debouncedPreviewUpdate]);

  // Generate and download image (higher fidelity)
  const downloadImage = useCallback(async () => {
    try {
      const response = await fetch(buildOgpUrl(leftText, rightText), {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `troll-translation-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Could add toast notification here
    }
  }, [leftText, rightText, buildOgpUrl]);

  // Share on X (Twitter)
  const shareOnX = useCallback(() => {
    const url = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white font-inter'>
      {/* Navigation */}
      <nav className='sticky top-0 z-10 flex items-center justify-between border-gray-200/50 border-b bg-white/80 px-6 py-4 backdrop-blur-md'>
        <div className='flex items-center space-x-2'>
          <span className='font-semibold text-gray-900'>Troll Translation</span>
        </div>
        <a
          href='https://github.com/eve0415/troll-translation'
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center space-x-2 text-gray-600 transition-colors hover:text-gray-900'
          aria-label='View source code on GitHub'
        >
          <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
            <title>GitHub</title>
            <path
              fillRule='evenodd'
              d='M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z'
              clipRule='evenodd'
            />
          </svg>
          <span className='font-medium text-sm'>GitHub</span>
        </a>
      </nav>

      {/* Hero Section */}
      <section className='px-6 py-16 text-center'>
        <div className='mx-auto max-w-4xl'>
          <h1 className='mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text font-bold text-5xl text-transparent leading-tight sm:text-6xl'>
            Troll Translation
          </h1>
          <p className='mx-auto mb-8 max-w-2xl text-gray-600 text-xl leading-relaxed'>
            Create hilarious memes in the style of Live Translation. Transform what people say into what you hear.
          </p>
          <div className='mb-12 flex items-center justify-center space-x-1 text-gray-500 text-xs'>
            <span>Not affiliated with Apple Inc.</span>
            <span>•</span>
            <span>Made for entertainment purposes</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className='mx-auto max-w-5xl px-6 pb-20'>
        {/* Input Controls */}
        <div className='mx-auto mb-16 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2'>
          <div className='space-y-4'>
            <label htmlFor='left-text' className='block text-center font-medium text-gray-700 text-sm'>
              Someone says
            </label>
            <div className='relative'>
              <textarea
                id='left-text'
                value={leftText}
                onChange={e => {
                  setLeftText(e.target.value);
                }}
                className='min-h-[100px] w-full resize-none rounded-2xl border-0 bg-white/70 px-6 py-4 text-right font-medium text-lg shadow-lg ring-1 ring-black/5 backdrop-blur-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                placeholder='What they actually said...'
                rows={4}
                style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
              />
            </div>
          </div>
          <div className='space-y-4'>
            <label htmlFor='right-text' className='block text-center font-medium text-gray-700 text-sm'>
              You hear
            </label>
            <div className='relative'>
              <textarea
                id='right-text'
                value={rightText}
                onChange={e => {
                  setRightText(e.target.value);
                }}
                className='min-h-[100px] w-full resize-none rounded-2xl border-0 bg-white/70 px-6 py-4 text-left font-medium text-lg shadow-lg ring-1 ring-black/5 backdrop-blur-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
                placeholder='What you thought you heard...'
                rows={4}
                style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
              />
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className='mb-12'>
          <div className='mb-8 text-center'>
            <h2 className='mb-2 font-semibold text-2xl text-gray-900'>Preview</h2>
            <p className='text-gray-600'>Your meme will appear here</p>
          </div>
          <div className='flex justify-center'>
            <div className='relative w-full max-w-3xl'>
              <ImageWithSkeleton src={previewSrc} alt='Meme preview showing translation from left text to right text' />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='mx-auto flex max-w-md flex-col items-center justify-center gap-4 sm:flex-row'>
          <button
            type='button'
            onClick={() => {
              downloadImage().catch(console.error);
            }}
            className='flex w-full transform items-center justify-center space-x-2 rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto'
          >
            <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <title>Download</title>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
            <span>Download Image</span>
          </button>
          <button
            type='button'
            onClick={shareOnX}
            className='flex w-full transform items-center justify-center space-x-2 rounded-2xl border border-gray-200 bg-white px-8 py-4 font-semibold text-gray-700 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:w-auto'
          >
            <svg width='20' height='20' viewBox='0 0 1200 1227' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <title>X</title>
              <path
                d='M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z'
                fill='black'
              />
            </svg>

            <span>Share on X</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className='border-gray-200/50 border-t bg-white/50 px-6 py-12 text-center backdrop-blur-sm'>
        <div className='mx-auto max-w-4xl'>
          <div className='space-y-2 text-gray-600 text-sm'>
            <p className='font-medium'>This project is not affiliated with Apple Inc.</p>
            <p>Created for entertainment purposes only. Apple and Live Translation are trademarks of Apple Inc.</p>
          </div>
          <div className='mt-6 flex items-center justify-center space-x-4 text-gray-500 text-xs'>
            <span>© 2025 Troll Translation</span>
            <span>•</span>
            <a href='https://github.com/eve0415/troll-translation' className='transition-colors hover:text-gray-700'>
              Open Source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const Route = createFileRoute('/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): MemeSearch => {
    return {
      says: typeof search.says === 'string' ? search.says : undefined,
      hear: typeof search.hear === 'string' ? search.hear : undefined,
    };
  },
  loaderDeps({ search }) {
    return search;
  },
  head: ({ match }) => {
    const og = `/api/ogp?says=${encodeURIComponent(match.search.says ?? '')}&hear=${encodeURIComponent(match.search.hear ?? '')}`;
    return {
      meta: [
        { name: 'title', content: 'Troll Translation' },
        { name: 'description', content: 'Live Translation meme generator' },
        { property: 'og:title', content: 'Troll Translation' },
        { property: 'og:description', content: 'Live Translation meme generator' },
        { property: 'og:image', content: og },
        { name: 'twitter:title', content: 'Troll Translation' },
        { name: 'twitter:description', content: 'Live Translation meme generator' },
        { name: 'twitter:image', content: og },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
    };
  },
});
