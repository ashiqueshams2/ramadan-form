import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'রমজান তথ্য ফর্ম',
  description: 'রেস্টুরেন্টের রমজান পরিকল্পনার তথ্য সংগ্রহের ফর্ম'
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
