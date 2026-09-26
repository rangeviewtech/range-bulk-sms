import { describe, it, expect } from 'vitest';
import {
  resolveVariableDataType,
  validateVariableValue,
  isValidCalendarDate,
  getVariablePlaceholder,
} from '../lib/sms/variable-validation';

describe('Variable Validation Engine', () => {
  describe('resolveVariableDataType', () => {
    it('infers DATE for date-like variable keys', () => {
      expect(resolveVariableDataType('date')).toBe('DATE');
      expect(resolveVariableDataType('dueDate')).toBe('DATE');
      expect(resolveVariableDataType('expiry_date')).toBe('DATE');
      expect(resolveVariableDataType('deadline')).toBe('DATE');
      expect(resolveVariableDataType('appointmentDate')).toBe('DATE');
    });

    it('infers CURRENCY for financial/amount variable keys', () => {
      expect(resolveVariableDataType('amount')).toBe('CURRENCY');
      expect(resolveVariableDataType('price')).toBe('CURRENCY');
      expect(resolveVariableDataType('balance')).toBe('CURRENCY');
      expect(resolveVariableDataType('fee')).toBe('CURRENCY');
      expect(resolveVariableDataType('total_cost')).toBe('CURRENCY');
    });

    it('infers NUMBER for quantity/counter variable keys', () => {
      expect(resolveVariableDataType('quantity')).toBe('NUMBER');
      expect(resolveVariableDataType('qty')).toBe('NUMBER');
      expect(resolveVariableDataType('count')).toBe('NUMBER');
      expect(resolveVariableDataType('score')).toBe('NUMBER');
    });

    it('infers PHONE for telephone variable keys', () => {
      expect(resolveVariableDataType('phone')).toBe('PHONE');
      expect(resolveVariableDataType('mobileNumber')).toBe('PHONE');
      expect(resolveVariableDataType('tel')).toBe('PHONE');
    });

    it('infers URL for link variable keys', () => {
      expect(resolveVariableDataType('url')).toBe('URL');
      expect(resolveVariableDataType('trackingUrl')).toBe('URL');
      expect(resolveVariableDataType('portal_link')).toBe('URL');
    });

    it('infers TEXT for general names and custom tags', () => {
      expect(resolveVariableDataType('name')).toBe('TEXT');
      expect(resolveVariableDataType('firstName')).toBe('TEXT');
      expect(resolveVariableDataType('orderId')).toBe('TEXT');
      expect(resolveVariableDataType('company')).toBe('TEXT');
    });
  });

  describe('isValidCalendarDate', () => {
    it('validates YYYY-MM-DD ISO format accurately', () => {
      expect(isValidCalendarDate('2026-10-15').isValid).toBe(true);
      expect(isValidCalendarDate('2026-02-28').isValid).toBe(true);
      expect(isValidCalendarDate('2026-02-30').isValid).toBe(false); // Feb has max 28 days in 2026
      expect(isValidCalendarDate('2026-13-01').isValid).toBe(false); // Month 13 invalid
      expect(isValidCalendarDate('invalid-date').isValid).toBe(false);
    });

    it('validates DD/MM/YYYY format accurately', () => {
      expect(isValidCalendarDate('15/10/2026').isValid).toBe(true);
      expect(isValidCalendarDate('31/04/2026').isValid).toBe(false); // April has 30 days
    });

    it('validates text representations like Oct 15, 2026', () => {
      expect(isValidCalendarDate('Oct 15, 2026').isValid).toBe(true);
    });
  });

  describe('validateVariableValue', () => {
    it('detects missing values across all types', () => {
      const res = validateVariableValue('', 'TEXT', 'name');
      expect(res.isMissing).toBe(true);
      expect(res.isValid).toBe(false);
      expect(res.errorMessage).toBe('name is missing');

      const dateRes = validateVariableValue('   ', 'DATE', 'dueDate');
      expect(dateRes.isMissing).toBe(true);
      expect(dateRes.isValid).toBe(false);
    });

    it('validates DATE type values', () => {
      const valid = validateVariableValue('2026-10-15', 'DATE');
      expect(valid.isValid).toBe(true);
      expect(valid.isMissing).toBe(false);
      expect(valid.formattedValue).toBe('2026-10-15');

      const invalid = validateVariableValue('not-a-date', 'DATE');
      expect(invalid.isValid).toBe(false);
      expect(invalid.isMissing).toBe(false);
      expect(invalid.errorMessage).toContain('Invalid date');
    });

    it('validates NUMBER type values', () => {
      expect(validateVariableValue('100', 'NUMBER').isValid).toBe(true);
      expect(validateVariableValue('-45.5', 'NUMBER').isValid).toBe(true);
      expect(validateVariableValue('1,000', 'NUMBER').isValid).toBe(true);

      const invalid = validateVariableValue('abc', 'NUMBER');
      expect(invalid.isValid).toBe(false);
      expect(invalid.errorMessage).toContain('Must be a valid number');
    });

    it('validates CURRENCY type values', () => {
      expect(validateVariableValue('50000', 'CURRENCY').isValid).toBe(true);
      expect(validateVariableValue('50,000 UGX', 'CURRENCY').isValid).toBe(true);
      expect(validateVariableValue('$150.00', 'CURRENCY').isValid).toBe(true);
      expect(validateVariableValue('UGX 100,000', 'CURRENCY').isValid).toBe(true);

      const invalid = validateVariableValue('no-digits-here', 'CURRENCY');
      expect(invalid.isValid).toBe(false);
      expect(invalid.errorMessage).toContain('Must be a valid currency amount');
    });

    it('validates PHONE type values', () => {
      expect(validateVariableValue('+256700123456', 'PHONE').isValid).toBe(true);
      expect(validateVariableValue('0772123456', 'PHONE').isValid).toBe(true);

      const invalid = validateVariableValue('123', 'PHONE');
      expect(invalid.isValid).toBe(false);
      expect(invalid.errorMessage).toContain('Must be a valid phone number');
    });

    it('validates URL type values', () => {
      expect(validateVariableValue('https://range.ug/order/123', 'URL').isValid).toBe(true);
      expect(validateVariableValue('range.ug', 'URL').isValid).toBe(true);

      const invalid = validateVariableValue('not a url at all', 'URL');
      expect(invalid.isValid).toBe(false);
      expect(invalid.errorMessage).toContain('Must be a valid URL link');
    });

    it('validates TEXT type values', () => {
      expect(validateVariableValue('Sarah Namubiru', 'TEXT').isValid).toBe(true);
      expect(validateVariableValue('ORD-8941', 'TEXT').isValid).toBe(true);
    });
  });

  describe('getVariablePlaceholder', () => {
    it('returns appropriate placeholders for different data types', () => {
      expect(getVariablePlaceholder('dueDate', 'DATE')).toBe('YYYY-MM-DD');
      expect(getVariablePlaceholder('amount', 'CURRENCY')).toBe('e.g. 50,000 UGX');
      expect(getVariablePlaceholder('quantity', 'NUMBER')).toBe('e.g. 100');
      expect(getVariablePlaceholder('phone', 'PHONE')).toBe('e.g. +256700123456');
      expect(getVariablePlaceholder('link', 'URL')).toBe('https://...');
      expect(getVariablePlaceholder('name', 'TEXT')).toBe('Enter name...');
    });
  });
});
