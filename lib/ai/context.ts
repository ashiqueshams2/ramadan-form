import { SheetContextPayload, SheetFilter, SheetRow } from "@/types/ai";

export interface SanitizedSheetContext {
  sheetId: string;
  locale?: string;
  timezone?: string;
  columns: SheetContextPayload["columns"];
  rows: SheetRow[];
  filters?: SheetFilter[];
  selection?: SheetContextPayload["selection"];
}

const SUPPORTED_OPERATORS = new Set<SheetFilter["operator"]>([
  "eq",
  "neq",
  "gt",
  "lt",
  "gte",
  "lte",
  "contains",
  "in",
]);

export function sanitizeSheetContext(
  context: SheetContextPayload,
  opts: { maxRows?: number } = {}
): SanitizedSheetContext {
  const { maxRows = 200 } = opts;
  const permittedRows = new Set(context.permittedRowIds ?? []);
  const visibleRows = new Set(context.visibleRowIds ?? []);

  const filterableRows = context.rows.filter((row) => {
    const permitted = permittedRows.size ? permittedRows.has(row.id) : true;
    const visible = visibleRows.size ? visibleRows.has(row.id) : true;
    return permitted && visible;
  });

  const filteredRows = applyFilters(filterableRows, context.filters);

  return {
    sheetId: context.sheetId,
    locale: context.locale,
    timezone: context.timezone,
    columns: context.columns,
    rows: filteredRows.slice(0, maxRows),
    filters: context.filters?.filter((filter) =>
      SUPPORTED_OPERATORS.has(filter.operator)
    ),
    selection: context.selection,
  };
}

export function applyFilters(
  rows: SheetRow[],
  filters: SheetFilter[] | undefined
): SheetRow[] {
  if (!filters?.length) {
    return rows;
  }

  return rows.filter((row) =>
    filters.every((filter) =>
      evaluateFilter(row.values[filter.columnId], filter.operator, filter.value)
    )
  );
}

function evaluateFilter(
  value: unknown,
  operator: SheetFilter["operator"],
  expected: unknown
): boolean {
  switch (operator) {
    case "eq":
      return value === expected;
    case "neq":
      return value !== expected;
    case "gt":
      return typeof value === "number" && typeof expected === "number"
        ? value > expected
        : false;
    case "lt":
      return typeof value === "number" && typeof expected === "number"
        ? value < expected
        : false;
    case "gte":
      return typeof value === "number" && typeof expected === "number"
        ? value >= expected
        : false;
    case "lte":
      return typeof value === "number" && typeof expected === "number"
        ? value <= expected
        : false;
    case "contains":
      if (typeof value === "string" && typeof expected === "string") {
        return value.toLowerCase().includes(expected.toLowerCase());
      }
      if (Array.isArray(value)) {
        return value.includes(expected);
      }
      return false;
    case "in":
      if (Array.isArray(expected)) {
        return expected.includes(value);
      }
      return value === expected;
    default:
      return false;
  }
}

export function buildContextPrompt(context: SanitizedSheetContext): string {
  const columnSummary = context.columns
    .map((column) => `- ${column.label} (id: ${column.id}${
      column.type ? `, type: ${column.type}` : ""
    })`)
    .join("\n");

  const rowPreview = context.rows
    .slice(0, 20)
    .map((row) => JSON.stringify(row.values))
    .join("\n");

  const filterSummary = context.filters?.length
    ? context.filters
        .map(
          (filter) =>
            `- ${filter.columnId} ${filter.operator} ${JSON.stringify(
              filter.value
            )}`
        )
        .join("\n")
    : "None";

  const selectionSummary = context.selection
    ? [
        context.selection.rowIds?.length
          ? `Rows: ${context.selection.rowIds.join(", ")}`
          : null,
        context.selection.columnIds?.length
          ? `Columns: ${context.selection.columnIds.join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join(" | ") || "(selection provided but empty)"
    : "None";

  return `You are assisting with sheet ${context.sheetId}.
Columns:\n${columnSummary || "(no columns)"}
Active filters:\n${filterSummary}
Current selection: ${selectionSummary}
Visible rows (limited sample):\n${rowPreview || "(no rows after filtering)"}`;
}
