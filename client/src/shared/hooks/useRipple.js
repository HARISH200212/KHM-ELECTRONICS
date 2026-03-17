import { useCallback } from 'react';

const getPointerPosition = (event) => {
  if (typeof event.clientX === 'number' && typeof event.clientY === 'number') {
    return { x: event.clientX, y: event.clientY };
  }

  const touchPoint = event.touches?.[0] || event.changedTouches?.[0];
  if (touchPoint) {
    return { x: touchPoint.clientX, y: touchPoint.clientY };
  }

  return null;
};

const shouldSkipRipple = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const runRipple = (event) => {
  const button = event?.currentTarget;
  if (!(button instanceof HTMLElement) || shouldSkipRipple()) {
    return;
  }

  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const pointer = getPointerPosition(event);

  // Keyboard-triggered clicks don't have pointer coordinates; center the ripple.
  const fallbackX = rect.left + rect.width / 2;
  const fallbackY = rect.top + rect.height / 2;
  const pointerX = pointer?.x ?? fallbackX;
  const pointerY = pointer?.y ?? fallbackY;
  const x = pointerX - rect.left - size / 2;
  const y = pointerY - rect.top - size / 2;

  const existingRipple = button.querySelector('.ripple');
  if (existingRipple) {
    existingRipple.remove();
  }

  const ripple = document.createElement('span');
  ripple.classList.add('ripple');
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  button.appendChild(ripple);
  ripple.addEventListener('animationend', () => {
    ripple.remove();
  });
};

/**
 * Custom hook to create water wave ripple effect on buttons
 * Usage: const ripple = useRipple(); then add onClick={ripple} to button
 * Or use createRipple directly: onClick={(e) => createRipple(e)}
 */
export const useRipple = () => {
  const createRipple = useCallback((event) => {
    runRipple(event);
  }, []);

  return createRipple;
};

/**
 * Direct function to create ripple effect (non-hook version)
 * Can be used in class components or directly in onClick handlers
 */
export const createRippleEffect = (event) => {
  runRipple(event);
};

export default useRipple;
