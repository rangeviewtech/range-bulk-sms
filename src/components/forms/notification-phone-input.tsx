'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { InputError } from '@/components/ui/input-error';
import {
  sanitizeSinglePhoneInput,
  handlePhoneInputKeyDown,
  validatePhoneCountryCode,
  validatePhoneNumber,
} from '@/lib/sms/normalizer';

interface NotificationPhoneInputProps {
  defaultValue: string;
}

export function NotificationPhoneInput({ defaultValue }: NotificationPhoneInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [touched, setTouched] = useState(false);

  let error = '';
  if (touched && value.trim()) {
    const val = value.trim();
    const ccResult = validatePhoneCountryCode(val);
    if (!ccResult.isValid) {
      error = ccResult.error || 'Invalid country calling code';
    } else {
      const fullResult = validatePhoneNumber(val);
      if (!fullResult.isValid) {
        error = fullResult.error || 'Invalid phone format (e.g. +256700123456)';
      }
    }
  }

  return (
    <div>
      <Input
        id="phone"
        name="phone"
        value={value}
        onChange={(e) => {
          const sanitized = sanitizeSinglePhoneInput(e.target.value);
          setValue(sanitized);
          if (!touched) setTouched(true);
        }}
        onKeyDown={(e) => handlePhoneInputKeyDown(e, false)}
        onBlur={() => setTouched(true)}
        placeholder="+1234567890"
        error={!!error}
        aria-describedby={error ? 'phone-format-error' : undefined}
      />
      {error && <InputError id="phone-format-error" message={error} className="mt-1" />}
    </div>
  );
}
