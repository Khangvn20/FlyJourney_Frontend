import React, { useCallback, useEffect, useMemo, useState } from "react";

type AnyObj = Record<string, unknown> | undefined | null;

interface DebugEntry {
  id: string;
  time: number;
  phase: "request" | "response";
  data: AnyObj;
}

const safeStringify = (obj: AnyObj) => {
  try {
    return JSON.stringify(obj ?? {}, null, 2);
  } catch {
    return String(obj);
  }
};

const trimText = (text: string, max = 3000) =>
  text.length > max ? `${text.slice(0, max)}\n…(trimmed)` : text;

const DEBUG_CONSOLE_ENABLED = true;

const DebugConsole: React.FC = () => {
  if (!DEBUG_CONSOLE_ENABLED) return null;
  
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"request" | "response">("request");
  const [entries, setEntries] = useState<DebugEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Seed with current globals
  useEffect(() => {
    try {
      const w = window as unknown as Record<string, unknown>;
      if (w["__FJ_DEBUG_LAST_REQUEST__"]) {
        setEntries((prev) =>
          [
            ...prev,
            {
              id: `seed-req-${Date.now()}`,
              time: Date.now(),
              phase: "request" as const,
              data: w["__FJ_DEBUG_LAST_REQUEST__"] as AnyObj,
            },
          ].slice(-20)
        );
      }
      if (w["__FJ_DEBUG_LAST_RESPONSE__"]) {
        setEntries((prev) =>
          [
            ...prev,
            {
              id: `seed-res-${Date.now()}`,
              time: Date.now(),
              phase: "response" as const,
              data: w["__FJ_DEBUG_LAST_RESPONSE__"] as AnyObj,
            },
          ].slice(-20)
        );
      }
    } catch {
      // ignore
    }
  }, []);

  // Listen to debug events from all API callers
  useEffect(() => {
    const onDebug = (e: Event) => {
      const ce = e as CustomEvent;
      const phase = (ce.detail?.phase as "request" | "response") || "request";
      const data = ce.detail?.data as AnyObj;
      const id = `${phase}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`;
      setEntries((prev) =>
        [...prev, { id, time: Date.now(), phase, data }].slice(-50)
      );
    };
    window.addEventListener("FJ_DEBUG_API", onDebug as EventListener);
    return () =>
      window.removeEventListener("FJ_DEBUG_API", onDebug as EventListener);
  }, []);

  // Always auto-expand the latest item of the current tab, collapse older
  useEffect(() => {
    const latest = entries
      .filter((e) => e.phase === tab)
      .sort((a, b) => b.time - a.time)[0];
    if (latest && latest.id !== expandedId) {
      setExpandedId(latest.id);
    }
  }, [entries, tab]);

  const list = useMemo(
    () =>
      entries.filter((e) => e.phase === tab).sort((a, b) => b.time - a.time),
    [entries, tab]
  );

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-2 rounded-full bg-gray-900/90 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-gray-800"
        title="Mở bảng debug request/response">
        {open ? "Đóng Debug Console" : "Mở Debug Console"}
      </button>

      {open && (
        <div className="h-[60vh] w-[92vw] max-w-[980px] overflow-hidden rounded-lg border border-gray-300 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b bg-gray-50 px-3 py-2">
            <div className="text-sm font-semibold text-gray-700">
              Debug Console
            </div>
            <div className="flex gap-2">
              <button
                className={`rounded px-2 py-1 text-xs ${
                  tab === "request"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setTab("request")}>
                Requests
              </button>
              <button
                className={`rounded px-2 py-1 text-xs ${
                  tab === "response"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setTab("response")}>
                Responses
              </button>
            </div>
          </div>
          <div className="h-[calc(60vh-40px)] overflow-auto">
            <ul className="divide-y">
              {list.map((e) => {
                const pretty = safeStringify(e.data);
                const trimmed = trimText(pretty);
                const isExpanded = expandedId === e.id;
                const shown = isExpanded ? pretty : trimmed;
                const maybeUrl =
                  (e.data as Record<string, unknown>)?.url ||
                  (
                    (e.data as Record<string, unknown>)?.options as Record<
                      string,
                      unknown
                    >
                  )?.url ||
                  (
                    (e.data as Record<string, unknown>)?.request as Record<
                      string,
                      unknown
                    >
                  )?.url ||
                  "";
                const method =
                  (e.data as Record<string, unknown>)?.method ||
                  (
                    (e.data as Record<string, unknown>)?.options as Record<
                      string,
                      unknown
                    >
                  )?.method ||
                  (
                    (e.data as Record<string, unknown>)?.request as Record<
                      string,
                      unknown
                    >
                  )?.method ||
                  "";
                const ts = new Date(e.time).toLocaleTimeString();
                return (
                  <li key={e.id} className="px-3 py-2">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <div className="min-w-0 truncate text-xs text-gray-600">
                        <span className="font-semibold text-gray-800">
                          [{ts}] {e.phase.toUpperCase()}
                        </span>
                        {method ? (
                          <span className="ml-2 font-mono uppercase text-gray-700">
                            {String(method)}
                          </span>
                        ) : null}
                        {maybeUrl ? (
                          <span className="ml-2 truncate">
                            {String(maybeUrl)}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded bg-gray-100 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-200"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : e.id)
                          }>
                          {isExpanded ? "Collapse" : "Expand"}
                        </button>
                        {e.phase === "request" && (
                          <button
                            className="rounded bg-gray-100 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-200"
                            onClick={() =>
                              copy(
                                String(
                                  (e.data as Record<string, unknown>)?.curl
                                ) || pretty
                              )
                            }
                            title="Copy cURL">
                            Copy cURL
                          </button>
                        )}
                        <button
                          className="rounded bg-gray-100 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-200"
                          onClick={() => copy(pretty)}
                          title="Copy JSON">
                          Copy
                        </button>
                      </div>
                    </div>
                    <pre className="m-0 max-h-64 overflow-auto rounded bg-gray-50 p-2 text-[11px] leading-4 text-gray-800">
                      {shown}
                    </pre>
                  </li>
                );
              })}
              {list.length === 0 && (
                <li className="px-3 py-6 text-center text-xs text-gray-500">
                  No entries yet. Trigger a request.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugConsole;
