import { AppError } from '@/lib/errors';

export async function verifyTurnstileToken(token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  
  if (!secret) {
    // If not configured, we'll allow it for local development, 
    // but in production this should throw.
    if (process.env.NODE_ENV === 'production') {
      throw new AppError('Server is missing Turnstile configuration.', 500, 'SERVER_ERROR');
    }
    console.warn('Turnstile secret key missing. Bypassing verification for development.');
    return true;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', token);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await res.json();
    if (!data.success) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Turnstile verification failed:', error);
    return false;
  }
}
