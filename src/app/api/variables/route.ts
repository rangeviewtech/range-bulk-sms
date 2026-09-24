import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/session';
import {
  SYSTEM_VARIABLES,
  MAX_CUSTOM_VARIABLES,
  checkVariableConflict,
} from '@/lib/sms/custom-variables';
import { customVariableSchema } from '@/lib/validations/sms';

export async function GET() {
  try {
    const session = await requireAuth();

    const dbVariables = await prisma.customVariable.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' }
    });

    const customVariables = dbVariables.map(v => ({
      ...v,
      isSystem: false
    }));

    return NextResponse.json({
      success: true,
      systemVariables: SYSTEM_VARIABLES,
      customVariables,
      totalCustom: customVariables.length,
      maxCustomLimit: MAX_CUSTOM_VARIABLES,
      remainingSlots: Math.max(0, MAX_CUSTOM_VARIABLES - customVariables.length),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch variables';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    const currentCount = await prisma.customVariable.count({
      where: { userId: session.userId }
    });

    if (currentCount >= MAX_CUSTOM_VARIABLES) {
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

    const existingVars = await prisma.customVariable.findMany({
      where: { userId: session.userId }
    });
    
    const mappedExisting = existingVars.map(v => ({
      id: v.id,
      key: v.key,
      label: v.label,
      description: v.description || undefined,
      fallbackValue: v.fallbackValue || undefined,
      sampleValue: v.sampleValue || '',
      dataType: v.dataType as any,
      isSystem: false,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    }));

    const conflict = checkVariableConflict(
      validated.label,
      validated.key,
      [...SYSTEM_VARIABLES, ...mappedExisting]
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

    const newVar = await prisma.customVariable.create({
      data: {
        userId: session.userId,
        key: validated.key,
        label: validated.label,
        description: validated.description,
        fallbackValue: validated.fallbackValue,
        sampleValue: validated.sampleValue,
        dataType: validated.dataType,
      }
    });

    return NextResponse.json(
      {
        success: true,
        variable: { ...newVar, isSystem: false },
        totalCustom: currentCount + 1,
        remainingSlots: MAX_CUSTOM_VARIABLES - (currentCount + 1),
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
    const session = await requireAuth();
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Variable ID is required' },
        { status: 400 }
      );
    }

    const current = await prisma.customVariable.findFirst({
      where: { id, userId: session.userId }
    });

    if (!current) {
      return NextResponse.json(
        { success: false, error: 'Custom variable not found' },
        { status: 404 }
      );
    }

    const existingVars = await prisma.customVariable.findMany({
      where: { userId: session.userId }
    });

    const mappedExisting = existingVars.map(v => ({
      id: v.id,
      key: v.key,
      label: v.label,
      description: v.description || undefined,
      fallbackValue: v.fallbackValue || undefined,
      sampleValue: v.sampleValue || '',
      dataType: v.dataType as any,
      isSystem: false,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    }));

    const targetLabel = data.label ?? current.label;
    const targetKey = data.key ?? current.key;
    
    const conflict = checkVariableConflict(
      targetLabel,
      targetKey,
      [...SYSTEM_VARIABLES, ...mappedExisting],
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

    const updated = await prisma.customVariable.update({
      where: { id },
      data: {
        label: targetLabel,
        key: targetKey,
        description: data.description ?? current.description,
        fallbackValue: data.fallbackValue ?? current.fallbackValue,
        sampleValue: data.sampleValue ?? current.sampleValue,
        dataType: data.dataType ?? current.dataType,
      }
    });

    return NextResponse.json({
      success: true,
      variable: { ...updated, isSystem: false },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating variable';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Variable ID is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.customVariable.findFirst({
      where: { id, userId: session.userId }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Custom variable not found or already deleted' },
        { status: 404 }
      );
    }

    await prisma.customVariable.delete({
      where: { id }
    });
    
    const count = await prisma.customVariable.count({
      where: { userId: session.userId }
    });

    return NextResponse.json({
      success: true,
      message: 'Custom variable deleted successfully',
      totalCustom: count,
      remainingSlots: MAX_CUSTOM_VARIABLES - count,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting variable';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
