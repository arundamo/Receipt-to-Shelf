"use client";

import { useMemo, useState } from "react";

type ReceiptLineItem = {
  name: string;
  location: string;
  suggestions: string[];
  saving: boolean;
  saved: boolean;
  error: string;
};

const DEFAULT_LOCATIONS = [
  "Pantry",
  "Fridge",
  "Freezer",
  "Top Shelf",
  "Bottom Shelf",
  "Snack Drawer",
];

function checklistIconClasses(saved: boolean) {
  return saved
    ? "inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500 bg-emerald-100 text-xs text-emerald-700"
    : "inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-xs text-slate-500";
}

async function mockReceiptOcr(file: File): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const fromName = file.name
    .replace(/\.[^/.]+$/, "")
    .split(/[-_,]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 2)
    .slice(0, 5);

  if (fromName.length > 0) {
    return fromName;
  }

  return ["Milk", "Eggs", "Bread", "Bananas"];
}

export function ReceiptScanner() {
  const [tabName, setTabName] = useState("Inventory");
  const [processing, setProcessing] = useState(false);
  const [items, setItems] = useState<ReceiptLineItem[]>([]);

  const hasItems = useMemo(() => items.length > 0, [items]);

  async function lookupLocations(itemName: string): Promise<string[]> {
    const params = new URLSearchParams({ itemName, tabName });
    const response = await fetch(`/api/receipt/lookup?${params.toString()}`);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const matches: { currentLocation: string }[] = data.matches ?? [];

    return Array.from(
      new Set([
        ...matches.map((match) => match.currentLocation).filter(Boolean),
        ...DEFAULT_LOCATIONS,
      ]),
    );
  }

  async function onUpload(file: File) {
    setProcessing(true);
    const extractedItems = await mockReceiptOcr(file);

    const nextItems = await Promise.all(
      extractedItems.map(async (name) => ({
        name,
        location: "",
        suggestions: await lookupLocations(name),
        saving: false,
        saved: false,
        error: "",
      })),
    );

    setItems(nextItems);
    setProcessing(false);
  }

  function updateLocation(index: number, location: string) {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, location } : item)),
    );
  }

  async function saveItem(index: number) {
    const target = items[index];
    if (!target || !target.location.trim()) {
      return;
    }

    setItems((current) =>
      current.map((item, i) =>
        i === index
          ? { ...item, saving: true, error: "" }
          : item,
      ),
    );

    const response = await fetch("/api/receipt/append", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemName: target.name,
        location: target.location,
        tabName,
      }),
    });

    setItems((current) =>
      current.map((item, i) => {
        if (i !== index) {
          return item;
        }

        if (!response.ok) {
          return {
            ...item,
            saving: false,
            error: "Unable to save item",
          };
        }

        return {
          ...item,
          saving: false,
          saved: true,
          error: "",
        };
      }),
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Receipt Scanner</h2>
      <p className="mt-1 text-sm text-slate-500">
        Upload a receipt image, match each item to a location, then confirm.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          aria-label="Sheet tab name"
          value={tabName}
          onChange={(event) => setTabName(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Sheet tab name"
        />
        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          Upload Receipt
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void onUpload(file);
              }
            }}
          />
        </label>
      </div>

      {processing && <p className="mt-3 text-sm text-slate-600">Running mock OCR…</p>}

      {hasItems && (
        <ul className="mt-5 space-y-3">
          {items.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className={checklistIconClasses(item.saved)}>
                  {item.saved ? "✓" : "○"}
                </span>
                <span className="font-medium text-slate-900">{item.name}</span>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  aria-label={`Location for ${item.name}`}
                  list={`locations-${index}`}
                  value={item.location}
                  onChange={(event) => updateLocation(index, event.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder="Search or type a location"
                />
                <datalist id={`locations-${index}`}>
                  {item.suggestions.map((location) => (
                    <option key={`${item.name}-${location}`} value={location} />
                  ))}
                </datalist>
                <button
                  type="button"
                  onClick={() => void saveItem(index)}
                  disabled={item.saving || item.saved || !item.location.trim()}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {item.saved ? "Saved" : item.saving ? "Saving..." : "Confirm"}
                </button>
              </div>

              {item.error && <p className="mt-2 text-xs text-red-600">{item.error}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
