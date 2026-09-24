import { describe, it, expect } from "vitest";
import { SegmentCompiler, SegmentGroup } from "../lib/contacts/segment-compiler";

describe("SegmentCompiler (AST Query Builder)", () => {
  const testUserId = "user-test-456";

  it("should compile a basic AND condition with tenant scoping", () => {
    const ast: SegmentGroup = {
      logic: "AND",
      conditions: [
        { field: "country", operator: "equals", value: "Uganda" },
        { field: "optedOut", operator: "equals", value: false },
      ],
    };

    const compiled = SegmentCompiler.compile(ast, testUserId);

    expect(compiled).toEqual({
      AND: [
        { userId: testUserId },
        {
          AND: [
            { country: "Uganda" },
            { optedOut: false },
          ],
        },
      ],
    });
  });

  it("should compile OR conditions and case-insensitive string containment", () => {
    const ast: SegmentGroup = {
      logic: "OR",
      conditions: [
        { field: "firstName", operator: "contains", value: "Alex" },
        { field: "lastName", operator: "contains", value: "Kato" },
      ],
    };

    const compiled = SegmentCompiler.compile(ast, testUserId);

    expect(compiled).toEqual({
      AND: [
        { userId: testUserId },
        {
          OR: [
            { firstName: { contains: "Alex", mode: "insensitive" } },
            { lastName: { contains: "Kato", mode: "insensitive" } },
          ],
        },
      ],
    });
  });

  it("should compile tag relations using Prisma nested relation filters", () => {
    const ast: SegmentGroup = {
      logic: "AND",
      conditions: [
        { field: "tags", operator: "in", value: ["tag-vip", "tag-retail"] },
      ],
    };

    const compiled = SegmentCompiler.compile(ast, testUserId);

    expect(compiled).toEqual({
      AND: [
        { userId: testUserId },
        {
          AND: [
            {
              tags: {
                some: {
                  contactTagId: { in: ["tag-vip", "tag-retail"] },
                },
              },
            },
          ],
        },
      ],
    });
  });

  it("should reject disallowed fields to protect against arbitrary column queries", () => {
    const maliciousAst = {
      logic: "AND" as const,
      conditions: [
        { field: "passwordHash" as never, operator: "equals" as const, value: "secret" },
      ],
    };

    expect(() => SegmentCompiler.compile(maliciousAst, testUserId)).toThrow(
      /Unsupported field: passwordHash/
    );
  });

  it("should reject invalid operators for tags", () => {
    const invalidTagAst = {
      logic: "AND" as const,
      conditions: [
        { field: "tags" as const, operator: "equals" as never, value: "tag-1" },
      ],
    };

    expect(() => SegmentCompiler.compile(invalidTagAst, testUserId)).toThrow(
      /Unsupported operator equals for field tags/
    );
  });
});
