'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputError } from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';

interface MfaSetupFormProps {
  qrCode: string;
  action: (formData: FormData) => void;
}

export function MfaSetupForm({ qrCode, action }: MfaSetupFormProps) {
  const [token, setToken] = useState('');
  const [touched, setTouched] = useState(false);

  const error = touched
    ? !token
      ? 'Authenticator code is required'
      : !/^\d{6}$/.test(token)
      ? 'Code must be exactly 6 digits'
      : ''
    : '';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setTouched(true);
    if (!token || !/^\d{6}$/.test(token)) {
      e.preventDefault();
    }
  };

  return (
    <form action={action} onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="flex justify-center p-2 bg-white rounded-lg inline-block border">
        <Image
          src={qrCode}
          width={180}
          height={180}
          alt="Scan setup QR code"
          unoptimized
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="setup-token" required>Enter 6-digit authenticator code</Label>
        <Input
          id="setup-token"
          name="token"
          inputMode="numeric"
          pattern="[0-9]{6}"
          minLength={6}
          maxLength={6}
          autoComplete="one-time-code"
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            if (!touched) setTouched(true);
          }}
          onBlur={() => setTouched(true)}
          error={!!error}
          aria-describedby={error ? 'setup-token-error' : undefined}
          required
        />
        {error && <InputError id="setup-token-error" message={error} />}
      </div>
      <Button type="submit" className="w-full">
        Verify and Activate Authenticator
      </Button>
    </form>
  );
}

interface MfaActionFormProps {
  mfaEnabled: boolean;
  isMandatoryRole: boolean;
  action: (formData: FormData) => void;
}

export function MfaActionForm({ mfaEnabled, isMandatoryRole, action }: MfaActionFormProps) {
  const [password, setPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [token, setToken] = useState('');
  const [tokenTouched, setTokenTouched] = useState(false);

  const passwordError = passwordTouched && !password ? 'Password is required' : '';
  const tokenError =
    mfaEnabled && tokenTouched
      ? !token
        ? 'Authenticator code is required'
        : !/^\d{6}$/.test(token)
        ? 'Code must be exactly 6 digits'
        : ''
      : '';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setPasswordTouched(true);
    if (mfaEnabled) setTokenTouched(true);

    if (!password || (mfaEnabled && (!token || !/^\d{6}$/.test(token)))) {
      e.preventDefault();
    }
  };

  return (
    <form action={action} onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="mfa-password" required>Current Password</Label>
        <Input
          id="mfa-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (!passwordTouched) setPasswordTouched(true);
          }}
          onBlur={() => setPasswordTouched(true)}
          error={!!passwordError}
          aria-describedby={passwordError ? 'mfa-password-error' : undefined}
          required
        />
        {passwordError && <InputError id="mfa-password-error" message={passwordError} />}
      </div>
      {mfaEnabled && (
        <div className="space-y-1">
          <Label htmlFor="disable-token" required>Authenticator Code</Label>
          <Input
            id="disable-token"
            name="token"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoComplete="one-time-code"
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              if (!tokenTouched) setTokenTouched(true);
            }}
            onBlur={() => setTokenTouched(true)}
            error={!!tokenError}
            aria-describedby={tokenError ? 'disable-token-error' : undefined}
            required
          />
          {tokenError && <InputError id="disable-token-error" message={tokenError} />}
        </div>
      )}
      {isMandatoryRole && mfaEnabled ? (
        <Button type="button" disabled variant="outline" className="w-full">
          MFA Required by Role Policy
        </Button>
      ) : (
        <Button
          type="submit"
          variant={mfaEnabled ? 'destructive' : 'default'}
          className="w-full"
        >
          {mfaEnabled ? 'Disable Authenticator' : 'Set Up Authenticator App'}
        </Button>
      )}
    </form>
  );
}

interface ScreenLockPinFormProps {
  action: (formData: FormData) => void;
}

export function ScreenLockPinForm({ action }: ScreenLockPinFormProps) {
  const [password, setPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [pin, setPin] = useState('');
  const [pinTouched, setPinTouched] = useState(false);

  const passwordError = passwordTouched && !password ? 'Password is required' : '';
  const pinError = pinTouched
    ? !pin
      ? 'PIN is required'
      : !/^\d{6}$/.test(pin)
      ? 'Screen lock PIN must be exactly 6 digits'
      : ''
    : '';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setPasswordTouched(true);
    setPinTouched(true);

    if (!password || !pin || !/^\d{6}$/.test(pin)) {
      e.preventDefault();
    }
  };

  return (
    <form action={action} onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="pin-password" required>Current Password</Label>
        <Input
          id="pin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (!passwordTouched) setPasswordTouched(true);
          }}
          onBlur={() => setPasswordTouched(true)}
          error={!!passwordError}
          aria-describedby={passwordError ? 'pin-password-error' : undefined}
          required
        />
        {passwordError && <InputError id="pin-password-error" message={passwordError} />}
      </div>
      <div className="space-y-1">
        <Label htmlFor="new-pin" required>New 6-Digit PIN</Label>
        <Input
          id="new-pin"
          name="pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]{6}"
          minLength={6}
          maxLength={6}
          autoComplete="new-password"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            if (!pinTouched) setPinTouched(true);
          }}
          onBlur={() => setPinTouched(true)}
          error={!!pinError}
          aria-describedby={pinError ? 'new-pin-error' : undefined}
          required
        />
        {pinError && <InputError id="new-pin-error" message={pinError} />}
      </div>
      <Button type="submit" className="w-full">
        Save Screen Lock PIN
      </Button>
    </form>
  );
}
