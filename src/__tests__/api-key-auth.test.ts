import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateApiKey } from "../lib/auth/api-key-auth";
import { prisma } from "../lib/prisma";
import crypto from "crypto";

vi.mock("../lib/prisma", () => ({
  prisma: {
    apiKey: {
      findUnique: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
    },
  },
}));

interface MockApiKeyDelegate {
  findUnique: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
}

const mockApiKey = prisma.apiKey as unknown as MockApiKeyDelegate;

describe("ApiKeyAuth (Token Validation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null when no token or malformed header is supplied", async () => {
    expect(await validateApiKey(null)).toBeNull();
    expect(await validateApiKey("")).toBeNull();
    expect(await validateApiKey("Basic xyz123")).toBeNull();
    expect(await validateApiKey("Bearer ")).toBeNull();
  });

  it("should validate an active API key and return apiKey and user details", async () => {
    const rawToken = "rg_live_987654321abcdef";
    const expectedHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const mockRecord = {
      id: "key-1",
      keyHash: expectedHash,
      status: "ACTIVE",
      expiresAt: null,
      user: {
        id: "user-123",
        email: "developer@range.ug",
      },
    };

    mockApiKey.findUnique.mockResolvedValueOnce(mockRecord);

    const result = await validateApiKey(`Bearer ${rawToken}`);

    expect(result).not.toBeNull();
    expect(result?.apiKey.id).toBe("key-1");
    expect(result?.user.id).toBe("user-123");
    expect(mockApiKey.findUnique).toHaveBeenCalledWith({
      where: { keyHash: expectedHash },
      include: { user: true },
    });
    expect(mockApiKey.update).toHaveBeenCalledWith({
      where: { id: "key-1" },
      data: { lastUsedAt: expect.any(Date) },
    });
  });

  it("should reject revoked or inactive API keys", async () => {
    const rawToken = "rg_live_revoked123";
    mockApiKey.findUnique.mockResolvedValueOnce({
      id: "key-2",
      status: "REVOKED",
      user: { id: "user-123" },
    });

    const result = await validateApiKey(`Bearer ${rawToken}`);
    expect(result).toBeNull();
  });

  it("should reject expired API keys", async () => {
    const rawToken = "rg_live_expired123";
    mockApiKey.findUnique.mockResolvedValueOnce({
      id: "key-3",
      status: "ACTIVE",
      expiresAt: new Date(Date.now() - 3600000), // expired 1 hour ago
      user: { id: "user-123" },
    });

    const result = await validateApiKey(`Bearer ${rawToken}`);
    expect(result).toBeNull();
  });
});
