export type AssistantRole = "user" | "assistant" | "system";

export interface SheetColumn {
  id: string;
  label: string;
  type?: string;
}

export interface SheetRow {
  id: string;
  values: Record<string, unknown>;
}

export interface SheetFilter {
  columnId: string;
  operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "contains" | "in";
  value: unknown;
}

export interface SheetContextPayload {
  sheetId: string;
  locale?: string;
  timezone?: string;
  columns: SheetColumn[];
  rows: SheetRow[];
  filters?: SheetFilter[];
  permittedRowIds?: string[];
  visibleRowIds?: string[];
  selection?: {
    columnIds?: string[];
    rowIds?: string[];
  };
}

export interface ChartSpec {
  id: string;
  type: "line" | "bar" | "area" | "pie" | "table" | string;
  xKey: string;
  yKeys: string[];
  data: Array<Record<string, unknown>>;
  title?: string;
  description?: string;
  config?: {
    note?: string;
    [key: string]: unknown;
  };
}

export interface AssistantMessage {
  id: string;
  role: AssistantRole;
  content: string;
  createdAt: number;
  charts?: ChartSpec[];
}

export interface AssistantConversationState {
  sheetId: string;
  messages: AssistantMessage[];
}

export interface AssistantRequestPayload {
  prompt: string;
  sheetId: string;
  context: SheetContextPayload;
  conversation?: AssistantMessage[];
}

export interface AssistantEventMessage {
  type: "message" | "chart" | "error" | "done";
  content?: string;
  chart?: ChartSpec;
  error?: string;
}
