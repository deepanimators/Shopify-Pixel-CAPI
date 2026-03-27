import { isDuplicate, clearDeduplicationStore } from '../deduplicationService';

describe('deduplicationService', () => {
  beforeEach(() => {
    clearDeduplicationStore();
  });

  it('returns false for a new event', () => {
    expect(isDuplicate('tenant-1', 'Purchase', 'evt-001')).toBe(false);
  });

  it('returns true for the same event seen twice', () => {
    isDuplicate('tenant-1', 'Purchase', 'evt-002');
    expect(isDuplicate('tenant-1', 'Purchase', 'evt-002')).toBe(true);
  });

  it('returns false for the same eventId on a different tenant', () => {
    isDuplicate('tenant-1', 'Purchase', 'evt-003');
    expect(isDuplicate('tenant-2', 'Purchase', 'evt-003')).toBe(false);
  });

  it('returns false for the same eventId with a different event name', () => {
    isDuplicate('tenant-1', 'Purchase', 'evt-004');
    expect(isDuplicate('tenant-1', 'PageView', 'evt-004')).toBe(false);
  });

  it('tracks multiple distinct events independently', () => {
    expect(isDuplicate('t1', 'Purchase', 'e1')).toBe(false);
    expect(isDuplicate('t1', 'Purchase', 'e2')).toBe(false);
    expect(isDuplicate('t1', 'Purchase', 'e1')).toBe(true);
    expect(isDuplicate('t1', 'Purchase', 'e2')).toBe(true);
  });
});
