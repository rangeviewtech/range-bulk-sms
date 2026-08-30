import { isValidEmail, isValidUrl, isValidPhone, isStrongPassword } from '@/utils/validation'

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('validates emails correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
      
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
    })
  })

  describe('isValidUrl', () => {
    it('validates URLs correctly', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://sub.domain.org/path?q=1')).toBe(true)
      
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('ftp://domain.com')).toBe(true) // URL constructor accepts ftp
    })
  })

  describe('isValidPhone', () => {
    it('validates phone numbers', () => {
      expect(isValidPhone('+1234567890')).toBe(true)
      expect(isValidPhone('123-456-7890')).toBe(true)
      
      expect(isValidPhone('abc')).toBe(false)
    })
  })

  describe('isStrongPassword', () => {
    it('validates strong passwords', () => {
      // Assuming rules: 8+ chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special
      expect(isStrongPassword('StrongP@ssw0rd!')).toBe(true)
      
      expect(isStrongPassword('weak')).toBe(false)
      expect(isStrongPassword('nouppercase1!')).toBe(false)
      expect(isStrongPassword('NOLOWERCASE1!')).toBe(false)
      expect(isStrongPassword('NoNumberInPass!')).toBe(false)
    })
  })
})
