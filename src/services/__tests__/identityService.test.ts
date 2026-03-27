import {
  resolveIdentity,
  getIdentityRecord,
  clearIdentityStore,
} from '../identityService';

describe('identityService', () => {
  beforeEach(() => {
    clearIdentityStore();
  });

  it('creates a new user record for unknown user data', () => {
    const userId = resolveIdentity({ email: 'alice@example.com' }, 'example.com');
    expect(userId).toBeTruthy();
    const record = getIdentityRecord(userId);
    expect(record).toBeDefined();
    expect(record!.emails).toContain('alice@example.com');
    expect(record!.domains).toContain('example.com');
  });

  it('returns the same userId for the same email across calls', () => {
    const id1 = resolveIdentity({ email: 'bob@example.com' }, 'example.com');
    const id2 = resolveIdentity({ email: 'bob@example.com' }, 'example.co.uk');
    expect(id1).toBe(id2);
  });

  it('merges domains when the same user is seen on multiple domains', () => {
    const id1 = resolveIdentity({ email: 'carol@example.com' }, 'example.com');
    resolveIdentity({ email: 'carol@example.com' }, 'example.in');
    const record = getIdentityRecord(id1);
    expect(record!.domains).toContain('example.com');
    expect(record!.domains).toContain('example.in');
  });

  it('resolves the same user by externalId', () => {
    const id1 = resolveIdentity({ externalId: 'user-123' }, 'example.com');
    const id2 = resolveIdentity({ externalId: 'user-123' }, 'example.co.uk');
    expect(id1).toBe(id2);
  });

  it('resolves the same user by fbp cookie', () => {
    const id1 = resolveIdentity({ fbp: 'fb.1.123.abc' }, 'example.com');
    const id2 = resolveIdentity({ fbp: 'fb.1.123.abc' }, 'example.in');
    expect(id1).toBe(id2);
  });

  it('creates separate records for different users', () => {
    const id1 = resolveIdentity({ email: 'dave@example.com' }, 'example.com');
    const id2 = resolveIdentity({ email: 'eve@example.com' }, 'example.com');
    expect(id1).not.toBe(id2);
  });

  it('normalizes email to lowercase', () => {
    const id1 = resolveIdentity({ email: 'Frank@Example.COM' }, 'example.com');
    const id2 = resolveIdentity({ email: 'frank@example.com' }, 'example.com');
    expect(id1).toBe(id2);
  });
});
