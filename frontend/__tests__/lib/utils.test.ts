import {
  cn,
  parseUtcDate,
  formatDate,
  formatTime,
  formatRelative,
  getInitial,
  getAvatarColor,
} from '@/lib/utils';

describe('Utility Functions (lib/utils.ts)', () => {
  describe('cn (classNames helper)', () => {
    it('merges class names and resolves Tailwind conflicts', () => {
      expect(cn('px-2 py-1', 'bg-blue-500')).toBe('px-2 py-1 bg-blue-500');
      // Tailwind merge test: p-4 overrides p-2
      expect(cn('p-2', 'p-4')).toBe('p-4');
      // Conditional classes
      expect(cn('text-sm', false && 'text-lg', true && 'font-bold')).toBe('text-sm font-bold');
    });
  });

  describe('getInitial', () => {
    it('returns uppercase initial of an email', () => {
      expect(getInitial('developer@nexus.ai')).toBe('D');
      expect(getInitial('alice@example.com')).toBe('A');
    });

    it('returns fallback question mark for empty or missing email', () => {
      expect(getInitial('')).toBe('?');
      // @ts-expect-error testing null safety
      expect(getInitial(null)).toBe('?');
    });
  });

  describe('getAvatarColor', () => {
    it('returns deterministic color based on char code', () => {
      const color1 = getAvatarColor('alice@example.com');
      const color2 = getAvatarColor('alice@example.com');
      expect(color1).toBe(color2);
      expect(['#7fffb2', '#5b8aff', '#ffd166', '#ff6b6b', '#c084fc']).toContain(color1);
    });
  });

  describe('parseUtcDate and formatDate', () => {
    it('formats a date string into readable format', () => {
      const formatted = formatDate('2026-05-15T10:00:00Z');
      expect(formatted).toContain('May');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2026');
    });

    it('handles ISO string without Z correctly', () => {
      const d = parseUtcDate('2026-09-14T05:04:22');
      expect(d.getTime()).not.toBeNaN();
    });

    it('handles SQL timestamp format correctly', () => {
      const d = parseUtcDate('2026-09-14 05:04:22');
      expect(d.getTime()).not.toBeNaN();
    });
  });

  describe('formatRelative', () => {
    it('returns "just now" for dates less than 1 minute ago', () => {
      const now = new Date();
      expect(formatRelative(now)).toBe('just now');
    });

    it('returns minutes ago for dates within an hour', () => {
      const past = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelative(past)).toBe('5m ago');
    });

    it('returns hours ago for dates within a day', () => {
      const past = new Date(Date.now() - 3 * 3600 * 1000);
      expect(formatRelative(past)).toBe('3h ago');
    });

    it('returns days ago for dates older than 24 hours', () => {
      const past = new Date(Date.now() - 48 * 3600 * 1000);
      expect(formatRelative(past)).toBe('2d ago');
    });
  });
});

