import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Receipt to Shelf",
  description: "Receipt scanner and shelf location matcher backed by Google Sheets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-100 text-slate-900">{children}</body>
    </html>
  );
}
