import { describe, it, expect } from 'vitest';
import { formatDate, isOverdue, isDueSoon, truncateText, cn, priorityColors } from './helpers';

describe('helpers', () => {
  describe('formatDate', () => {
    it('should format a date string', () => {
      const result = formatDate('2026-12-25');
      expect(result).toBe('Dec 25, 2026');
    });

    it('should return empty string for null', () => {
      const result = formatDate(null);
      expect(result).toBe('');
    });
  });

  describe('isOverdue', () => {
    it('should return true for past dates', () => {
      const result = isOverdue('2020-01-01');
      expect(result).toBe(true);
    });

    it('should return false for future dates', () => {
      const result = isOverdue('2030-12-31');
      expect(result).toBe(false);
    });

    it('should return false for null', () => {
      const result = isOverdue(null);
      expect(result).toBe(false);
    });
  });

  describe('isDueSoon', () => {
    it('should return false for null', () => {
      const result = isDueSoon(null);
      expect(result).toBe(false);
    });

    it('should return false for far future dates', () => {
      const result = isDueSoon('2030-12-31');
      expect(result).toBe(false);
    });
  });

  describe('truncateText', () => {
    it('should return original text if shorter than maxLength', () => {
      const result = truncateText('Hello', 10);
      expect(result).toBe('Hello');
    });

    it('should truncate text with ellipsis', () => {
      const result = truncateText('Hello World', 8);
      expect(result).toBe('Hello Wo...');
    });
  });

  describe('cn', () => {
    it('should join class names', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should filter out falsy values', () => {
      const result = cn('class1', false, 'class2', null, undefined, 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should return empty string for all falsy values', () => {
      const result = cn(false, null, undefined);
      expect(result).toBe('');
    });
  });

  describe('priorityColors', () => {
    it('should have colors for all priorities', () => {
      expect(priorityColors.low).toBeDefined();
      expect(priorityColors.medium).toBeDefined();
      expect(priorityColors.high).toBeDefined();
    });

    it('should have bg, text, and border properties', () => {
      expect(priorityColors.low.bg).toBeDefined();
      expect(priorityColors.low.text).toBeDefined();
      expect(priorityColors.low.border).toBeDefined();
    });
  });
});
