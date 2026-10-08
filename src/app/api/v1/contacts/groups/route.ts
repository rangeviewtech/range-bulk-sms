import { NextRequest, NextResponse } from 'next/server';
import { getMasterGroups } from '@/lib/contacts/master-directory';

export async function GET(req: NextRequest) {
  try {
    const groups = getMasterGroups();
    return NextResponse.json({ success: true, groups });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
