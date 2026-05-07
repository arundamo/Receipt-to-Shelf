import { NextResponse } from "next/server";

import { appendReceiptItem } from "@/lib/googleSheets";

export async function POST(request: Request) {
  const body = await request.json();
  const itemName = String(body.itemName ?? "").trim();
  const location = String(body.location ?? "").trim();
  const tabName = String(body.tabName ?? "Inventory").trim();

  if (!itemName || !location || !tabName) {
    return NextResponse.json(
      { error: "itemName, location, and tabName are required" },
      { status: 400 },
    );
  }

  try {
    await appendReceiptItem(tabName, itemName, location);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to append receipt item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
