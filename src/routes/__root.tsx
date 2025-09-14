import type { FC, PropsWithChildren } from 'react';

import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import rootCss from './__root.css?url';

const RootComponent: FC = () => {
  return (
    <RootLayout>
      <Outlet />
    </RootLayout>
  );
};

const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang='en'>
      <head>
        <HeadContent />
      </head>
      <body>
        <main>{children}</main>

        {import.meta.env.DEV && (
          <TanStackDevtools
            plugins={[
              {
                name: 'TanStack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        )}

        <Scripts />
      </body>
    </html>
  );
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
    ],
    links: [{ rel: 'stylesheet', href: rootCss }],
  }),
  component: RootComponent,
});
