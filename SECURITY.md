# Security Guidelines

Security is a primary concern. Follow these practices when developing with the template.

## Environment Variable Handling

- **Never** commit `.env` files.
- Prefix public environment variables with `NEXT_PUBLIC_`.
- Server-only secrets should be strictly accessed in Server Components or API Routes.

## Input Validation

Always validate user input.
- Use `zod` for parsing and validating complex data structures.
- Do not trust client-side validation alone; always validate on the server in Next.js Server Actions or API routes.

## XSS and CSRF Prevention

- React escapes strings by default, mitigating most Cross-Site Scripting (XSS) attacks. Avoid using `dangerouslySetInnerHTML`.
- Next.js App Router Actions include built-in protections for Cross-Site Request Forgery (CSRF).

## Security Headers

Configure `next.config.mjs` to inject standard security headers:
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Secrets Management

Use dedicated secret managers (like AWS Secrets Manager, Vercel Env Vars, or Doppler) rather than hardcoded keys in the codebase.

## Reporting Vulnerabilities

If you discover a security vulnerability, please report it immediately to Range View Technology Services Uganda Limited internal security team rather than opening a public issue.
