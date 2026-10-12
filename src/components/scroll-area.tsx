"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useRef, type PointerEvent, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/cn";

const MIN_THUMB = 32;
const LINGER_MS = 900;

/**
 * A scroll container with its own overlay scrollbar. The native bar is hidden
 * and the thumb floats beside the content, so content width never changes
 * whether or not there is anything to scroll.
 */
export function ScrollArea({
  viewportRef,
  className,
  children,
}: {
  viewportRef: RefObject<HTMLDivElement | null>;
  className?: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const linger = useRef<ReturnType<typeof setTimeout>>(undefined);
  const drag = useRef<{ pointerY: number; scrollTop: number } | null>(null);

  // Position the thumb straight on the DOM: this runs on every scroll frame.
  const sync = useCallback(() => {
    const v = viewportRef.current;
    const tr = track.current;
    const th = thumb.current;
    if (!v || !tr || !th) return;
    const range = v.scrollHeight - v.clientHeight;
    tr.style.visibility = range > 1 ? "visible" : "hidden";
    if (range <= 1) return;
    const height = Math.max(MIN_THUMB, (tr.clientHeight * v.clientHeight) / v.scrollHeight);
    th.style.height = `${height}px`;
    th.style.transform = `translateY(${((tr.clientHeight - height) * v.scrollTop) / range}px)`;
  }, [viewportRef]);

  useEffect(() => {
    const v = viewportRef.current;
    if (!v || !content.current) return;
    const observer = new ResizeObserver(sync);
    observer.observe(v);
    observer.observe(content.current);
    sync();
    return () => {
      observer.disconnect();
      clearTimeout(linger.current);
    };
  }, [sync, viewportRef]);

  const onScroll = () => {
    sync();
    const el = root.current;
    if (!el) return;
    el.dataset.scrolling = "";
    clearTimeout(linger.current);
    linger.current = setTimeout(() => delete el.dataset.scrolling, LINGER_MS);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const v = viewportRef.current;
    const tr = track.current;
    const th = thumb.current;
    if (!v || !tr || !th || e.button !== 0) return;
    e.preventDefault();
    if (e.target !== th) {
      // Clicked the track: centre the thumb under the pointer, then drag from there.
      const travel = tr.clientHeight - th.offsetHeight;
      const y = e.clientY - tr.getBoundingClientRect().top - th.offsetHeight / 2;
      v.scrollTop = (Math.min(Math.max(y, 0), travel) / travel) * (v.scrollHeight - v.clientHeight);
    }
    drag.current = { pointerY: e.clientY, scrollTop: v.scrollTop };
    tr.setPointerCapture(e.pointerId);
    tr.dataset.dragging = "";
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const v = viewportRef.current;
    const tr = track.current;
    const th = thumb.current;
    if (!drag.current || !v || !tr || !th) return;
    const travel = tr.clientHeight - th.offsetHeight;
    if (travel <= 0) return;
    const delta = e.clientY - drag.current.pointerY;
    v.scrollTop = drag.current.scrollTop + (delta / travel) * (v.scrollHeight - v.clientHeight);
  };

  const endDrag = () => {
    drag.current = null;
    if (track.current) delete track.current.dataset.dragging;
  };

  return (
    <div ref={root} className={cn("group/scroll relative min-h-0", className)}>
      <motion.div
        ref={viewportRef}
        layoutScroll
        // Scrolled with the arrow keys from search, so it stays out of the Tab order.
        tabIndex={-1}
        onScroll={onScroll}
        className="no-scrollbar h-full overflow-y-auto overscroll-contain outline-none [mask-image:linear-gradient(to_bottom,transparent,#000_12px,#000_calc(100%-20px),transparent)]"
      >
        <div ref={content} className="pb-5 pt-3">
          {children}
        </div>
      </motion.div>
      <div
        ref={track}
        aria-hidden
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="group/track absolute -right-3.5 bottom-5 top-3 w-3 touch-none opacity-50 transition-opacity duration-300 hover:opacity-100 group-hover/scroll:opacity-100 group-data-[scrolling]/scroll:opacity-100 data-[dragging]:opacity-100 sm:-right-4"
      >
        <div
          ref={thumb}
          className="mx-auto w-[3px] rounded-full bg-white/20 transition-[width,background-color] duration-150 group-hover/track:w-[5px] group-hover/track:bg-white/35 group-data-[dragging]/track:w-[5px] group-data-[dragging]/track:bg-accent/60"
        />
      </div>
    </div>
  );
}
