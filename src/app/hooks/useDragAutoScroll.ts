import { useEffect, useRef, useCallback } from 'react';

/**
 * Auto-scrolls the page while the user is dragging an element.
 * When the cursor/finger approaches the top or bottom edge of the viewport,
 * the window scrolls smoothly in that direction.
 *
 * Supports both mouse and touch events.
 *
 * Usage: Call `useDragAutoScroll({ enabled: true })` inside a DndProvider.
 * The `enabled` flag should be driven by useDragLayer's isDragging.
 */
interface AutoScrollOptions {
  /** Whether auto-scroll is active (typically driven by isDragging from useDragLayer) */
  enabled: boolean;
  /** Distance from viewport edge (in px) to trigger auto-scroll. Default 80. */
  edgeThreshold?: number;
  /** Base scroll speed in px per frame. Default 8. */
  baseSpeed?: number;
  /** Maximum scroll speed in px per frame (at edge). Default 22. */
  maxSpeed?: number;
  /** Callback with current scroll zone: 'top' | 'bottom' | null */
  onScrollZone?: (zone: 'top' | 'bottom' | null) => void;
}

export function useDragAutoScroll({
  enabled,
  edgeThreshold = 80,
  baseSpeed = 8,
  maxSpeed = 22,
  onScrollZone,
}: AutoScrollOptions) {
  const rafRef = useRef<number | null>(null);
  const clientYRef = useRef(0);
  const lastZoneRef = useRef<'top' | 'bottom' | null>(null);

  const updatePosition = useCallback((clientY: number) => {
    clientYRef.current = clientY;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    updatePosition(e.clientY);
  }, [updatePosition]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      updatePosition(e.touches[0].clientY);
    }
  }, [updatePosition]);

  const scroll = useCallback(() => {
    if (!enabled) {
      rafRef.current = null;
      return;
    }

    const viewportH = window.innerHeight;
    const clientY = clientYRef.current;
    const distFromTop = clientY;
    const distFromBottom = viewportH - clientY;

    let speed = 0;
    let currentZone: 'top' | 'bottom' | null = null;

    // Scroll up when near top
    if (distFromTop <= edgeThreshold && distFromTop > 0) {
      const proximity = 1 - distFromTop / edgeThreshold; // 0 at threshold, 1 at edge
      speed = -(baseSpeed + proximity * (maxSpeed - baseSpeed));
      currentZone = 'top';
    }
    // Scroll down when near bottom
    else if (distFromBottom <= edgeThreshold && distFromBottom > 0) {
      const proximity = 1 - distFromBottom / edgeThreshold; // 0 at threshold, 1 at edge
      speed = baseSpeed + proximity * (maxSpeed - baseSpeed);
      currentZone = 'bottom';
    }

    if (speed !== 0) {
      window.scrollBy({ top: speed, behavior: 'instant' });
    }

    // Notify zone changes
    if (currentZone !== lastZoneRef.current && onScrollZone) {
      lastZoneRef.current = currentZone;
      onScrollZone(currentZone);
    }

    rafRef.current = requestAnimationFrame(scroll);
  }, [enabled, edgeThreshold, baseSpeed, maxSpeed, onScrollZone]);

  useEffect(() => {
    if (!enabled) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (lastZoneRef.current !== null && onScrollZone) {
        lastZoneRef.current = null;
        onScrollZone(null);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      return;
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    rafRef.current = requestAnimationFrame(scroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [enabled, handleMouseMove, handleTouchMove, scroll, onScrollZone]);
}
