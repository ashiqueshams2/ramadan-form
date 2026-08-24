import { CommandPaletteRegister, CommandPaletteTrigger } from "@/components/dashboard/command-palette";
import { ImportCsvForm } from "@/components/dashboard/import-csv-form";
import { NewSpreadsheetForm } from "@/components/dashboard/new-spreadsheet-form";
import { SpreadsheetCard } from "@/components/dashboard/spreadsheet-card";
import { fetchSpreadsheets } from "../actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const spreadsheets = await fetchSpreadsheets();
  const pinned = spreadsheets.filter((sheet) => sheet.pinned);
  const others = spreadsheets.filter((sheet) => !sheet.pinned);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <CommandPaletteRegister spreadsheets={spreadsheets} />
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Spreadsheet dashboard</h1>
            <p className="text-sm text-slate-400">Manage Supabase-backed spreadsheets, import CSV data, and jump between workspaces.</p>
          </div>
          <div className="w-full max-w-xs">
            <CommandPaletteTrigger />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
          <NewSpreadsheetForm />
          <ImportCsvForm />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-100">Pinned</h2>
          <p className="text-xs uppercase tracking-wide text-slate-500">{pinned.length} pinned</p>
        </div>
        {pinned.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-800 bg-slate-900 p-6 text-sm text-slate-500">
            Pin important spreadsheets to keep them at the top of your workspace.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pinned.map((sheet) => (
              <SpreadsheetCard key={sheet.id} spreadsheet={sheet} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-100">All spreadsheets</h2>
          <p className="text-xs uppercase tracking-wide text-slate-500">{spreadsheets.length} total</p>
        </div>
        {others.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-800 bg-slate-900 p-6 text-sm text-slate-500">
            Create a new spreadsheet or import a CSV to populate your workspace.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((sheet) => (
              <SpreadsheetCard key={sheet.id} spreadsheet={sheet} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
