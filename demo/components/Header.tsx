import Link from 'next/link';
import { Home } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-edc-blue text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Home size={24} />
          <span>EDC Demo</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-edc-warm">Boliger</Link>
          <a
            href="https://edc-x-claude-workshops.vercel.app/workshop"
            className="hover:text-edc-warm opacity-70"
          >
            ← Workshop
          </a>
        </nav>
      </div>
    </header>
  );
}
