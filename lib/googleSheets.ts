import "server-only";

import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";

export type SheetLocationMatch = {
  itemName: string;
  currentLocation: string;
};

const ITEM_NAME_COLUMN = "Item Name";
const LOCATION_COLUMN = "Current Location";
const RECEIPT_SOURCE_COLUMN = "Receipt Source";

function normalizePrivateKey(value: string): string {
  const normalized = value.includes("\\n") ? value.replace(/\\n/g, "\n") : value;

  if (!normalized.includes("BEGIN PRIVATE KEY") || !normalized.includes("END PRIVATE KEY")) {
    throw new Error("GOOGLE_PRIVATE_KEY is not in a valid service-account key format");
  }

  return normalized;
}

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function getWorksheet(tabName: string) {
  const serviceAccountEmail = getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = normalizePrivateKey(getEnv("GOOGLE_PRIVATE_KEY"));
  const spreadsheetId = getEnv("GOOGLE_SHEET_ID");

  const auth = new JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(spreadsheetId, auth);
  await doc.loadInfo();

  const sheet = doc.sheetsByTitle[tabName];
  if (!sheet) {
    throw new Error(`Sheet tab not found: ${tabName}`);
  }

  await sheet.loadHeaderRow();

  return sheet;
}

export async function searchItemLocations(
  tabName: string,
  query: string,
): Promise<SheetLocationMatch[]> {
  const sheet = await getWorksheet(tabName);
  const trimmedQuery = query.trim().toLowerCase();

  if (!trimmedQuery) {
    return [];
  }

  const rows = await sheet.getRows();

  return rows
    .map((row) => ({
      itemName: String(row.get(ITEM_NAME_COLUMN) ?? ""),
      currentLocation: String(row.get(LOCATION_COLUMN) ?? ""),
    }))
    .filter(
      (row) =>
        row.itemName.toLowerCase().includes(trimmedQuery) ||
        row.currentLocation.toLowerCase().includes(trimmedQuery),
    )
    .slice(0, 10);
}

export async function appendReceiptItem(
  tabName: string,
  itemName: string,
  currentLocation: string,
) {
  const sheet = await getWorksheet(tabName);

  await sheet.addRow({
    [ITEM_NAME_COLUMN]: itemName,
    [LOCATION_COLUMN]: currentLocation,
    [RECEIPT_SOURCE_COLUMN]: "Receipt Scanner",
  });
}
