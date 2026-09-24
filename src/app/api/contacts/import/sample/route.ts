import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SAMPLE_CSV_CONTENT = `Phone Number,First Name,Last Name,Email
+256700123456,John,Mukasa,john.mukasa@example.com
+256772987654,Sarah,Nsubuga,sarah.n@example.com
+256752345678,David,Kato,david.kato@example.com
+254712345678,Amina,Mwangi,amina.m@safaricom.co.ke
+256784567890,Esther,Akello,esther.akello@example.com
+255754123456,Juma,Hassan,juma.hassan@vodacom.co.tz
+250788123456,Jean-Paul,Habimana,habimana.jp@bk.rw
+447911123456,Oliver,Smith,oliver.smith@example.co.uk`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format');

  if (format === 'xlsx') {
    const filePath = path.join(process.cwd(), 'public', 'sample-contacts.xlsx');
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="sample-contacts.xlsx"',
          'Cache-Control': 'no-cache',
        },
      });
    }
  }

  return new NextResponse(SAMPLE_CSV_CONTENT, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sample-contacts.csv"',
      'Cache-Control': 'no-cache',
    },
  });
}

