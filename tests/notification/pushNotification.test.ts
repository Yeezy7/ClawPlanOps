import { describe, it, expect } from 'vitest';
import { sendSystemNotification } from '../../src/notification/pushNotification';

describe('pushNotification', () => {
  it('should have sendSystemNotification function', () => {
    expect(typeof sendSystemNotification).toBe('function');
  });

  it('should return result object', () => {
    const result = sendSystemNotification('测试', '测试消息');
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('method', 'system');
    expect(result).toHaveProperty('sent_count');
    expect(result).toHaveProperty('errors');
  });
});
