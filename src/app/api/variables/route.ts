import { NextRequest, NextResponse } from 'next/server';
import {
  SYSTEM_VARIABLES,
  DEFAULT_CUSTOM_VARIABLES,
  MAX_CUSTOM_VARIABLES,
  SmsVariable,
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

    // 2. Check for duplicate key in system variables
    const isSystemConflict = SYSTEM_VARIABLES.some(
      (v) => v.key.toLowerCase() === validated.key.toLowerCase()
    );
    if (isSystemConflict) {
      return NextResponse.json(
        {
          success: false,
          error: `The variable key "{{${validated.key}}}" is reserved by system built-in variables. Please choose another key.`,
        },
        { status: 400 }
      );
    }

    // 3. Check for duplicate key in existing custom variables
    const isCustomConflict = inMemoryCustomVariables.some(
      (v) => v.key.toLowerCase() === validated.key.toLowerCase()
    );
    if (isCustomConflict) {
      return NextResponse.json(
        {
          success: false,
          error: `A custom variable with key "{{${validated.key}}}" already exists.`,
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
    const updated: SmsVariable = {
      ...current,
      label: data.label ?? current.label,
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
