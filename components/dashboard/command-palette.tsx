"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { Spreadsheet } from "@/types/database";

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  spreadsheets: Spreadsheet[];
  setSpreadsheets: (items: Spreadsheet[]) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function CommandPaletteProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const contextValue = useMemo(
    () => ({
      open,
      setOpen,
      spreadsheets,
      setSpreadsheets
    }),
    [open, spreadsheets]
  );

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {children}
      <Palette open={open} onOpenChange={setOpen} spreadsheets={spreadsheets} />
    </CommandPaletteContext.Provider>
  );
}

function Palette({
  open,
  onOpenChange,
  spreadsheets
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spreadsheets: Spreadsheet[];
}) {
  const router = useRouter();

  const handleSelect = useCallback(
    (value: string) => {
      if (!value) return;
      onOpenChange(false);
      router.push(`/spreadsheets/${value}`);
    },
    [onOpenChange, router]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/70 px-4 py-24 backdrop-blur-sm">
      <Command className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-200 shadow-2xl">
        <div className="flex items-center gap-2 border-b border-slate-800 px-4">
          <Command.Input
            autoFocus
            placeholder="Search spreadsheets..."
            className="flex-1 bg-transparent py-4 text-base text-slate-100 outline-none placeholder:text-slate-500"
          />
          <kbd className="rounded bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-widest text-slate-400">
            Esc
          </kbd>
        </div>
        <Command.List className="max-h-72 overflow-y-auto px-2 py-2">
          <Command.Empty className="px-2 py-6 text-center text-sm text-slate-500">
            No spreadsheets found.
          </Command.Empty>
          <Command.Group heading="Spreadsheets" className="space-y-1">
            {spreadsheets.map((sheet) => (
              <Command.Item
                key={sheet.id}
                value={sheet.id}
                onSelect={handleSelect}
                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-100 data-[selected='true']:bg-slate-800"
              >
                <span>{sheet.name}</span>
                {sheet.pinned ? (
                  <span className="text-xs text-amber-300">Pinned</span>
                ) : null}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  }
  return context;
}

export function CommandPaletteTrigger({ className }: { className?: string }) {
  const { setOpen } = useCommandPalette();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={`flex w-full items-center justify-between rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-left text-sm text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-200 ${
        className ?? ""
      }`}
    >
      <span>Quick search...</span>
      <span className="text-xs uppercase tracking-wide text-slate-500">⌘K</span>
    </button>
  );
}

export function CommandPaletteRegister({ spreadsheets }: { spreadsheets: Spreadsheet[] }) {
  const { setSpreadsheets } = useCommandPalette();

  useEffect(() => {
    setSpreadsheets(spreadsheets);
  }, [setSpreadsheets, spreadsheets]);

  return null;
}
