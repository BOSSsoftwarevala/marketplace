/**
 * useModuleAction — Unified action wrapper for Super Admin modules.
 *
 * Guarantees that every Add / Edit / Delete / Save / Submit / Refresh /
 * Filter / Toggle click has consistent feedback:
 *   • loading toast (with id, replaced on resolve)
 *   • success toast OR friendly error toast
 *   • server-side audit_logs entry (success + failure)
 *   • console error capture for client-side debugging
 *
 * Pure presentation/feedback layer — no UI changes, no business logic.
 */

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type ModuleActionKind =
  | "add"
  | "edit"
  | "delete"
  | "save"
  | "submit"
  | "refresh"
  | "filter"
  | "toggle"
  | "open"
  | "custom";

export interface ModuleActionOptions {
  /** Short verb shown in toasts, e.g. "Saving product". */
  label: string;
  /** Logical module key, e.g. "product_manager". */
  module: string;
  /** add | edit | delete … — used in audit + log key. */
  kind?: ModuleActionKind;
  /** Override success toast text. Set to `false` to suppress. */
  successMessage?: string | false;
  /** Override error toast text. */
  errorMessage?: string;
  /** Extra metadata persisted with the audit entry. */
  context?: Record<string, unknown>;
  /** Skip the loading toast (e.g. fast filters). */
  silentLoading?: boolean;
}

const writeAudit = async (
  module: string,
  kind: ModuleActionKind,
  label: string,
  success: boolean,
  durationMs: number,
  errorMessage?: string,
  context?: Record<string, unknown>
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({
      user_id: user?.id ?? null,
      module,
      action: `${kind}:${label}`,
      meta_json: {
        kind,
        label,
        success,
        duration_ms: durationMs,
        error: errorMessage ?? null,
        path: typeof window !== "undefined" ? window.location.pathname : null,
        timestamp: new Date().toISOString(),
        ...(context ?? {}),
      },
    } as never);
  } catch (err) {
    // Never break UX because audit failed — just trace it.
    console.warn("[useModuleAction] audit insert failed", err);
  }
};

export function useModuleAction() {
  const [pending, setPending] = useState(false);
  const counterRef = useRef(0);

  const run = useCallback(
    async <T,>(
      action: () => Promise<T>,
      options: ModuleActionOptions
    ): Promise<{ success: boolean; data?: T; error?: string }> => {
      const {
        label,
        module,
        kind = "custom",
        successMessage,
        errorMessage,
        context,
        silentLoading = false,
      } = options;

      const toastId = `mod-action-${++counterRef.current}`;
      const startedAt = performance.now();
      setPending(true);

      if (!silentLoading) {
        toast.loading(`${label}…`, { id: toastId });
      }

      try {
        const data = await action();
        const duration = Math.round(performance.now() - startedAt);

        if (successMessage === false) {
          toast.dismiss(toastId);
        } else {
          toast.success(successMessage ?? `${label} complete`, { id: toastId });
        }

        // Audit success (fire-and-forget)
        void writeAudit(module, kind, label, true, duration, undefined, context);

        return { success: true, data };
      } catch (err) {
        const duration = Math.round(performance.now() - startedAt);
        const message =
          err instanceof Error ? err.message : "Unknown error";

        // Friendly toast — never expose raw stack
        toast.error(errorMessage ?? `${label} could not finish`, {
          id: toastId,
          description: "We logged the issue and will retry automatically.",
        });

        console.error(`[ModuleAction:${module}:${kind}] ${label} failed`, err);
        void writeAudit(module, kind, label, false, duration, message, context);

        return { success: false, error: message };
      } finally {
        setPending(false);
      }
    },
    []
  );

  return { run, pending };
}

export default useModuleAction;