import "@testing-library/jest-dom/vitest";

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}

  observe() {
    return null;
  }

  unobserve() {
    return null;
  }

  disconnect() {
    return null;
  }
};