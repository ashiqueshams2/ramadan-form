"use server";

import { revalidatePath } from "next/cache";
import { parse } from "csv-parse/sync";
import { supabaseAdmin } from "@/lib/supabase";
import type { Spreadsheet } from "@/types/database";

export async function fetchSpreadsheets(): Promise<Spreadsheet[]> {
  const client = supabaseAdmin();
  const { data, error } = await client
    .from("spreadsheets")
    .select("id, name, pinned, created_at, updated_at")
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createSpreadsheet(formData: FormData) {
  const name = formData.get("name");
  const client = supabaseAdmin();
  const label = typeof name === "string" && name.trim().length > 0 ? name.trim() : "Untitled sheet";

  const { error } = await client.from("spreadsheets").insert({
    name: label
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}

export async function togglePinned(formData: FormData) {
  const id = formData.get("id");
  const pinned = formData.get("pinned") === "true";

  if (typeof id !== "string") {
    throw new Error("Invalid spreadsheet id");
  }

  const client = supabaseAdmin();
  const { error } = await client
    .from("spreadsheets")
    .update({ pinned: !pinned })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}

export async function importCsv(formData: FormData) {
  const name = formData.get("name");
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("A CSV file is required");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const text = buffer.toString("utf-8");
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true
  }) as Record<string, string>[];

  const client = supabaseAdmin();
  const label = typeof name === "string" && name.trim().length > 0 ? name.trim() : file.name.replace(/\.csv$/i, "");

  const { data, error } = await client
    .from("spreadsheets")
    .insert({ name: label })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Failed to create spreadsheet record");
  }

  if (records.length > 0) {
    const worksheetPayload = {
      spreadsheet_id: data.id,
      name: "Imported CSV",
      data: records
    };

    const { error: worksheetError } = await client.from("worksheets").insert(worksheetPayload);

    if (worksheetError) {
      throw new Error(worksheetError.message);
    }
  }

  revalidatePath("/dashboard");
}
