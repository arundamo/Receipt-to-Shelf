import { ItemSearch } from "@/components/ItemSearch";
import { ReceiptScanner } from "@/components/ReceiptScanner";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Receipt to Shelf</h1>
        <p className="mt-2 text-sm text-slate-600">
          Parse receipt items, match them to storage locations, and sync to Google
          Sheets.
        </p>
      </header>

      <ReceiptScanner />
      <ItemSearch />
    </main>
  );
}
