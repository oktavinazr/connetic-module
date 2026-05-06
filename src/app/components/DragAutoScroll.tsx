import { useState, useCallback } from 'react';
import { useDragLayer } from 'react-dnd';
import { useDragAutoScroll } from '../hooks/useDragAutoScroll';

/**
 * Monitors the react-dnd drag layer and enables auto-scroll
 * when the user is actively dragging an element near viewport edges.
 * Also renders subtle edge indicators when auto-scroll is active.
 *
 * Place this component inside a <DndProvider>.
 */
export function DragAutoScroll() {
  const [scrollZone, setScrollZone] = useState<'top' | 'bottom' | null>(null);

  const { isDragging } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
  }));

  const handleScrollZone = useCallback((zone: 'top' | 'bottom' | null) => {
    setScrollZone(zone);
  }, []);

  useDragAutoScroll({ enabled: isDragging, onScrollZone: handleScrollZone });

  if (!isDragging) return null;

  return (
    <>
      {/* Top edge indicator — subtle gradient hint */}
      <div
        className={`dnd-scroll-zone-top ${scrollZone === 'top' ? 'dnd-scroll-zone-visible' : ''}`}
        aria-hidden="true"
      />
      {/* Bottom edge indicator — subtle gradient hint */}
      <div
        className={`dnd-scroll-zone-bottom ${scrollZone === 'bottom' ? 'dnd-scroll-zone-visible' : ''}`}
        aria-hidden="true"
      />
      {/* Grabbing cursor class on body while dragging */}
      <style>{`body { cursor: grabbing !important; }`}</style>
    </>
  );
}
