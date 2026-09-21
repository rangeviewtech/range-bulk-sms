'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { InputError } from '@/components/ui/input-error';

interface NotificationPhoneInputProps {
  defaultValue: string;
}

export function NotificationPhoneInput({ defaultValue }: NotificationPhoneInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [touched, setTouched] = useState(false);

  const error = touched && value.trim()
    ? !/^\+[1-9]\d{6,14}$/.test(value.trim())
      ? 'Use international format with country code (e.g. +256700123456)'
      : ''
    : '';

  return (
    <div>
      <Input
        id="phone"
        name="phone"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (!touched) setTouched(true);
        }}
        onBlur={() => setTouched(true)}
        placeholder="+1234567890"
        error={!!error}
        aria-describedby={error ? 'phone-format-error' : undefined}
      />
      {error && <InputError id="phone-format-error" message={error} className="mt-1" />}
    </div>
  );
}
