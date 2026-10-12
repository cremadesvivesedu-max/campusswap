import "@testing-library/jest-dom/vitest";

// Node 22+ ships its own experimental `localStorage` global, which shadows jsdom's
// and lacks the Storage methods unless Node is started with --localstorage-file.
if (typeof window !== "undefined" && typeof window.localStorage?.clear !== "function") {
  const store = new Map<string, string>();
  const memoryStorage: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, String(value));
    }
  };
  Object.defineProperty(window, "localStorage", { configurable: true, value: memoryStorage });
}
