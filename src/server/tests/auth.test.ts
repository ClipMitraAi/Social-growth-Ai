import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, db } from '../db/store.ts';

test('Password hashing creates unique salted hashes and verifies accurately', () => {
  const password = 'SecretPassword123!';
  const hash1 = hashPassword(password);
  const hash2 = hashPassword(password);

  // Salts must be unique
  assert.notEqual(hash1, hash2);

  // Both must verify
  assert.equal(verifyPassword(password, hash1), true);
  assert.equal(verifyPassword(password, hash2), true);
  assert.equal(verifyPassword('WrongPassword', hash1), false);
});

test('Quota management tracks daily limits and increments correctly', () => {
  const testEmail = `test_${Date.now()}@test.com`;
  const user = db.createUser({
    email: testEmail,
    name: 'Quota Tester',
    passwordHash: hashPassword('TestPass123!'),
    tier: 'FREE',
  });

  const quota = db.getQuota(user.id);
  assert.equal(quota.auditCount, 0);
  assert.equal(quota.maxAudits, 10);

  const res1 = db.incrementQuota(user.id, 'audit');
  assert.equal(res1.allowed, true);
  assert.equal(res1.quota.auditCount, 1);

  // Clean up
  db.deleteUser(user.id);
});
