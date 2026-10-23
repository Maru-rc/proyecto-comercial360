import { describe, expect, it } from 'vitest';
import {
  ADVISOR_READER,
  CLIENT_READER,
  FOLLOW_UP_READER,
  HISTORY_WRITER,
  ORDER_READER,
  QUOTATION_READER,
  ROUTE_READER,
  STORAGE_SERVICE,
  VISIT_READER,
  USER_ROLES,
  ROLES,
  isUserRole,
} from './index.js';

describe('Domain Contracts Central Barrel', () => {
  it('should export all 9 injection tokens as unique symbols', () => {
    const tokens = [
      CLIENT_READER,
      ADVISOR_READER,
      ROUTE_READER,
      VISIT_READER,
      QUOTATION_READER,
      ORDER_READER,
      FOLLOW_UP_READER,
      HISTORY_WRITER,
      STORAGE_SERVICE,
    ];

    for (const token of tokens) {
      expect(typeof token).toBe('symbol');
    }

    const uniqueTokens = new Set(tokens);
    expect(uniqueTokens.size).toBe(tokens.length);
  });

  it('should have descriptive symbol descriptions for debugging', () => {
    expect(CLIENT_READER.description).toBe('CLIENT_READER');
    expect(ADVISOR_READER.description).toBe('ADVISOR_READER');
    expect(ROUTE_READER.description).toBe('ROUTE_READER');
    expect(VISIT_READER.description).toBe('VISIT_READER');
    expect(QUOTATION_READER.description).toBe('QUOTATION_READER');
    expect(ORDER_READER.description).toBe('ORDER_READER');
    expect(FOLLOW_UP_READER.description).toBe('FOLLOW_UP_READER');
    expect(HISTORY_WRITER.description).toBe('HISTORY_WRITER');
    expect(STORAGE_SERVICE.description).toBe('STORAGE_SERVICE');
  });

  it('should export centralized user roles and type guards', () => {
    expect(USER_ROLES.ADVISOR).toBe('ADVISOR');
    expect(USER_ROLES.DIRECTOR).toBe('DIRECTOR');
    expect(ROLES).toContain(USER_ROLES.ADVISOR);
    expect(ROLES).toContain(USER_ROLES.DIRECTOR);
    expect(isUserRole(USER_ROLES.ADVISOR)).toBe(true);
    expect(isUserRole(USER_ROLES.DIRECTOR)).toBe(true);
    expect(isUserRole('INVALID_ROLE')).toBe(false);
  });
});
