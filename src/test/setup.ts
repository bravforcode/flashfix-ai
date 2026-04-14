import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock matchMedia for components using Framer Motion or other media query listeners
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock crypto.subtle for AIService hashing
if (!window.crypto.subtle) {
  Object.defineProperty(window.crypto, 'subtle', {
    value: {
      digest: vi.fn().mockResolvedValue(new Uint8Array(32).buffer),
    },
  })
}
