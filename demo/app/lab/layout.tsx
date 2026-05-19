import Link from 'next/link';

export default function LabLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <nav
        aria-label="Lab-navigation"
        className="rounded-xl bg-edc-blue/5 border border-edc-blue/20 px-4 py-3 text-sm flex items-center justify-between flex-wrap gap-2"
      >
        <div className="flex items-center gap-3 text-edc-blue">
          <span className="font-semibold">🧪 Workshop Lab</span>
          <span className="text-slate-400">·</span>
          <Link href="/lab" className="hover:underline">
            Alle deltagere
          </Link>
        </div>
        <Link
          href="/"
          className="text-slate-500 hover:text-edc-blue text-xs"
        >
          ← Tilbage til bolig-demo
        </Link>
      </nav>
      {children}
    </div>
  );
}
