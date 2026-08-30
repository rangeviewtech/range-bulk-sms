import { formatCurrency, formatNumber, formatPercentage, formatFileSize } from '@/utils/format'

describe('Format Utils', () => {
  describe('formatCurrency', () => {
    it('formats USD correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56')
    })
    
    it('formats EUR correctly', () => {
      const formatted = formatCurrency(1234.56, 'EUR')
      expect(formatted).toContain('1,234.56')
      expect(formatted).toContain('€')
    })
  })

  describe('formatNumber', () => {
    it('formats large numbers with commas', () => {
      expect(formatNumber(1234567.89)).toBe('1,234,567.89')
    })

    it('formats without fractions', () => {
      expect(formatNumber(1234)).toBe('1,234')
    })
  })

  describe('formatPercentage', () => {
    it('formats percentages correctly', () => {
      expect(formatPercentage(0.155)).toBe('15.5%')
      expect(formatPercentage(1)).toBe('100%')
    })
  })

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    })
  })
})
