import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import type { Spreadsheet, Worksheet } from "@/types/database";

export const dynamic = "force-dynamic";

async function getSpreadsheet(id: string) {
  const client = supabaseAdmin();
  const { data: spreadsheet, error } = await client
    .from("spreadsheets")
    .select("id, name, pinned, created_at, updated_at")
    .eq("id", id)
    .single<Spreadsheet>();

  if (error) {
    throw new Error(error.message);
  }

  if (!spreadsheet) {
    return null;
  }

  const { data: worksheets, error: worksheetsError } = await client
    .from("worksheets")
    .select("id, name, data, created_at")
    .eq("spreadsheet_id", id)
    .order("created_at", { ascending: true })
    .returns<Worksheet[]>();

  if (worksheetsError) {
    throw new Error(worksheetsError.message);
  }

  return {
    spreadsheet,
    worksheets: worksheets ?? []
  };
}

export default async function SpreadsheetDetailPage({
  params
}: {
  params: { id: string };
}) {
  const result = await getSpreadsheet(params.id);

  if (!result) {
    notFound();
  }

  const { spreadsheet, worksheets } = result;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">Spreadsheet</p>
          <h1 className="text-3xl font-semibold text-white">{spreadsheet.name}</h1>
          <p className="text-sm text-slate-500">
            Created {new Date(spreadsheet.created_at).toLocaleString()} • {spreadsheet.pinned ? "Pinned" : "Not pinned"}
          </p>
        </div>
        <a
          href="/dashboard"
          className="rounded-full border border-slate-800 px-4 py-2 text-sm text-slate-300 hover:border-slate-700 hover:text-white"
        >
          Back to dashboard
        </a>
      </div>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-100">Worksheets</h2>
        {worksheets.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-800 bg-slate-900 p-6 text-sm text-slate-500">
            No worksheets yet. Import a CSV file from the dashboard to create one.
          </p>
        ) : (
          <div className="space-y-6">
            {worksheets.map((worksheet) => {
              const rows = Array.isArray(worksheet.data) ? (worksheet.data as Record<string, unknown>[]) : [];
              const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

              return (
                <div key={worksheet.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                  <div className="border-b border-slate-800 px-4 py-3">
                    <h3 className="text-lg font-medium text-white">{worksheet.name}</h3>
                    <p className="text-xs text-slate-500">{rows.length} rows</p>
                  </div>
                  {rows.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-slate-500">No rows in this worksheet yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-800 text-sm">
                        <thead className="bg-slate-900">
                          <tr>
                            {headers.map((header) => (
                              <th
                                key={header}
                                className="px-4 py-2 text-left font-semibold uppercase tracking-wide text-slate-400"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="bg-slate-950/60">
                              {headers.map((header) => (
                                <td key={header} className="px-4 py-2 text-slate-200">
                                  {String(row[header] ?? "")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
