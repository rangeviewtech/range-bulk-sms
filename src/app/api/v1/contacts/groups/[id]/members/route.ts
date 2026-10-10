import { NextRequest, NextResponse } from 'next/server';
import { getMasterGroupMembers } from '@/lib/contacts/master-directory';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const members = getMasterGroupMembers(id);
    return NextResponse.json({ success: true, members });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to load group members.' }, { status: 500 });
  }
}
