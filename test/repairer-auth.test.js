const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { connectMongo, closeMongo, Subscription } = require('../src/models');
const { createApp } = require('../src/index');

describe('Phase 2: Repairer Authentication, RBAC & Multi-Tenancy (MongoDB)', () => {
  let app;
  let server;
  let baseUrl;

  before(async () => {
    const testUri = `mongodb://127.0.0.1:27017/fixflow_test_auth_${Date.now()}`;
    await connectMongo(testUri);
    app = createApp();

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) server.close();
    try {
      await mongoose.connection.dropDatabase();
    } catch (e) {}
    await closeMongo();
  });

  let shopAOwnerToken = '';
  let shopAWorkspaceId = '';
  let shopBOwnerToken = '';
  let shopBWorkspaceId = '';

  test('POST /api/auth/register-owner creates workspace, free subscription, and owner account', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Vikram Mehta',
        email: 'vikram@quickfix.com',
        password: 'securePassword123',
        shopName: 'QuickFix Electronics',
        shopPhone: '9876543210',
        shopAddress: '12 Brigade Road, Bengaluru'
      })
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.ok(data.token);
    assert.equal(data.user.role, 'OWNER');
    assert.equal(data.user.email, 'vikram@quickfix.com');
    assert.equal(data.workspace.name, 'QuickFix Electronics');
    assert.equal(data.workspace.phone, '+919876543210');

    shopAOwnerToken = data.token;
    shopAWorkspaceId = data.workspace.id;

    // Verify database record has default Free subscription
    const sub = await Subscription.findOne({ workspace: shopAWorkspaceId });
    assert.ok(sub);
    assert.equal(sub.planId, 'free');
    assert.equal(sub.status, 'ACTIVE');
  });

  test('POST /api/auth/register-owner rejects duplicate email and invalid payload', async () => {
    // Duplicate email
    const dupRes = await fetch(`${baseUrl}/api/auth/register-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another Person',
        email: 'vikram@quickfix.com',
        password: 'password123',
        shopName: 'Another Shop'
      })
    });
    const dupData = await dupRes.json();
    assert.equal(dupRes.status, 400);
    assert.match(dupData.error, /already exists/);

    // Short password
    const shortRes = await fetch(`${baseUrl}/api/auth/register-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        email: 'test@example.com',
        password: '123',
        shopName: 'Test Shop'
      })
    });
    assert.equal(shortRes.status, 400);
  });

  test('POST /api/auth/login authenticates owner and rejects invalid credentials', async () => {
    // Valid login
    const validRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vikram@quickfix.com',
        password: 'securePassword123'
      })
    });
    const validData = await validRes.json();
    assert.equal(validRes.status, 200);
    assert.equal(validData.success, true);
    assert.ok(validData.token);
    assert.equal(validData.user.role, 'OWNER');
    assert.equal(validData.workspace.planId, 'free');

    // Invalid password
    const badPassRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vikram@quickfix.com',
        password: 'wrongPassword'
      })
    });
    assert.equal(badPassRes.status, 401);
  });

  test('GET /api/auth/me returns authenticated repairer profile', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${shopAOwnerToken}` }
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.user.email, 'vikram@quickfix.com');
    assert.equal(data.user.role, 'OWNER');
    assert.equal(data.user.workspace.name, 'QuickFix Electronics');
  });

  test('GET /api/workspace returns workspace details and plan limit information', async () => {
    const res = await fetch(`${baseUrl}/api/workspace`, {
      headers: { Authorization: `Bearer ${shopAOwnerToken}` }
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.workspace.name, 'QuickFix Electronics');
    assert.equal(data.workspace.plan.id, 'free');
    assert.equal(data.workspace.plan.maxStaff, 1);
    assert.equal(data.workspace.currentStaffCount, 1); // Owner counts as 1 staff
  });

  test('POST /api/workspace/staff enforces SaaS plan limit on Free tier', async () => {
    // Free tier allows maxStaff: 1 (Owner only). Attempting to add staff must fail!
    const res = await fetch(`${baseUrl}/api/workspace/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shopAOwnerToken}`
      },
      body: JSON.stringify({
        name: 'Aakash Verma',
        email: 'aakash@quickfix.com',
        password: 'staffPassword123',
        role: 'TECHNICIAN'
      })
    });

    const data = await res.json();
    assert.equal(res.status, 403);
    assert.equal(data.code, 'PLAN_LIMIT_EXCEEDED');
    assert.match(data.error, /Plan Limit Exceeded/);
  });

  test('Upgrading workspace to Starter unlocks staff invitations up to 3 seats', async () => {
    // Upgrade subscription to Starter plan
    await Subscription.findOneAndUpdate(
      { workspace: shopAWorkspaceId },
      { $set: { planId: 'starter' } }
    );

    // 1. Add 2nd staff (Manager) - should now succeed!
    const res1 = await fetch(`${baseUrl}/api/workspace/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shopAOwnerToken}`
      },
      body: JSON.stringify({
        name: 'Sunita Rao',
        email: 'sunita@quickfix.com',
        password: 'managerPassword123',
        role: 'MANAGER'
      })
    });
    const data1 = await res1.json();
    assert.equal(res1.status, 201);
    assert.equal(data1.staff.role, 'MANAGER');

    // 2. Add 3rd staff (Technician) - should succeed!
    const res2 = await fetch(`${baseUrl}/api/workspace/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shopAOwnerToken}`
      },
      body: JSON.stringify({
        name: 'Rohan Sen',
        email: 'rohan@quickfix.com',
        password: 'techPassword123',
        role: 'TECHNICIAN'
      })
    });
    assert.equal(res2.status, 201);

    // 3. Attempt to add 4th staff - exceeds Starter limit of 3!
    const res3 = await fetch(`${baseUrl}/api/workspace/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shopAOwnerToken}`
      },
      body: JSON.stringify({
        name: 'Deepak Joshi',
        email: 'deepak@quickfix.com',
        password: 'techPassword123',
        role: 'TECHNICIAN'
      })
    });
    const data3 = await res3.json();
    assert.equal(res3.status, 403);
    assert.equal(data3.code, 'PLAN_LIMIT_EXCEEDED');
  });

  test('RBAC: Technician cannot add or manage staff', async () => {
    // Log in as Technician (Rohan)
    const techLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rohan@quickfix.com',
        password: 'techPassword123'
      })
    });
    const techData = await techLogin.json();
    assert.equal(techData.user.role, 'TECHNICIAN');

    // Technician attempts to add staff -> must receive 403 Forbidden
    const addRes = await fetch(`${baseUrl}/api/workspace/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${techData.token}`
      },
      body: JSON.stringify({
        name: 'Unauthorized User',
        email: 'unauth@quickfix.com',
        password: 'password123',
        role: 'TECHNICIAN'
      })
    });
    assert.equal(addRes.status, 403);
  });

  test('Workspace Isolation: Shop B owner cannot see Shop A staff or workspace', async () => {
    // Register Shop B
    const resB = await fetch(`${baseUrl}/api/auth/register-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Amitabh Sen',
        email: 'amitabh@speedyrepairs.com',
        password: 'password123',
        shopName: 'Speedy Repairs',
        shopPhone: '9811223344'
      })
    });
    const dataB = await resB.json();
    shopBOwnerToken = dataB.token;
    shopBWorkspaceId = dataB.workspace.id;

    assert.notEqual(shopAWorkspaceId, shopBWorkspaceId);

    // Shop B owner queries staff
    const staffRes = await fetch(`${baseUrl}/api/workspace/staff`, {
      headers: { Authorization: `Bearer ${shopBOwnerToken}` }
    });
    const staffData = await staffRes.json();
    assert.equal(staffRes.status, 200);

    // Should ONLY see Shop B's members (Amitabh)
    assert.equal(staffData.staff.length, 1);
    assert.equal(staffData.staff[0].email, 'amitabh@speedyrepairs.com');
  });
});
