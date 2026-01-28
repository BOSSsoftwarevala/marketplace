import { useEffect } from "react";

/**
 * InteractivityGuard
 *
 * الهدف/Goal:
 * - Recover from any accidental global interaction lock where a high-level wrapper
 *   (html/body/#root) ends up with `pointer-events: none` or disabling classes.
 * - Also neutralize known blocking classes that have historically caused "dead UI".
 *
 * IMPORTANT:
 * - No UI output.
 * - Minimal scope: only touches documentElement/body/#root.
 */
export default function InteractivityGuard() {
  useEffect(() => {
    const rootEl = document.getElementById("root");

    const getElLabel = (el: Element | null) => {
      if (!el) return "<null>";
      const h = el as HTMLElement;
      const tag = h.tagName?.toLowerCase?.() || "?";
      const id = h.id ? `#${h.id}` : "";
      const cls =
        h.className && typeof h.className === "string"
          ? `.${h.className.split(" ").slice(0, 2).join(".")}`
          : "";
      return `${tag}${id}${cls}`;
    };

    const isFullscreenCover = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth || 1;
      const vh = window.innerHeight || 1;
      const covers =
        r.left <= 0 &&
        r.top <= 0 &&
        r.right >= vw - 1 &&
        r.bottom >= vh - 1;
      return covers;
    };

    const hasInteractiveSemantics = (el: HTMLElement) => {
      // If it is meant to be clicked (dialog backdrop, button, link, etc.), don't auto-disable it.
      const role = el.getAttribute("role") || "";
      const ariaModal = el.getAttribute("aria-modal");
      const tag = el.tagName.toLowerCase();
      if (tag === "button" || tag === "a" || tag === "input" || tag === "textarea" || tag === "select") return true;
      if (role === "button" || role === "dialog" || role === "menu" || role === "listbox") return true;
      if (ariaModal === "true") return true;
      // Radix portals/overlays often use these markers
      if (el.closest("[data-radix-portal]") || el.hasAttribute("data-radix-portal")) return true;
      return false;
    };

    const isLikelyGhostOverlay = (el: HTMLElement) => {
      const cs = window.getComputedStyle(el);
      if (cs.pointerEvents === "none") return false;
      // If it's visible (opacity/visibility), it might be a legit modal/backdrop.
      // We only auto-neutralize when it LOOKS like a ghost blocker.
      const visuallyHidden = cs.visibility === "hidden" || cs.opacity === "0";
      if (!visuallyHidden) return false;
      if (!isFullscreenCover(el)) return false;
      if (hasInteractiveSemantics(el)) return false;
      // If it has an explicit click handler, it might be intentional.
      const hasInlineHandler = typeof (el as any).onclick === "function" || el.hasAttribute("onclick");
      if (hasInlineHandler) return false;
      return true;
    };

    const normalize = () => {
      const docEl = document.documentElement;
      const body = document.body;
      const targets = [docEl, body, rootEl].filter(Boolean) as HTMLElement[];

      for (const el of targets) {
        // If inert is ever applied to the root containers, the whole UI becomes non-interactive.
        // Only remove it on the top-level containers (safe for modals/portals).
        if (el.hasAttribute("inert")) {
          el.removeAttribute("inert");
          console.warn("[InteractivityGuard] Removed inert on", el);
        }

        // If a parent is pointer-events none, no child can ever receive clicks.
        const pe = window.getComputedStyle(el).pointerEvents;
        if (pe === "none") {
          el.style.pointerEvents = "auto";
          console.warn("[InteractivityGuard] Restored pointer-events:auto on", el);
        }

        // Remove known blocking classes that have historically caused dead screens.
        // Keep the list conservative and focused on app-wide blockers.
        el.classList.remove(
          "buzzer-blocking",
          "pointer-events-none",
          "pe-none",
          "no-pointer-events",
          "interaction-locked",
          "locked"
        );
      }
    };

    // Run immediately and again on next tick (covers initial hydration/layout)
    normalize();
    const t = window.setTimeout(normalize, 0);

    // Observe for future accidental locks (class/style changes)
    const observer = new MutationObserver(() => {
      normalize();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "style"],
      subtree: false,
    });
    if (rootEl) {
      observer.observe(rootEl, {
        attributes: true,
        attributeFilter: ["class", "style"],
      });
    }

    // Debug probe: if events never reach the document, that's an overlay/capture issue.
    // This is intentionally lightweight and only logs when a pointerdown happens.
    const onPointerDownCapture = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const target = e.target as HTMLElement | null;

      // 1) Always log basic target info
      console.log("[CLICK_PROBE] pointerdown", { tag: getElLabel(target), x, y });

      // 2) Log the top-most stack at the click point (helps identify overlays)
      const stack = (document.elementsFromPoint?.(x, y) || []).slice(0, 8) as HTMLElement[];
      const stackInfo = stack.map((el) => {
        const cs = window.getComputedStyle(el);
        return {
          el: getElLabel(el),
          pe: cs.pointerEvents,
          pos: cs.position,
          zi: cs.zIndex,
          op: cs.opacity,
          vis: cs.visibility,
        };
      });
      console.log("[CLICK_STACK]", stackInfo);

      // 3) Auto-neutralize a ghost fullscreen overlay if detected
      const topBlocking = stack.find((el) => {
        if (!el) return false;
        // Never touch core roots
        if (el === document.documentElement || el === document.body || el === rootEl) return false;
        return isLikelyGhostOverlay(el);
      });

      if (topBlocking) {
        topBlocking.style.pointerEvents = "none";
        console.warn("[InteractivityGuard] Disabled ghost overlay pointer-events", getElLabel(topBlocking));
      }
    };
    document.addEventListener("pointerdown", onPointerDownCapture, true);

    return () => {
      window.clearTimeout(t);
      observer.disconnect();
      document.removeEventListener("pointerdown", onPointerDownCapture, true);
    };
  }, []);

  return null;
}
