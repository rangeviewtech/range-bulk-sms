import { Prisma } from "@/lib/prisma";

export type SegmentOperator = "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan" | "in" | "notIn";

export interface SegmentRule {
  field: "country" | "createdAt" | "optedOut" | "tags" | "firstName" | "lastName";
  operator: SegmentOperator;
  value: unknown;
}

export interface SegmentGroup {
  logic: "AND" | "OR";
  conditions: (SegmentRule | SegmentGroup)[];
}

/**
 * Validates and compiles a JSON AST into a Prisma `ContactWhereInput`
 * This ensures we never construct raw SQL queries directly, preventing injection.
 */
export class SegmentCompiler {
  static compile(group: SegmentGroup, userId: string): Prisma.ContactWhereInput {
    const compiledGroup = this.compileGroup(group);
    
    // Always restrict to the tenant's contacts
    return {
      AND: [
        { userId },
        compiledGroup
      ]
    };
  }

  private static compileGroup(group: SegmentGroup): Prisma.ContactWhereInput {
    const conditions = group.conditions.map(condition => {
      if ('logic' in condition) {
        return this.compileGroup(condition);
      } else {
        return this.compileRule(condition);
      }
    });

    if (group.logic === "AND") {
      return { AND: conditions };
    } else if (group.logic === "OR") {
      return { OR: conditions };
    }

    throw new Error(`Unsupported logic operator: ${group.logic}`);
  }

  private static compileRule(rule: SegmentRule): Prisma.ContactWhereInput {
    const { field, operator, value } = rule;

    // Type checking the field protects against arbitrary column querying
    const allowedFields = ["country", "createdAt", "optedOut", "firstName", "lastName"];
    
    if (field === "tags") {
      // Special relationship handling for tags
      if (operator === "in") {
        return {
          tags: {
            some: {
              contactTagId: { in: Array.isArray(value) ? value : [value] }
            }
          }
        };
      }
      throw new Error(`Unsupported operator ${operator} for field tags`);
    }

    if (!allowedFields.includes(field)) {
      throw new Error(`Unsupported field: ${field}`);
    }

    let prismaCondition: Record<string, unknown> | unknown = {};

    switch (operator) {
      case "equals":
        prismaCondition = value;
        break;
      case "notEquals":
        prismaCondition = { not: value };
        break;
      case "contains":
        prismaCondition = { contains: value, mode: "insensitive" };
        break;
      case "greaterThan":
        prismaCondition = { gt: value };
        break;
      case "lessThan":
        prismaCondition = { lt: value };
        break;
      case "in":
        prismaCondition = { in: Array.isArray(value) ? value : [value] };
        break;
      case "notIn":
        prismaCondition = { notIn: Array.isArray(value) ? value : [value] };
        break;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }

    return { [field]: prismaCondition };
  }
}
