import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Starting database seed...')

  // 1. Create Core Permissions
  const permissions = [
    // Users
    { action: 'users.read', description: 'Can view users' },
    { action: 'users.create', description: 'Can create users' },
    { action: 'users.update', description: 'Can update users' },
    { action: 'users.delete', description: 'Can delete users' },
    // Roles
    { action: 'roles.read', description: 'Can view roles and permissions' },
    { action: 'roles.manage', description: 'Can manage roles and permissions' },
    // Settings
    { action: 'settings.read', description: 'Can view application settings' },
    { action: 'settings.manage', description: 'Can manage application settings' },
    // Audit Logs
    { action: 'audit_logs.read', description: 'Can view audit logs' },
    // SMS Core
    { action: 'sms.send', description: 'Can send SMS messages' },
    { action: 'sms.schedule', description: 'Can schedule SMS messages' },
    { action: 'sms.view', description: 'Can view SMS history' },
    // Campaigns
    { action: 'campaigns.create', description: 'Can create campaigns' },
    { action: 'campaigns.manage', description: 'Can manage all campaigns' },
    // Contacts
    { action: 'contacts.view', description: 'Can view contacts' },
    { action: 'contacts.manage', description: 'Can manage contacts' },
    { action: 'contacts.import', description: 'Can import contacts' },
    // Sender IDs
    { action: 'sender_ids.view', description: 'Can view sender IDs' },
    { action: 'sender_ids.manage', description: 'Can manage sender IDs' },
    { action: 'sender_ids.approve', description: 'Can approve sender ID applications' },
    // Wallet
    { action: 'wallet.view', description: 'Can view wallet balance' },
    { action: 'wallet.manage', description: 'Can manage wallet (deposits, adjustments)' },
    // Clients & Agents
    { action: 'clients.view', description: 'Can view clients' },
    { action: 'clients.manage', description: 'Can manage clients' },
    { action: 'agents.view', description: 'Can view agents' },
    { action: 'agents.manage', description: 'Can manage agents' },
    // Commissions
    { action: 'commissions.view', description: 'Can view commissions' },
    { action: 'commissions.manage', description: 'Can manage commissions' },
    // System & Support
    { action: 'api_keys.manage', description: 'Can manage API keys' },
    { action: 'webhooks.manage', description: 'Can manage webhooks' },
    { action: 'reports.view', description: 'Can view reports' },
    { action: 'providers.manage', description: 'Can manage SMS providers' },
    { action: 'pricing.manage', description: 'Can manage SMS pricing' },
    { action: 'support.view', description: 'Can view support tickets' },
    { action: 'support.manage', description: 'Can manage support tickets' },
    { action: 'system.monitor', description: 'Can view system monitoring' },
  ]

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { action: p.action },
      update: { description: p.description },
      create: p,
    })
  }

  // 2. Create Default Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Full system administrator' },
  })

  const _userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER', description: 'Standard authenticated user' },
  })

  const clientRole = await prisma.role.upsert({
    where: { name: 'CLIENT' },
    update: {},
    create: { name: 'CLIENT', description: 'Standard SMS client' },
  })

  const agentRole = await prisma.role.upsert({
    where: { name: 'AGENT' },
    update: {},
    create: { name: 'AGENT', description: 'Reseller or agent' },
  })

  // 3. Assign Permissions to Roles
  const allPermissions = await prisma.permission.findMany()
  
  // Admin gets all permissions
  for (const p of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: p.id,
      },
    })
  }

  // User gets basic permissions (e.g., none of the admin ones for now, just to show how it's done)
  // Real apps might grant specific ones.

  // Assign permissions to CLIENT
  const clientPermissions = [
    'sms.send', 'sms.schedule', 'sms.view', 'campaigns.create',
    'contacts.view', 'contacts.manage', 'contacts.import',
    'sender_ids.view', 'wallet.view', 'api_keys.manage',
    'webhooks.manage', 'reports.view', 'support.view'
  ]
  for (const action of clientPermissions) {
    const perm = allPermissions.find(p => p.action === action)
    if (perm) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: clientRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: clientRole.id, permissionId: perm.id },
      })
    }
  }

  // Assign permissions to AGENT
  const agentPermissions = [
    'clients.view', 'clients.manage', 'commissions.view',
    'reports.view', 'sms.view', 'support.view'
  ]
  for (const action of agentPermissions) {
    const perm = allPermissions.find(p => p.action === action)
    if (perm) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: agentRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: agentRole.id, permissionId: perm.id },
      })
    }
  }

  // 4. Create Development Admin User
  if (process.env.NODE_ENV === 'development') {
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Password123!'
    
    console.log(`⚠️ Creating development admin: ${adminEmail}`)
    const passwordHash = await bcrypt.hash(adminPassword, 12)

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        passwordHash, // Reset password to env var in case it changed
      },
      create: {
        email: adminEmail,
        name: 'System Admin',
        passwordHash,
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
      },
    })

    // Assign ADMIN role
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: admin.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    })
  }

  // 5. Seed defaults (Provider, Pricing, Commission Rule)
  await prisma.smsProvider.upsert({
    where: { name: 'pandora' },
    update: {},
    create: {
      name: 'pandora',
      displayName: 'Pandora Networks',
      type: 'HTTP',
      baseUrl: 'https://www.sms.thepandoranetworks.com/API/send_sms/',
      isActive: true,
      priority: 1,
      supportsDlr: true,
      costPerSms: 35.0,
      maxThroughput: 500,
    },
  })

  await prisma.smsProvider.upsert({
    where: { name: 'africas-talking' },
    update: {},
    create: {
      name: 'africas-talking',
      displayName: "Africa's Talking",
      type: 'HTTP',
      baseUrl: 'https://api.africastalking.com/version1/messaging',
      isActive: true,
      priority: 2,
      supportsDlr: true,
      costPerSms: 38.0,
      maxThroughput: 300,
    },
  })

  await prisma.smsProvider.upsert({
    where: { name: 'twilio' },
    update: {},
    create: {
      name: 'twilio',
      displayName: 'Twilio Enterprise Gateway',
      type: 'HTTP',
      baseUrl: 'https://api.twilio.com/2010-04-01/Accounts',
      isActive: true,
      priority: 3,
      supportsDlr: true,
      costPerSms: 55.0,
      maxThroughput: 1000,
    },
  })

  // Country Pricing Rules
  const pricingData = [
    { countryCode: '+256', countryName: 'Uganda', networkCode: 'MTN', networkName: 'MTN Uganda', costPerSms: 32.0, sellingPrice: 48.0, currency: 'UGX', isDefault: false },
    { countryCode: '+256', countryName: 'Uganda', networkCode: 'AIRTEL', networkName: 'Airtel Uganda', costPerSms: 33.0, sellingPrice: 50.0, currency: 'UGX', isDefault: false },
    { countryCode: '+256', countryName: 'Uganda', costPerSms: 35.0, sellingPrice: 50.0, currency: 'UGX', isDefault: true },
    { countryCode: '+254', countryName: 'Kenya', costPerSms: 40.0, sellingPrice: 65.0, currency: 'KES', isDefault: true },
    { countryCode: '+255', countryName: 'Tanzania', costPerSms: 45.0, sellingPrice: 70.0, currency: 'TZS', isDefault: true },
    { countryCode: '+250', countryName: 'Rwanda', costPerSms: 50.0, sellingPrice: 80.0, currency: 'RWF', isDefault: true },
    { countryCode: '+1', countryName: 'United States & Canada', costPerSms: 0.0075, sellingPrice: 0.0150, currency: 'USD', isDefault: true },
    { countryCode: '+44', countryName: 'United Kingdom', costPerSms: 0.0120, sellingPrice: 0.0250, currency: 'GBP', isDefault: true },
  ]

  for (const price of pricingData) {
    const existing = await prisma.smsPricing.findFirst({
      where: { countryCode: price.countryCode, networkCode: price.networkCode || null }
    })
    if (!existing) {
      await prisma.smsPricing.create({ data: price })
    }
  }

  // Default Commission Rule
  const defaultRuleExists = await prisma.commissionRule.findFirst({ where: { name: 'Default Agent Commission' } })
  if (!defaultRuleExists) {
    await prisma.commissionRule.create({
      data: {
        name: 'Default Agent Commission',
        type: 'PERCENTAGE',
        rate: 5.0,
        isDefault: true,
      },
    })
  }

  // 6. Seed Demo Agent & Clients
  const demoAgentPassword = await bcrypt.hash('Password123!', 12)
  const agentUser = await prisma.user.upsert({
    where: { email: 'agent@example.com' },
    update: {},
    create: {
      email: 'agent@example.com',
      name: 'Apex Resellers Team',
      passwordHash: demoAgentPassword,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  })

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: agentUser.id, roleId: agentRole.id } },
    update: {},
    create: { userId: agentUser.id, roleId: agentRole.id },
  })

  const agent = await prisma.agent.upsert({
    where: { userId: agentUser.id },
    update: {},
    create: {
      userId: agentUser.id,
      companyName: 'Apex Telecommunications Ltd',
      commissionType: 'PERCENTAGE',
      commissionRate: 7.5,
      totalEarnings: 2070000,
      pendingPayout: 350000,
      bankName: 'Stanbic Bank Uganda',
      bankAccount: '9030012345678',
      mobileMoney: '+256701234567',
    },
  })

  await prisma.wallet.upsert({
    where: { userId: agentUser.id },
    update: {},
    create: {
      userId: agentUser.id,
      agentId: agent.id,
      balance: 1720000,
      currency: 'UGX',
    }
  })

  // Seed Demo Clients
  const clientUser1 = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      name: 'John Mukasa',
      passwordHash: demoAgentPassword,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  })

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: clientUser1.id, roleId: clientRole.id } },
    update: {},
    create: { userId: clientUser1.id, roleId: clientRole.id },
  })

  const client1 = await prisma.client.upsert({
    where: { userId: clientUser1.id },
    update: {},
    create: {
      userId: clientUser1.id,
      agentId: agent.id,
      companyName: 'Acme Global Corp',
      industry: 'Retail & E-commerce',
      referralSource: 'Apex Telecommunications',
    },
  })

  await prisma.wallet.upsert({
    where: { userId: clientUser1.id },
    update: {},
    create: {
      userId: clientUser1.id,
      clientId: client1.id,
      balance: 1540000,
      smsCredits: 30800,
      currency: 'UGX',
    }
  })

  const clientUser2 = await prisma.user.upsert({
    where: { email: 'finserve@example.com' },
    update: {},
    create: {
      email: 'finserve@example.com',
      name: 'Sarah Nsubuga',
      passwordHash: demoAgentPassword,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  })

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: clientUser2.id, roleId: clientRole.id } },
    update: {},
    create: { userId: clientUser2.id, roleId: clientRole.id },
  })

  const client2 = await prisma.client.upsert({
    where: { userId: clientUser2.id },
    update: {},
    create: {
      userId: clientUser2.id,
      agentId: agent.id,
      companyName: 'FinServe Africa Ltd',
      industry: 'Fintech & Microfinance',
    },
  })

  await prisma.wallet.upsert({
    where: { userId: clientUser2.id },
    update: {},
    create: {
      userId: clientUser2.id,
      clientId: client2.id,
      balance: 4850000,
      smsCredits: 97000,
      currency: 'UGX',
    }
  })

  // 7. Seed Demo Sender IDs
  const adminUser = await prisma.user.findFirstOrThrow({ where: { email: 'admin@example.com' } });
  const senderIdsToSeed = [
    { senderId: 'RANGESMS', userId: adminUser.id, status: 'APPROVED' as const, purpose: 'System notifications and alerts' },
    { senderId: 'ACMEALERT', userId: clientUser1.id, clientId: client1.id, status: 'APPROVED' as const, purpose: 'Order tracking and customer verification OTPs' },
    { senderId: 'FINSERVE', userId: clientUser2.id, clientId: client2.id, status: 'PENDING' as const, purpose: 'Loan repayment reminders and transaction receipts' },
    { senderId: 'QUICKCASH', userId: clientUser1.id, clientId: client1.id, status: 'REJECTED' as const, purpose: 'Marketing promotions', rejectionReason: 'Regulatory compliance: Financial Sender ID requires NDA and UCC verification license.' },
  ]

  for (const s of senderIdsToSeed) {
    await prisma.senderId.upsert({
      where: { senderId_userId: { senderId: s.senderId, userId: s.userId } },
      update: {},
      create: s,
    })
  }

  // 8. Seed Demo Commissions
  const existingCommissions = await prisma.commission.findFirst({ where: { agentId: agent.id } })
  if (!existingCommissions) {
    await prisma.commission.createMany({
      data: [
        {
          agentId: agent.id,
          clientId: client1.id,
          messageCount: 50000,
          totalSmsValue: 2500000,
          commissionRate: 7.5,
          commissionType: 'PERCENTAGE',
          amount: 187500,
          status: 'PENDING',
        },
        {
          agentId: agent.id,
          clientId: client2.id,
          messageCount: 80000,
          totalSmsValue: 4000000,
          commissionRate: 7.5,
          commissionType: 'PERCENTAGE',
          amount: 300000,
          status: 'APPROVED',
          approvedBy: 'System Admin',
          approvedAt: new Date(),
        },
        {
          agentId: agent.id,
          clientId: client1.id,
          messageCount: 120000,
          totalSmsValue: 6000000,
          commissionRate: 7.5,
          commissionType: 'PERCENTAGE',
          amount: 450000,
          status: 'PAID',
          approvedBy: 'System Admin',
          approvedAt: new Date(Date.now() - 30 * 86400000),
          paidAt: new Date(Date.now() - 28 * 86400000),
        },
      ]
    })
  }

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: adminUser.id,
        actorType: 'USER',
        timestamp: new Date(),
        eventName: 'AUTH_LOGIN',
        resourceType: 'User',
        resourceId: adminUser.id,
        category: 'SECURITY',
        outcome: 'SUCCESS',
        severity: 'INFO',
      },
      {
        actorId: adminUser.id,
        actorType: 'USER',
        timestamp: new Date(),
        eventName: 'UPDATE_PRICING',
        resourceType: 'SmsPricing',
        category: 'APPLICATION',
        outcome: 'SUCCESS',
        severity: 'INFO',
      },
      {
        actorId: adminUser.id,
        actorType: 'USER',
        timestamp: new Date(),
        eventName: 'APPROVE_SENDER_ID',
        resourceType: 'SenderId',
        category: 'APPLICATION',
        outcome: 'SUCCESS',
        severity: 'INFO',
      },
      {
        actorId: adminUser.id,
        actorType: 'USER',
        timestamp: new Date(),
        eventName: 'CREATE_PROVIDER',
        resourceType: 'SmsProvider',
        category: 'APPLICATION',
        outcome: 'SUCCESS',
        severity: 'INFO',
      },
    ]
  })

  console.log('✅ Seeding completed.')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
