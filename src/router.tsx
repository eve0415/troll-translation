import { createRouter as createTanStackRouter } from '@tanstack/react-router';

import { routeTree } from './routeTree.gen';

export function createRouter() {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    // @ts-expect-error Virtual module
    import('virtual:browser-echo').catch(console.error);
  }

  return createTanStackRouter({
    routeTree,
    scrollRestoration: true,
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
