import { useCallback, useMemo, useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('local-storage-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('local-storage-change', callback);
  };
}
const getServerSnapshot = () => null;
function read(key: string) {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function parse<T>(raw: string | null, fallback: T): T {
  try {
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((previous: T) => T)) => void] {
  const getSnapshot = useCallback(() => read(key), [key]);
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const value = useMemo(() => parse(raw, initialValue), [raw, initialValue]);
  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      if (typeof window === 'undefined') return;
      try {
        const previous = parse(read(key), initialValue);
        const resolved = typeof next === 'function' ? (next as (previous: T) => T)(previous) : next;
        window.localStorage.setItem(key, JSON.stringify(resolved));
        window.dispatchEvent(new Event('local-storage-change'));
      } catch {
        /* Storage may be disabled by the browser. */
      }
    },
    [key, initialValue]
  );
  return [value, setValue];
}
