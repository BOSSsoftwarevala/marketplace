/**
 * clientErrorReporter — One-time install of `error` and
 * `unhandledrejection` listeners that forward client-side errors
 * to `audit_logs` so Super Admin can see WHY a button failed.
 *
 * Throttled to avoid log spam, and never throws.
 */

import { supabase } from "@/integrations/supabase/client";

let installed = false;
const recent = new Map<string, number>();
const WINDOW_MS = 10_000; // dedupe identical errors within 10s

const shouldReport = (key: string) => {
  const now = Date.now();
  const prev = recent.get(key);
  if (prev && now - prev < WINDOW_MS) return false;
  recent.set(key, now);
  // Trim map occasionally
  if (recent.size > 100) {
    for (const [k, t] of recent) if (now - t > WINDOW_MS) recent.delete(k);
  }
  return true;
};

const send = async (kind: "error" | "unhandledrejection", payload: Record<string, unknown>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({
      user_id: user?.id ?? null,
      module: "client_error",
      action: kind,
      meta_json: {
        ...payload,
        path: typeof window !== "undefined" ? window.location.pathname : null,
        ts: new Date().toISOString(),
      },
    } as never);
  } catch {
    /* never break UX */
  }
};

export const installClientErrorReporter = () => {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (ev) => {
    const msg = String(ev.message || ev.error?.message || "unknown");
    const key = `e:${msg}:${ev.filename}:${ev.lineno}`;
    if (!shouldReport(key)) return;
    void send("error", {
      message: msg,
      file: ev.filename,
      line: ev.lineno,
      col: ev.colno,
      stack: ev.error?.stack ? String(ev.error.stack).slice(0, 2000) : null,
    });
  });

  window.addEventListener("unhandledrejection", (ev) => {
    const reason = (ev as PromiseRejectionEvent).reason;
    const msg = reason instanceof Error ? reason.message : String(reason);
    const key = `r:${msg}`;
    if (!shouldReport(key)) return;
    void send("unhandledrejection", {
      message: msg,
      stack: reason instanceof Error && reason.stack ? reason.stack.slice(0, 2000) : null,
    });
  });
};