import { AppError, ValidationError, AuthenticationError, NotFoundError } from '@/lib/errors'

describe('Custom Errors', () => {
  describe('AppError', () => {
    it('creates an AppError with correct properties', () => {
      const error = new AppError('Something went wrong', 500, 'INTERNAL_ERROR')
      expect(error.message).toBe('Something went wrong')
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('INTERNAL_ERROR')
      expect(error.name).toBe('AppError')
    })
  })

  describe('ValidationError', () => {
    it('creates a ValidationError with 400 status', () => {
      const error = new ValidationError('Invalid input')
      expect(error.message).toBe('Invalid input')
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.name).toBe('ValidationError')
    })
  })

  describe('AuthenticationError', () => {
    it('creates an AuthenticationError with 401 status', () => {
      const error = new AuthenticationError('Not authenticated')
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('UNAUTHORIZED')
      expect(error.name).toBe('AuthenticationError')
    })
  })

  describe('NotFoundError', () => {
    it('creates a NotFoundError with 404 status', () => {
      const error = new NotFoundError('User not found')
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
      expect(error.name).toBe('NotFoundError')
    })
  })
})
