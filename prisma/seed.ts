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
      supportsDlr: false,
      costPerSms: 35.0,
    },
  })

  const defaultPricingExists = await prisma.smsPricing.findFirst({ where: { countryCode: '+256', isDefault: true } })
  if (!defaultPricingExists) {
    await prisma.smsPricing.create({
      data: {
        countryCode: '+256',
        countryName: 'Uganda',
        costPerSms: 35.0,
        sellingPrice: 50.0,
        currency: 'UGX',
        isDefault: true,
      },
    })
  }

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
