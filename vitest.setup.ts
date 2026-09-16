import '@testing-library/jest-dom/vitest';
import './tests/unit/prismaMock';

process.env.AUTH_SECRET = 'test-secret-key-that-is-at-least-32-chars-long';
