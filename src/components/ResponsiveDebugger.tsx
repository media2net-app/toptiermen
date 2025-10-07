"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * ResponsiveDebugger
 * - Shows viewport size and document content size
 * - Detects elements that overflow the viewport width
 * - Visible across the app, toggle with the on-screen button, ?debug=1, or localStorage('ttm_debug_responsive')
 */
export default function ResponsiveDebugger() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [viewport, setViewport] = useState({
    w: 0,
    h: 0,
    dpr: 1,
  });
  const [docSize, setDocSize] = useState({
    scrollW: 0,
    scrollH: 0,
    clientW: 0,
    clientH: 0,
  });
  const [offenders, setOffenders] = useState<Array<{
    selector: string;
    width: number;
    clientWidth: number;
    scrollWidth: number;
    right: number;
  }>>([]);
  const scanTimer = useRef<number | null>(null);

  // Compute initial state from URL/localStorage/env
  useEffect(() => {
    try {
      const qp = new URLSearchParams(window.location.search);
      const byQuery = qp.get("debug") === "1" || qp.get("responsive") === "1";
      const byLS = localStorage.getItem("ttm_debug_responsive") === "1";
      const byEnv = process.env.NEXT_PUBLIC_RESPONSIVE_DEBUG === "1";
      setEnabled(Boolean(byQuery || byLS || byEnv));
    } catch {}
  }, []);

  // Persist toggle
  useEffect(() => {
    try {
      localStorage.setItem("ttm_debug_responsive", enabled ? "1" : "0");
    } catch {}
  }, [enabled]);

  const updateViewport = () => {
    if (typeof window === "undefined") return;
    setViewport({ w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio || 1 });
    const de = document.documentElement;
    setDocSize({
      scrollW: de.scrollWidth,
      scrollH: de.scrollHeight,
      clientW: de.clientWidth,
      clientH: de.clientHeight,
    });
  };

  const highlight = (selector: string) => {
    try {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      const prevOutline = el.style.outline;
      const prevPos = el.style.position;
      el.style.outline = '2px solid #FF5555';
      // ensure it is part of flow
      if (getComputedStyle(el).position === 'static') {
        el.style.position = 'relative';
      }
      setTimeout(() => {
        el.style.outline = prevOutline;
        el.style.position = prevPos;
      }, 2000);
    } catch {}
  };

  const getSelector = (el: Element) => {
    try {
      const parts: string[] = [];
      let node: Element | null = el;
      while (node && parts.length < 5) {
        const id = (node as HTMLElement).id ? `#${(node as HTMLElement).id}` : "";
        const cls = (node as HTMLElement).className
          ? "." + String((node as HTMLElement).className)
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .join(".")
          : "";
        parts.unshift(`${node.tagName.toLowerCase()}${id}${cls}`);
        node = node.parentElement;
      }
      return parts.join(" > ");
    } catch {
      return el.tagName.toLowerCase();
    }
  };

  const scanForOverflow = () => {
    if (typeof window === "undefined") return;
    const vw = window.innerWidth;
    const list: Array<{ selector: string; width: number; clientWidth: number; scrollWidth: number; right: number }>= [];

    // Walk DOM elements and look for horizontal overflow patterns
    const all = document.body.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
      const el = all[i] as HTMLElement;
      // Skip hidden or fixed overlays of the debugger itself
      if (!el || !el.isConnected) continue;
      if (el.closest('[data-responsive-debugger="1"]')) continue;
      const cs = window.getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;

      const rect = el.getBoundingClientRect();
      const sw = el.scrollWidth;
      const cw = el.clientWidth;
      const likelyOverflow = sw > cw + 1 || rect.right > vw + 1; // tolerance
      if (likelyOverflow) {
        list.push({
          selector: getSelector(el),
          width: Math.round(rect.width),
          clientWidth: cw,
          scrollWidth: sw,
          right: Math.round(rect.right),
        });
      }
    }

    // Deduplicate by selector and keep top 8 worst offenders by overflow delta
    const dedup = new Map<string, { selector: string; width: number; clientWidth: number; scrollWidth: number; right: number }>();
    for (const item of list) {
      if (!dedup.has(item.selector)) dedup.set(item.selector, item);
    }
    const unique = Array.from(dedup.values())
      .map((o) => ({ ...o, delta: Math.max(o.scrollWidth - o.clientWidth, o.right - viewport.w) }))
      .sort((a, b) => (b.delta || 0) - (a.delta || 0))
      .slice(0, 8)
      .map(({ delta, ...rest }) => rest);

    setOffenders(unique);
  };

  // Re-scan on resize and periodically while enabled
  useEffect(() => {
    if (!enabled) return;
    const onResize = () => {
      updateViewport();
      // Debounce the scan a bit
      if (scanTimer.current) window.clearTimeout(scanTimer.current);
      scanTimer.current = window.setTimeout(() => scanForOverflow(), 150);
    };

    updateViewport();
    scanForOverflow();
    window.addEventListener("resize", onResize);
    const interval = window.setInterval(() => {
      updateViewport();
      scanForOverflow();
    }, 1000);

    return () => {
      window.removeEventListener("resize", onResize);
      window.clearInterval(interval);
      if (scanTimer.current) window.clearTimeout(scanTimer.current);
    };
  }, [enabled]);

  if (!enabled) {
    return (
      <button
        type="button"
        onClick={() => setEnabled(true)}
        aria-label="Open Responsive Debugger"
        className="fixed bottom-3 left-3 z-[99998] px-2 py-1 text-[11px] font-semibold rounded-md bg-[#8BAE5A] text-black shadow-lg hover:opacity-90"
        data-responsive-debugger="1"
      >
        RD
      </button>
    );
  }

  return (
    <div data-responsive-debugger="1">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setEnabled(false)}
        aria-label="Close Responsive Debugger"
        className="fixed bottom-3 left-3 z-[99998] px-2 py-1 text-[11px] font-semibold rounded-md bg-[#8BAE5A] text-black shadow-lg hover:opacity-90"
      >
        RD:ON
      </button>

      {/* Panel */}
      <div
        className="fixed bottom-3 left-12 z-[99999] max-w-[90vw] rounded-lg border border-[#8BAE5A]/40 bg-[#0F1411]/95 text-white shadow-2xl"
        style={{ backdropFilter: "blur(4px)" }}
      >
        <div className="px-3 py-2 text-[11px] leading-4">
          <div className="font-bold text-[#8BAE5A] mb-1">Responsive Debugger</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>
              <div className="text-gray-400">Viewport</div>
              <div>{viewport.w} × {viewport.h} @ {viewport.dpr.toFixed(2)}x</div>
            </div>
            <div>
              <div className="text-gray-400">Document</div>
              <div>scroll {docSize.scrollW} × {docSize.scrollH}</div>
              <div>client {docSize.clientW} × {docSize.clientH}</div>
            </div>
          </div>

          <div className="mt-2 border-t border-[#3A4D23]/50 pt-2">
            <div className="text-gray-400 mb-1">Overflow elements (top 8)</div>
            {offenders.length === 0 ? (
              <div className="text-gray-500">None</div>
            ) : (
              <ul className="space-y-1 max-h-[30vh] overflow-auto pr-1">
                {offenders.map((o, i) => (
                  <li key={i} className="text-[10px] break-words">
                    <button
                      type="button"
                      onClick={() => highlight(o.selector)}
                      className="text-left w-full hover:bg-[#8BAE5A]/10 rounded px-1 py-0.5"
                      title="Klik om te highlighten"
                    >
                      <span className="text-[#8BAE5A]">{i + 1}.</span>{' '}
                      <span className="text-gray-300">{o.selector}</span>{' '}
                      <span className="text-gray-500">w:{o.width} cw:{o.clientWidth} sw:{o.scrollWidth} r:{o.right}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
