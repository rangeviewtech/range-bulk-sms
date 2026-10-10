import { NextResponse } from 'next/server';
import { getMasterGroups } from '@/lib/contacts/master-directory';

export async function GET() {
  try {
    const groups = getMasterGroups();
    return NextResponse.json({ success: true, groups });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to load contact groups.' }, { status: 500 });
  }
}
