/**
 * Polyfill cho trình duyệt cũ (Safari < 15.4, Chrome < 92 — ví dụ macOS Big Sur/Catalina chưa cập nhật).
 * Phải import đầu tiên trong main.tsx, trước mọi module khác.
 */

function defineAt<T extends { length: number; [index: number]: unknown }>(proto: T) {
  if (typeof (proto as { at?: unknown }).at === "function") return;
  Object.defineProperty(proto, "at", {
    configurable: true,
    writable: true,
    value: function at(this: T, index: number) {
      const length = this.length;
      let i = Math.trunc(index) || 0;
      if (i < 0) i += length;
      return i < 0 || i >= length ? undefined : this[i];
    },
  });
}

defineAt(Array.prototype);
defineAt(String.prototype as unknown as { length: number; [index: number]: unknown });

if (typeof Object.hasOwn !== "function") {
  Object.defineProperty(Object, "hasOwn", {
    configurable: true,
    writable: true,
    value: (object: object, key: PropertyKey) => Object.prototype.hasOwnProperty.call(object, key),
  });
}

if (typeof String.prototype.replaceAll !== "function") {
  Object.defineProperty(String.prototype, "replaceAll", {
    configurable: true,
    writable: true,
    value: function replaceAll(this: string, search: string | RegExp, replacement: string) {
      if (search instanceof RegExp) return this.replace(search, replacement);
      return this.split(search).join(replacement);
    },
  });
}
