'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { verifyMfaChallenge } from '../../actions';
import { toast } from 'sonner';
import { verifyMfaSchema } from '@/lib/validations/auth';
import { PinInput } from '@/components/forms/pin-input';
import { AuthLayout } from '@/components/layout/auth-layout';

type VerifyMfaValues = z.infer<typeof verifyMfaSchema>;
const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export default function TwoFactorChallengePage() {
  const [loading, setLoading] = useState(false);

  const { handleSubmit, setValue, watch, formState: { errors } } = useForm<VerifyMfaValues>({
    resolver: zodResolver(verifyMfaSchema),
    mode: 'onChange',
  });

  const tokenValue = watch('token');

  const onSubmit = async (data: VerifyMfaValues) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('token', data.token);
    
    const res = await verifyMfaChallenge(formData);
    
    if (res?.error) {
      toast.error(res.error);
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout>
      <div style={{ width: '100%', float: 'left' }}>
        <h3 style={{ fontSize: '28px', fontWeight: 500, color: 'hsl(var(--foreground))', marginBottom: '8px', lineHeight: '33.6px', fontFamily: FONT_STACK }}>
          Two-Factor Authentication
        </h3>
        <p style={{ fontSize: '13px', color: 'hsl(var(--foreground))', marginBottom: '16px', lineHeight: '19.5px', fontFamily: FONT_STACK }}>
          Enter the 6-digit code from your authenticator app to continue.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ padding: '20px 0' }}>
            <PinInput 
              value={tokenValue || ''}
              onChange={(val) => setValue('token', val, { shouldValidate: true })}
            />
          </div>
          {errors.token && <p style={{ fontSize: '11px', color: 'hsl(var(--destructive))', marginTop: '4px', fontFamily: FONT_STACK }}>{errors.token.message}</p>}

          <div className="login-con" style={{ width: '100%', marginTop: '10px' }}>
            <button
              type="submit"
              disabled={loading || (tokenValue?.length !== 6)}
              style={{
                width: '100%',
                height: '33px',
                padding: '6px 28px',
                fontSize: '13px',
                lineHeight: '19.5px',
                backgroundColor: '#29A4FF',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: '6px',
                border: '0',
                cursor: loading || (tokenValue?.length !== 6) ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                boxSizing: 'border-box',
                fontFamily: FONT_STACK,
                opacity: loading || (tokenValue?.length !== 6) ? 0.7 : 1,
              }}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
