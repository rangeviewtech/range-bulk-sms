import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/use-local-storage';
beforeEach(() => {
  localStorage.clear();
});
describe('useLocalStorage', () => {
  it('composes consecutive functional updates and synchronizes hook instances', () => {
    const first = renderHook(() => useLocalStorage('count', 0));
    const second = renderHook(() => useLocalStorage('count', 0));
    act(() => {
      first.result.current[1]((n) => n + 1);
      first.result.current[1]((n) => n + 1);
    });
    expect(first.result.current[0]).toBe(2);
    expect(second.result.current[0]).toBe(2);
  });
  it('handles malformed stored JSON', () => {
    localStorage.setItem('count', '{');
    expect(renderHook(() => useLocalStorage('count', 7)).result.current[0]).toBe(7);
  });
});
