import { formatDate, formatRelativeDate, isDateInPast, isDateInFuture } from '@/utils/date'
import { subDays, addDays, formatDistanceToNow } from 'date-fns'

describe('Date Utils', () => {
  const mockDate = new Date('2024-01-15T12:00:00Z')

  describe('formatDate', () => {
    it('formats date correctly', () => {
      expect(formatDate(mockDate)).toBe('Jan 15, 2024')
    })
    
    it('supports custom formats', () => {
      expect(formatDate(mockDate, 'yyyy-MM-dd')).toBe('2024-01-15')
    })
  })

  describe('formatRelativeDate', () => {
    it('formats relative date correctly', () => {
      const pastDate = subDays(new Date(), 2)
      expect(formatRelativeDate(pastDate)).toBe(formatDistanceToNow(pastDate, { addSuffix: true }))
    })
  })

  describe('isDateInPast', () => {
    it('returns true for past dates', () => {
      expect(isDateInPast(subDays(new Date(), 1))).toBe(true)
    })
    
    it('returns false for future dates', () => {
      expect(isDateInPast(addDays(new Date(), 1))).toBe(false)
    })
  })

  describe('isDateInFuture', () => {
    it('returns true for future dates', () => {
      expect(isDateInFuture(addDays(new Date(), 1))).toBe(true)
    })
    
    it('returns false for past dates', () => {
      expect(isDateInFuture(subDays(new Date(), 1))).toBe(false)
    })
  })
})
