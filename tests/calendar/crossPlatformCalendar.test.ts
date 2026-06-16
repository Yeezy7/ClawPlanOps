import { describe, it, expect } from 'vitest';

describe('crossPlatformCalendar', () => {
  it('should have correct exports', async () => {
    const mod = await import('../../src/calendar/crossPlatformCalendar');
    expect(typeof mod.importToSystemCalendar).toBe('function');
  });

  it('should return result structure on empty events', async () => {
    const { importToSystemCalendar } = await import('../../src/calendar/crossPlatformCalendar');
    const result = importToSystemCalendar([]);
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('platform');
    expect(result).toHaveProperty('method');
    expect(result).toHaveProperty('imported_count');
    expect(result).toHaveProperty('errors');
    expect(typeof result.success).toBe('boolean');
    expect(typeof result.platform).toBe('string');
  });
});
