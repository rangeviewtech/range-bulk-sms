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
}

export function PinInput({ value, onChange, maxLength = 6 }: PinInputProps) {
  return (
    <InputOTP maxLength={maxLength} value={value} onChange={onChange}>
      <InputOTPGroup>
        {Array.from({ length: maxLength }).map((_, i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}
