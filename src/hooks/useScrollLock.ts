import { useEffect } from 'react';

/**
 * Custom hook to lock both body and <main> element scrolling when a modal is active.
 * Highly robust across web, tablet, and mobile platforms.
 */
export function useScrollLock(lock: boolean = true) {
  useEffect(() => {
    if (!lock) return;

    // Preserve original overflow values
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none'; // Prevent pull-to-refresh & drag-momentum on mobile

    const mainEl = document.querySelector('main');
    let originalMainOverflow = '';
    let originalMainTouchAction = '';

    if (mainEl) {
      originalMainOverflow = mainEl.style.overflow;
      originalMainTouchAction = mainEl.style.touchAction;
      mainEl.style.overflow = 'hidden';
      mainEl.style.touchAction = 'none';
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.touchAction = originalBodyTouchAction;
      if (mainEl) {
        mainEl.style.overflow = originalMainOverflow;
        mainEl.style.touchAction = originalMainTouchAction;
      }
    };
  }, [lock]);
}
