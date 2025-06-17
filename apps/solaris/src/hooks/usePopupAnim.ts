import { useCallback } from 'react';

export const usePopupAnimations = () => {
  const showPopup = useCallback((overlay: HTMLElement | null, popup: HTMLElement | null) => {
    if (!overlay || !popup) return;

    // Reset initial state
    overlay.style.opacity = '0';
    overlay.style.transform = 'scale(1.05)';
    popup.style.opacity = '0';
    popup.style.transform = 'scale(0.95) translateY(20px)';

    // Force reflow
    overlay.offsetHeight;

    // Start animation
    overlay.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    popup.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.05s, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.05s';

    // Apply final state
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      overlay.style.transform = 'scale(1)';
      popup.style.opacity = '1';
      popup.style.transform = 'scale(1) translateY(0)';
    });
  }, []);

  const hidePopup = useCallback((overlay: HTMLElement | null, popup: HTMLElement | null) => {
    if (!overlay || !popup) return;

    overlay.style.transition = 'opacity 0.25s cubic-bezier(0.4, 0, 1, 1), transform 0.25s cubic-bezier(0.4, 0, 1, 1)';
    popup.style.transition = 'opacity 0.25s cubic-bezier(0.4, 0, 1, 1), transform 0.25s cubic-bezier(0.4, 0, 1, 1)';

    overlay.style.opacity = '0';
    overlay.style.transform = 'scale(1.05)';
    popup.style.opacity = '0';
    popup.style.transform = 'scale(0.95) translateY(20px)';
  }, []);

  return { showPopup, hidePopup };
};
