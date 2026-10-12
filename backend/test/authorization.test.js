import test from 'node:test';
import assert from 'node:assert/strict';
import { authenticate, allowRoles } from '../src/middleware/auth.js';
import app from '../src/app.js';

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
  };
}

test('catalogue authentication rejects requests without a bearer session', async () => {
  const req = { headers: {} };
  const res = responseRecorder();
  let advanced = false;
  await authenticate(req, res, () => { advanced = true; });
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, 'Sign in to continue.');
  assert.equal(advanced, false);
});

test('Administrator-only operations reject Users and legacy Screen Manager roles', () => {
  const authorizeAdmin = allowRoles('admin');
  for (const role of ['user', 'screen_manager', undefined]) {
    const res = responseRecorder();
    let advanced = false;
    authorizeAdmin({ user: role ? { role } : null }, res, () => { advanced = true; });
    assert.equal(res.statusCode, 403, `${role ?? 'no-role'} must be denied`);
    assert.equal(advanced, false);
  }
  const res = responseRecorder();
  let advanced = false;
  authorizeAdmin({ user: { role: 'admin' } }, res, () => { advanced = true; });
  assert.equal(advanced, true);
  assert.equal(res.statusCode, 200);
});

test('demo API accepts only User and Administrator profiles and gates theatre operations', async t => {
  process.env.DEMO_MODE = 'true';
  process.env.JWT_SECRET = 'authorization-regression-test-secret-with-at-least-32-chars';
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/api`;

  const anonymous = await fetch(`${base}/catalog`);
  assert.equal(anonymous.status, 401);

  const removedProfile = await fetch(`${base}/auth/demo`, {
    method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({role:'screen_manager'}),
  });
  assert.equal(removedProfile.status, 400);

  const signIn = async role => {
    const response = await fetch(`${base}/auth/demo`, {
      method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({role}),
    });
    assert.equal(response.status, 200);
    return (await response.json()).token;
  };
  const userToken = await signIn('user');
  const adminToken = await signIn('admin');
  const asUser = {headers:{authorization:`Bearer ${userToken}`}};
  const asAdmin = {headers:{authorization:`Bearer ${adminToken}`}};

  assert.equal((await fetch(`${base}/catalog`, asUser)).status, 200);
  for (const path of ['/theatres','/screenings','/reports','/submissions']) {
    assert.equal((await fetch(`${base}${path}`, asUser)).status, 403, `User must not access ${path}`);
    assert.equal((await fetch(`${base}${path}`, asAdmin)).status, 200, `Administrator must access ${path}`);
  }
});
