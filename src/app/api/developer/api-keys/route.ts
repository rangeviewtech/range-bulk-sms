import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/session';
import { generateApiKey } from '@/lib/api-keys/service';
import { z } from 'zod';
import { AppError } from '@/lib/errors';

const createApiKeySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  scopes: z.array(z.string()).default(['sms.send', 'sms.status', 'balance.read']),
  rateLimit: z.number().int().min(10).max(1000).default(100),
  rateLimitWindow: z.number().int().min(10).max(3600).default(60),
  ipWhitelist: z.array(z.string().ip()).optional().default([]),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

export async function GET() {
  try {
    const session = await requireAuth();
    
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: session.userId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        status: true,
        scopes: true,
        rateLimit: true,
        rateLimitWindow: true,
        ipWhitelist: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
        revokedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: apiKeys });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json().catch(() => ({}));

    const parsed = createApiKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, scopes, rateLimit, rateLimitWindow, ipWhitelist, expiresInDays } = parsed.data;

    // Generate cryptographic key and prefix
    const generated = generateApiKey();

    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) 
      : null;

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: session.userId,
        name,
        keyPrefix: generated.keyPrefix,
        keyHash: generated.keyHash,
        scopes,
        rateLimit,
        rateLimitWindow,
        ipWhitelist,
        expiresAt,
        status: 'ACTIVE',
      },
    });

    // Return the full plaintext key ONCE to the user
    return NextResponse.json({
      success: true,
      key: generated.key, // Full plaintext key (e.g., rsms_prefix_secret)
      data: {
        id: apiKey.id,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        scopes: apiKey.scopes,
        status: apiKey.status,
        createdAt: apiKey.createdAt,
        expiresAt: apiKey.expiresAt,
      },
    }, { status: 201 });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
