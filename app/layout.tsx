import type { Metadata } from "next";
import "./globals.css";
import { CommandPaletteProvider } from "@/components/dashboard/command-palette";

export const metadata: Metadata = {
  title: "Sheets Dashboard",
  description: "Manage spreadsheets with Supabase-backed storage"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CommandPaletteProvider>{children}</CommandPaletteProvider>
      </body>
    </html>
  );
}
