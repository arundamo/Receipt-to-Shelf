import { NextResponse } from "next/server";

import { searchItemLocations } from "@/lib/googleSheets";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tabName = searchParams.get("tabName") ?? "Inventory";
  const itemName = searchParams.get("itemName") ?? "";

  try {
    const results = await searchItemLocations(tabName, itemName);
    return NextResponse.json({ results });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to search sheet";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
