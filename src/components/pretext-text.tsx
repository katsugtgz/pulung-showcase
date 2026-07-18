"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";

interface PretextTextProps {
  text: string;
  font: string; // e.g. "600 16px Inter, system-ui, sans-serif"
  lineHeight: number;
  maxLines?: number;
  className?: string;
  fallbackClassName?: string;
}

export function PretextText({
  text,
  font,
  lineHeight,
  maxLines,
  className = "",
  fallbackClassName = "",
}: PretextTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Measure initial width
    setWidth(el.getBoundingClientRect().width);

    // Watch for width changes if ResizeObserver is available
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        // contentRect width might be 0 if element or parent display is hidden,
        // fallback to getBoundingClientRect if needed.
        const newWidth = entries[0].contentRect.width || el.getBoundingClientRect().width;
        setWidth(newWidth);
      }
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  const lines = useMemo(() => {
    if (width === null || width <= 0 || typeof window === "undefined") return null;
    try {
      const prepared = prepareWithSegments(text, font);
      const layoutResult = layoutWithLines(prepared, width, lineHeight);
      return layoutResult.lines;
    } catch (e) {
      console.error("pretext layout error:", e);
      return null;
    }
  }, [text, font, width, lineHeight]);

  // Fallback: render basic wrapping or truncation on server-side or if measurement not ready
  if (!lines) {
    return (
      <div ref={containerRef} className={fallbackClassName}>
        {text}
      </div>
    );
  }

  const displayedLines = maxLines ? lines.slice(0, maxLines) : lines;
  const isTruncated = maxLines && lines.length > maxLines;

  return (
    <div ref={containerRef} className={className}>
      {displayedLines.map((line, idx) => {
        const isLast = idx === displayedLines.length - 1;
        let displayText = line.text;
        if (isLast && isTruncated) {
          // If there is more text, append ellipsis
          displayText = displayText.replace(/\s+$/, "") + "…";
        }
        return (
          <div key={idx} className="block truncate">
            {displayText}
          </div>
        );
      })}
    </div>
  );
}
