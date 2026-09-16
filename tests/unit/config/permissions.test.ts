import { hasPermission, can } from '@/config/permissions'

describe('Permissions', () => {
  describe('hasPermission', () => {
    it('returns true if role has the specific permission', () => {
      // Assuming config defines 'admin' role has 'delete:user' permission
      expect(hasPermission('admin', 'delete:user')).toBe(true)
    })

    it('returns false if role lacks the permission', () => {
      expect(hasPermission('user', 'delete:user')).toBe(false)
    })
  })

  describe('can', () => {
    it('validates user object against action', () => {
      const adminUser = { id: 1, role: 'admin' }
      const normalUser = { id: 2, role: 'user' }
      
      expect(can(adminUser.role as 'admin').create('campaigns')).toBe(true)
      expect(can(normalUser.role as 'user').create('campaigns')).toBe(true)
      expect(can(normalUser.role as 'user').delete('campaigns')).toBe(false)
    })
  })
})
