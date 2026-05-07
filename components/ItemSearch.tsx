"use client";

import { useEffect, useState } from "react";

type SearchResult = {
  itemName: string;
  currentLocation: string;
};

export function ItemSearch() {
  const [tabName, setTabName] = useState("Inventory");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      const params = new URLSearchParams({ itemName: trimmed, tabName });
      const response = await fetch(`/api/sheet/search?${params.toString()}`);

      if (!response.ok) {
        setResults([]);
        return;
      }

      const data = await response.json();
      setResults(data.results ?? []);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [query, tabName]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Item Location Search</h2>
      <p className="mt-1 text-sm text-slate-500">
        Search by item name and see the latest Current Location value.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          aria-label="Sheet tab name"
          value={tabName}
          onChange={(event) => setTabName(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Sheet tab name"
        />
        <input
          aria-label="Search item name"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Search item name"
        />
      </div>

      <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-slate-50">
        {results.map((result, index) => (
          <li
            key={index}
            className="grid grid-cols-2 gap-2 px-3 py-2 text-sm"
          >
            <span className="font-medium text-slate-800">{result.itemName}</span>
            <span className="text-slate-600">{result.currentLocation}</span>
          </li>
        ))}
        {results.length === 0 && query.trim() && (
          <li className="px-3 py-2 text-sm text-slate-500">No matching items found.</li>
        )}
      </ul>
    </section>
  );
}
