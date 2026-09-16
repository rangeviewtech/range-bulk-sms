const fs = require('fs');
const path = require('path');

const routes = [
  {
    path: 'webhooks/sms/delivery/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Parse payload, update Message and MessageRecipient status
    // Trigger client webhooks if configured
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
`
  },
  {
    path: 'webhooks/payment/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Update Transaction status and add funds to Wallet
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
`
  },
  {
    path: 'admin/users/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.userId, 'users.read') || await hasPermission(session.userId, 'users.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const users = await prisma.user.findMany();
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.userId, 'users.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return NextResponse.json({ success: true });
}
`
  },
  {
    path: 'admin/clients/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.userId, 'clients.view') || await hasPermission(session.userId, 'clients.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return NextResponse.json({ clients: [] });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.userId, 'clients.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return NextResponse.json({ success: true });
}
`
  },
  {
    path: 'admin/agents/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.userId, 'agents.view') || await hasPermission(session.userId, 'agents.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return NextResponse.json({ agents: [] });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.userId, 'agents.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return NextResponse.json({ success: true });
}
`
  },
  {
    path: 'admin/providers/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';
import { smsProviderSchema } from '@/lib/validations/sender-id';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.userId, 'providers.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return NextResponse.json({ providers: [] });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.userId, 'providers.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const parsed = smsProviderSchema.parse(body);
    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}
`
  },
  {
    path: 'admin/providers/[id]/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';
import { smsProviderSchema } from '@/lib/validations/sender-id';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.userId, 'providers.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const parsed = smsProviderSchema.parse(body);
    return NextResponse.json({ success: true, id: params.id, data: parsed });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}
`
  },
  {
    path: 'admin/pricing/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.userId, 'pricing.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return NextResponse.json({ pricing: [] });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.userId, 'pricing.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return NextResponse.json({ success: true });
}
`
  },
  {
    path: 'admin/pricing/[id]/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.userId, 'pricing.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return NextResponse.json({ success: true, id: params.id });
}
`
  },
  {
    path: 'admin/commissions/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.userId, 'commissions.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return NextResponse.json({ commissions: [] });
}
`
  },
  {
    path: 'admin/commissions/[id]/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.userId, 'commissions.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return NextResponse.json({ success: true, id: params.id });
}
`
  },
  {
    path: 'admin/sender-ids/[id]/approve/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';
import { senderIdActionSchema } from '@/lib/validations/sender-id';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.userId, 'sender_ids.approve'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const parsed = senderIdActionSchema.parse(body);
    return NextResponse.json({ success: true, id: params.id, data: parsed });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}
`
  },
  {
    path: 'admin/system/route.ts',
    content: `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.userId, 'system.monitor'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return NextResponse.json({ status: 'ok', providerHealth: [], queueStats: {} });
}
`
  }
];

const basePath = path.join(process.cwd(), 'src/app/api');

routes.forEach(route => {
  const fullPath = path.join(basePath, route.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, route.content);
  console.log('Created:', fullPath);
});
