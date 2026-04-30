import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'EDC Workshop Demo — Boligsøgning',
  description: 'Demo-projekt til EDC × Claude Code workshop.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <body className="min-h-screen">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <footer className="text-center text-sm text-slate-500 py-8">
          EDC × Claude Code workshop · demo-projekt — kun til workshop-brug
        </footer>
      </body>
    </html>
  );
}
