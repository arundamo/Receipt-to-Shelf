import { NextResponse } from "next/server";

import { searchItemLocations } from "@/lib/googleSheets";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tabName = searchParams.get("tabName") ?? "Inventory";
  const itemName = searchParams.get("itemName") ?? "";

  try {
    const matches = await searchItemLocations(tabName, itemName);
    return NextResponse.json({ matches });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to search locations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
