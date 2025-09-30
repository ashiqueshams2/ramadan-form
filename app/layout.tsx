import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Ramadan Form App',
  description: 'Starter Next.js App Router project with Tailwind CSS and shadcn/ui.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>{children}</body>
    </html>
  );
}
