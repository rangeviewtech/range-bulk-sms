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
