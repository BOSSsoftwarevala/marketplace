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

    const normalize = () => {
      const docEl = document.documentElement;
      const body = document.body;
      const targets = [docEl, body, rootEl].filter(Boolean) as HTMLElement[];

      for (const el of targets) {
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
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const id = target?.id ? `#${target.id}` : "";
      const cls = target?.className && typeof target.className === "string" ? `.${target.className.split(" ").slice(0, 2).join(".")}` : "";
      console.log("[CLICK_PROBE] pointerdown", { tag: `${tag}${id}${cls}`, x: e.clientX, y: e.clientY });
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
