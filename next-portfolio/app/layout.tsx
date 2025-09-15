import './globals.css';
import type { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Md Akhinoor Islam - Engineering Portfolio',
  description: 'SOLIDWORKS, Arduino, CAD & engineering portfolio built with Next.js',
  openGraph: {
    title: 'Md Akhinoor Islam - Engineering Portfolio',
    description: 'SOLIDWORKS, Arduino, CAD & engineering portfolio built with Next.js',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
