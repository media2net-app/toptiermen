"use client";

import { useEffect } from "react";

/**
 * useAutoModalFocus
 * - Scrolls viewport to the top and centers the modal into view
 * - Focuses the modal container
 * - Optionally locks/unlocks body scroll
 */
export function useAutoModalFocus(
  ref: React.RefObject<HTMLElement>,
  isOpen: boolean,
  { lockBody = true }: { lockBody?: boolean } = {}
) {
  useEffect(() => {
    if (!isOpen) {
      if (lockBody && typeof document !== "undefined") document.body.style.overflow = "";
      return;
    }
    if (lockBody && typeof document !== "undefined") document.body.style.overflow = "hidden";

    const id = window.setTimeout(() => {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
          try { ref.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" }); } catch {}
        }, 60);
        ref.current?.focus();
      } catch {}
    }, 50);

    return () => {
      window.clearTimeout(id);
    };
  }, [isOpen, lockBody, ref]);
}
