import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
afterEach(cleanup);
beforeEach(() => {
  if (typeof window === 'undefined') return;
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
  localStorage.clear();
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
  Element.prototype.animate = vi.fn(() => ({
    cancel: vi.fn(),
    pause: vi.fn(),
    play: vi.fn(),
    finished: Promise.resolve(),
  }));
});
