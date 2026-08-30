import { slugify, truncate, capitalize, getInitials } from '@/utils/string'

describe('String Utils', () => {
  describe('slugify', () => {
    it('converts string to slug format', () => {
      expect(slugify('Hello World!')).toBe('hello-world')
      expect(slugify('Some-Text--Here')).toBe('some-text-here')
      expect(slugify(' special  characters *&^')).toBe('special-characters')
    })
  })

  describe('truncate', () => {
    it('truncates long string and adds ellipsis', () => {
      expect(truncate('Hello world', 5)).toBe('Hello...')
    })

    it('does not truncate string shorter than limit', () => {
      expect(truncate('Hello', 10)).toBe('Hello')
    })
  })

  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('WORLD')).toBe('World')
    })
  })

  describe('getInitials', () => {
    it('gets initials from name', () => {
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('Jane')).toBe('JA')
      expect(getInitials('John Robert Doe')).toBe('JD') // Taking first and last
    })
  })
})
