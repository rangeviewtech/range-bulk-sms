'use client';

import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';
import isEqual from 'lodash/isEqual';
import { useUnsavedChanges } from './use-unsaved-changes';

export interface UseFormValidationOptions<T extends Record<string, unknown>> {
  initialValues: T;
  schema: z.ZodType<T>;
  onSubmit?: (values: T) => void | Promise<void>;
  id?: string;
  protectUnsavedChanges?: boolean;
  title?: string;
  message?: string;
}

export function useFormValidation<T extends Record<string, unknown>>({
  initialValues,
  schema,
  onSubmit,
  id,
  protectUnsavedChanges = false,
  title,
  message,
}: UseFormValidationOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [baselineValues, setBaselineValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute dirty state by comparing current values to the baseline
  const isDirty = useMemo(() => {
    return !isEqual(values, baselineValues);
  }, [values, baselineValues]);

  // Hook into unsaved changes protection if enabled
  const { confirmDiscard } = useUnsavedChanges({
    id: id || undefined,
    isDirty: protectUnsavedChanges ? isDirty : false,
    onDiscard: () => {
      setValues(baselineValues);
      setErrors({});
      setTouched({});
    },
    title,
    message,
  });

  const validateField = useCallback(
    (field: keyof T, val: unknown) => {
      // Test the field against schema
      if (schema instanceof z.ZodObject) {
        const fieldSchema = (schema.shape as Record<string, z.ZodTypeAny>)[field as string];
        if (fieldSchema) {
          const result = fieldSchema.safeParse(val);
          if (!result.success) {
            const firstError = result.error.errors[0]?.message || 'Invalid value';
            setErrors((prev) => ({ ...prev, [field]: firstError }));
            return false;
          }
        }
      } else {
        // Fallback for refined schemas: validate entire object with this field updated
        const updated = { ...values, [field]: val };
        const result = schema.safeParse(updated);
        if (!result.success) {
          const fieldIssue = result.error.errors.find((err) => err.path.includes(field as string));
          if (fieldIssue) {
            setErrors((prev) => ({ ...prev, [field]: fieldIssue.message }));
            return false;
          }
        }
      }

      // If valid, clear error for this field
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
      return true;
    },
    [schema, values]
  );

  const setFieldValue = useCallback(
    (field: keyof T, value: unknown) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      // Real-time dynamic validation
      validateField(field, value);
    },
    [validateField]
  );

  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      validateField(field, values[field]);
    },
    [validateField, values]
  );

  const validateAll = useCallback((): { isValid: boolean; data?: T } => {
    const result = schema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof T, string>> = {};
      const touchedAll: Partial<Record<keyof T, boolean>> = {};

      for (const err of result.error.errors) {
        const field = err.path[0] as keyof T;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      }

      // Mark all fields as touched
      Object.keys(values).forEach((k) => {
        touchedAll[k as keyof T] = true;
      });

      setErrors(fieldErrors);
      setTouched(touchedAll);
      return { isValid: false };
    }

    setErrors({});
    return { isValid: true, data: result.data };
  }, [schema, values]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }

      const { isValid, data } = validateAll();
      if (!isValid || !data) return;

      if (onSubmit) {
        try {
          setIsSubmitting(true);
          await onSubmit(data);
          // On successful submission, mark current values as clean baseline
          setBaselineValues(data);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [validateAll, onSubmit]
  );

  const setServerErrors = useCallback((serverErrors: Record<string, string[] | string>) => {
    const formatted: Partial<Record<keyof T, string>> = {};
    for (const [k, v] of Object.entries(serverErrors)) {
      formatted[k as keyof T] = Array.isArray(v) ? v[0] : v;
    }
    setErrors((prev) => ({ ...prev, ...formatted }));
  }, []);

  const reset = useCallback(
    (newValues?: T) => {
      const target = newValues || initialValues;
      setValues(target);
      setBaselineValues(target);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    },
    [initialValues]
  );

  const markClean = useCallback(
    (newBaseline?: T) => {
      setBaselineValues(newBaseline || values);
    },
    [values]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    baselineValues,
    setFieldValue,
    handleBlur,
    validateField,
    validateAll,
    handleSubmit,
    setServerErrors,
    reset,
    setValues,
    markClean,
    confirmDiscard,
  };
}
