import { hashValue, hashIfNeeded, generateDeduplicationKey, normalizeDomain } from '../../utils/hash';

describe('hash utils', () => {
  it('hashValue produces a 64-char hex SHA-256', () => {
    const result = hashValue('test@example.com');
    expect(result).toMatch(/^[a-f0-9]{64}$/);
  });

  it('hashValue normalizes to lowercase and trims', () => {
    const h1 = hashValue('Test@Example.COM');
    const h2 = hashValue('test@example.com');
    expect(h1).toBe(h2);
  });

  it('hashIfNeeded hashes a plain value', () => {
    const result = hashIfNeeded('alice@example.com');
    expect(result).toMatch(/^[a-f0-9]{64}$/);
  });

  it('hashIfNeeded does not re-hash an already hashed value', () => {
    const hashed = hashValue('alice@example.com');
    const result = hashIfNeeded(hashed);
    expect(result).toBe(hashed);
  });

  it('generateDeduplicationKey returns a deterministic hex string', () => {
    const k1 = generateDeduplicationKey('t1', 'Purchase', 'e1');
    const k2 = generateDeduplicationKey('t1', 'Purchase', 'e1');
    expect(k1).toBe(k2);
    expect(k1).toMatch(/^[a-f0-9]{64}$/);
  });

  it('generateDeduplicationKey differs for different inputs', () => {
    const k1 = generateDeduplicationKey('t1', 'Purchase', 'e1');
    const k2 = generateDeduplicationKey('t1', 'Purchase', 'e2');
    expect(k1).not.toBe(k2);
  });

  describe('normalizeDomain', () => {
    it('strips https://', () => expect(normalizeDomain('https://example.com')).toBe('example.com'));
    it('strips http://', () => expect(normalizeDomain('http://example.com')).toBe('example.com'));
    it('strips www.', () => expect(normalizeDomain('www.example.com')).toBe('example.com'));
    it('strips trailing slash', () => expect(normalizeDomain('example.com/')).toBe('example.com'));
    it('lowercases', () => expect(normalizeDomain('Example.COM')).toBe('example.com'));
  });
});
