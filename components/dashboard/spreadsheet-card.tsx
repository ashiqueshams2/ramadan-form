"use client";

import { useTransition } from "react";
import { togglePinned } from "@/app/(dashboard)/actions";
import type { Spreadsheet } from "@/types/database";

interface SpreadsheetCardProps {
  spreadsheet: Spreadsheet;
}

export function SpreadsheetCard({ spreadsheet }: SpreadsheetCardProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Spreadsheet</p>
          <h3 className="text-lg font-semibold text-slate-50">{spreadsheet.name}</h3>
          <p className="text-xs text-slate-500">Updated {new Date(spreadsheet.updated_at ?? spreadsheet.created_at).toLocaleString()}</p>
        </div>
        <form
          action={(formData) =>
            startTransition(async () => {
              formData.set("id", spreadsheet.id);
              formData.set("pinned", String(spreadsheet.pinned));
              await togglePinned(formData);
            })
          }
        >
          <button
            type="submit"
            disabled={pending}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              spreadsheet.pinned
                ? "border-amber-400/60 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700/80"
            } ${pending ? "opacity-60" : ""}`}
          >
            {spreadsheet.pinned ? "Unpin" : "Pin"}
          </button>
        </form>
      </div>
    </div>
  );
}
