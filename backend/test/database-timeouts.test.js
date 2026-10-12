import test from 'node:test';
import assert from 'node:assert/strict';
import { mongoConnectionTimeoutMs } from '../src/config/db.js';

test('production allows slower managed MongoDB connections while local/demo stays fast', () => {
  assert.equal(mongoConnectionTimeoutMs('production'), 15_000);
  assert.equal(mongoConnectionTimeoutMs('development'), 3_500);
  assert.equal(mongoConnectionTimeoutMs('test'), 3_500);
});
