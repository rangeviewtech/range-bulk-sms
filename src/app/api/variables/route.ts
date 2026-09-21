import { NextRequest, NextResponse } from 'next/server';
import {
  SYSTEM_VARIABLES,
  DEFAULT_CUSTOM_VARIABLES,
  MAX_CUSTOM_VARIABLES,
  SmsVariable,
  checkVariableConflict,
} from '@/lib/sms/custom-variables';
import { customVariableSchema } from '@/lib/validations/sms';

// In-memory server-side fallback store for active session
let inMemoryCustomVariables: SmsVariable[] = [...DEFAULT_CUSTOM_VARIABLES];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      systemVariables: SYSTEM_VARIABLES,
      customVariables: inMemoryCustomVariables,
      totalCustom: inMemoryCustomVariables.length,
      maxCustomLimit: MAX_CUSTOM_VARIABLES,
      remainingSlots: Math.max(0, MAX_CUSTOM_VARIABLES - inMemoryCustomVariables.length),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch variables';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce 20 custom variables cap
    if (inMemoryCustomVariables.length >= MAX_CUSTOM_VARIABLES) {
      return NextResponse.json(
        {
          success: false,
          error: `You have reached the maximum quota of ${MAX_CUSTOM_VARIABLES} custom variables. Delete an existing custom variable to create a new one.`,
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = customVariableSchema.parse(body);

    // 2. Check for duplicate label or key across system and custom variables
    const conflict = checkVariableConflict(
      validated.label,
      validated.key,
      [...SYSTEM_VARIABLES, ...inMemoryCustomVariables]
    );
    if (conflict.isDuplicate) {
      return NextResponse.json(
        {
          success: false,
          error: conflict.errorMessage || 'Variable conflicts with an existing variable.',
        },
        { status: 400 }
      );
    }

    const newVar: SmsVariable = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      key: validated.key,
      label: validated.label,
      description: validated.description,
      fallbackValue: validated.fallbackValue,
      sampleValue: validated.sampleValue,
      dataType: validated.dataType,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryCustomVariables.push(newVar);

    return NextResponse.json(
      {
        success: true,
        variable: newVar,
        totalCustom: inMemoryCustomVariables.length,
        remainingSlots: MAX_CUSTOM_VARIABLES - inMemoryCustomVariables.length,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid request payload';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Variable ID is required' },
        { status: 400 }
      );
    }

    const index = inMemoryCustomVariables.findIndex((v) => v.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Custom variable not found' },
        { status: 404 }
      );
    }

    const current = inMemoryCustomVariables[index];

    // Check for duplicate label or key if changed
    const targetLabel = data.label ?? current.label;
    const targetKey = data.key ?? current.key;
    const conflict = checkVariableConflict(
      targetLabel,
      targetKey,
      [...SYSTEM_VARIABLES, ...inMemoryCustomVariables],
      id
    );
    if (conflict.isDuplicate) {
      return NextResponse.json(
        {
          success: false,
          error: conflict.errorMessage || 'Variable conflicts with an existing variable.',
        },
        { status: 400 }
      );
    }

    const updated: SmsVariable = {
      ...current,
      label: targetLabel,
      description: data.description ?? current.description,
      fallbackValue: data.fallbackValue ?? current.fallbackValue,
      sampleValue: data.sampleValue ?? current.sampleValue,
      dataType: data.dataType ?? current.dataType,
      updatedAt: new Date().toISOString(),
    };

    inMemoryCustomVariables[index] = updated;

    return NextResponse.json({
      success: true,
      variable: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating variable';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Variable ID is required' },
        { status: 400 }
      );
    }

    const exists = inMemoryCustomVariables.some((v) => v.id === id);
    if (!exists) {
      return NextResponse.json(
        { success: false, error: 'Custom variable not found or already deleted' },
        { status: 404 }
      );
    }

    inMemoryCustomVariables = inMemoryCustomVariables.filter((v) => v.id !== id);

    return NextResponse.json({
      success: true,
      message: 'Custom variable deleted successfully',
      totalCustom: inMemoryCustomVariables.length,
      remainingSlots: MAX_CUSTOM_VARIABLES - inMemoryCustomVariables.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting variable';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
