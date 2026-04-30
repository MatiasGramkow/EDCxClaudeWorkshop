'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
}

export default function SearchBar({ initialQuery = '', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(query.trim());
      }}
      className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-2 shadow-sm"
    >
      <Search size={18} className="text-slate-400 ml-2" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Søg på adresse, by eller postnummer…"
        className="flex-1 px-2 py-2 outline-none text-sm bg-transparent"
      />
      <button
        type="submit"
        className="bg-edc-accent text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
      >
        Søg
      </button>
    </form>
  );
}
