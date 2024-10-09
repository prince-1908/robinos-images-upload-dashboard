// src/app/layout.tsx
"use client";

import { SessionProvider } from 'next-auth/react';
import SessionHeader from './SessionHeader';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <html>
        <body>
          <div>
            <SessionHeader />
            <main>{children}</main>
          </div>
        </body>
      </html>
    </SessionProvider>
  );
}
