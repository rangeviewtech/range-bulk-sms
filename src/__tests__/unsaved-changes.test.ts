// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { z } from 'zod';
import { useFormValidation } from '@/hooks/use-form-validation';

describe('Unsaved Changes & Form Dirty State Tracking', () => {
  const testSchema = z.object({
    name: z.string().min(1, 'Name required'),
    email: z.string().email('Invalid email'),
  });

  const initialValues = {
    name: 'Alice',
    email: 'alice@example.com',
  };

  it('initializes with isDirty false', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        schema: testSchema,
      })
    );

    expect(result.current.isDirty).toBe(false);
    expect(result.current.values).toEqual(initialValues);
  });

  it('marks isDirty true when a field value is modified', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        schema: testSchema,
      })
    );

    act(() => {
      result.current.setFieldValue('name', 'Bob');
    });

    expect(result.current.isDirty).toBe(true);
  });

  it('reverts isDirty to false when value is changed back to original baseline (no false positive)', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        schema: testSchema,
      })
    );

    act(() => {
      result.current.setFieldValue('name', 'Bob');
    });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.setFieldValue('name', 'Alice');
    });
    expect(result.current.isDirty).toBe(false);
  });

  it('updates baseline and clears isDirty when reset(newValues) is called (API hydration)', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        schema: testSchema,
      })
    );

    // Simulate server data arriving
    const serverData = { name: 'Charlie', email: 'charlie@example.com' };
    act(() => {
      result.current.reset(serverData);
    });

    expect(result.current.values).toEqual(serverData);
    expect(result.current.isDirty).toBe(false);

    // Editing from the new server baseline marks dirty
    act(() => {
      result.current.setFieldValue('name', 'David');
    });
    expect(result.current.isDirty).toBe(true);

    // Reverting to server baseline marks clean again
    act(() => {
      result.current.setFieldValue('name', 'Charlie');
    });
    expect(result.current.isDirty).toBe(false);
  });

  it('clears isDirty upon successful submission via markClean or handleSubmit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        schema: testSchema,
        onSubmit,
      })
    );

    act(() => {
      result.current.setFieldValue('name', 'Daniel');
    });
    expect(result.current.isDirty).toBe(true);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Daniel', email: 'alice@example.com' });
    expect(result.current.isDirty).toBe(false);
  });

  it('preserves isDirty if submission fails or throws', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        schema: testSchema,
        onSubmit,
      })
    );

    act(() => {
      result.current.setFieldValue('name', 'Daniel');
    });
    expect(result.current.isDirty).toBe(true);

    await act(async () => {
      try {
        await result.current.handleSubmit();
      } catch {
        // caught
      }
    });

    expect(result.current.isDirty).toBe(true);
  });
});
