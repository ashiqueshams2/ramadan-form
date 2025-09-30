export interface Spreadsheet {
  id: string;
  name: string;
  pinned: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface Worksheet {
  id: string;
  spreadsheet_id: string;
  name: string;
  data: unknown;
  created_at: string;
}
