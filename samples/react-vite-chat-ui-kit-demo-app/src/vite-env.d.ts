/// <reference types="vite/client" />

declare global {
  interface Window {
    QB: typeof import('quickblox').default;
  }
}

export {};
