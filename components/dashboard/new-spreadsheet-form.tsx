"use client";

import { useFormStatus } from "react-dom";
import { createSpreadsheet } from "@/app/(dashboard)/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 shadow hover:bg-emerald-400 disabled:opacity-60"
    >
      {pending ? "Creating..." : "Create"}
    </button>
  );
}

export function NewSpreadsheetForm() {
  return (
    <form
      action={createSpreadsheet}
      className="flex w-full flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow"
    >
      <div>
        <h2 className="text-base font-semibold text-slate-100">New sheet</h2>
        <p className="text-sm text-slate-500">Create a blank spreadsheet record to start adding worksheets.</p>
      </div>
      <label className="text-sm font-medium text-slate-300">
        Name
        <input
          type="text"
          name="name"
          placeholder="Quarterly report"
          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
        />
      </label>
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
