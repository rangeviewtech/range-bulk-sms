'use client';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  error?: boolean;
}

export function PinInput({ value, onChange, maxLength = 6, error }: PinInputProps) {
  return (
    <InputOTP maxLength={maxLength} value={value} onChange={onChange}>
      <InputOTPGroup>
        {Array.from({ length: maxLength }).map((_, i) => (
          <InputOTPSlot
            key={i}
            index={i}
            className={error ? "border-destructive text-destructive" : undefined}
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}
