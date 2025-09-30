"use client";

import { useId } from "react";
import { useFormStatus } from "react-dom";
import { importCsv } from "@/app/(dashboard)/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-sky-950 shadow hover:bg-sky-400 disabled:opacity-60"
    >
      {pending ? "Importing..." : "Import CSV"}
    </button>
  );
}

export function ImportCsvForm() {
  const inputId = useId();
  const fileId = `${inputId}-file`;

  return (
    <form
      action={importCsv}
      encType="multipart/form-data"
      className="flex w-full flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow"
    >
      <div>
        <h2 className="text-base font-semibold text-slate-100">Import CSV</h2>
        <p className="text-sm text-slate-500">Upload a CSV file to automatically create a spreadsheet and worksheet.</p>
      </div>
      <label className="text-sm font-medium text-slate-300" htmlFor={inputId}>
        Spreadsheet name
      </label>
      <input
        id={inputId}
        type="text"
        name="name"
        placeholder="Inventory snapshot"
        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
      />
      <label className="text-sm font-medium text-slate-300" htmlFor={fileId}>
        CSV file
      </label>
      <input
        id={fileId}
        type="file"
        name="file"
        accept=".csv"
        required
        className="w-full rounded-lg border border-dashed border-slate-700 bg-slate-950 px-3 py-6 text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-slate-200"
      />
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
