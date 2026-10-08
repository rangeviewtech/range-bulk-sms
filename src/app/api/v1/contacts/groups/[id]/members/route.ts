import { NextRequest, NextResponse } from 'next/server';
import { getMasterGroupMembers } from '@/lib/contacts/master-directory';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const members = getMasterGroupMembers(params.id);
    return NextResponse.json({ success: true, members });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
