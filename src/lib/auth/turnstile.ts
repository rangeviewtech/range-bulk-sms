export async function verifyTurnstileToken(token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    // If not configured, we'll allow it for local development,
    // but in production this should throw.
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
    console.warn('Turnstile secret key missing. Bypassing verification for development.');
    return true;
  }
  if (!token) return false;

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secret);
    formData.append('response', token);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      signal: AbortSignal.timeout(10_000),
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data: unknown = await res.json();
    if (
      !res.ok ||
      !data ||
      typeof data !== 'object' ||
      !('success' in data) ||
      data.success !== true
    ) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Turnstile verification failed:', error);
    return false;
  }
}
