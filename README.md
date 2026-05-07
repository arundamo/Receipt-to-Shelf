# Receipt-to-Shelf

A simple Next.js app with a **Receipt Scanner** flow and **Google Sheets** backend.

## Features

- Upload a receipt image and run a **mock OCR** parser that returns line items.
- Match each line item to a storage location with a searchable dropdown input.
- Confirm each item to append it to a Google Sheet tab.
- Search saved items by **Item Name** and view **Current Location**.

## Google Sheets setup

1. Create (or choose) a Google Sheet.
2. Create a tab (for example: `Inventory`) with these header columns in row 1:
   - `Item Name`
   - `Current Location`
   - `Receipt Source`
3. In Google Cloud Console, create a **Service Account**.
4. Create and download a JSON key for that service account.
5. Share the Google Sheet with the service account email (Editor access).
6. Add environment variables in `.env.local`:

```bash
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> Keep the quotes around `GOOGLE_PRIVATE_KEY` so `\n` line breaks are preserved.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## API and helper functions

- `lib/googleSheets.ts`
  - `searchItemLocations(tabName, query)` reads a specific tab and returns item/location matches.
  - `appendReceiptItem(tabName, itemName, currentLocation)` appends a new row.
- `app/api/receipt/lookup/route.ts` item lookup endpoint used by the receipt UI.
- `app/api/receipt/append/route.ts` append endpoint used when confirming a matched item.
- `app/api/sheet/search/route.ts` search endpoint used by the simple React search component.
