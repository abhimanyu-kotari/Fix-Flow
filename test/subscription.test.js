const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { connectMongo, closeMongo } = require('../src/models');
const { createApp } = require('../src/index');

describe('Phase 5: SaaS Subscription Engine & Limit Enforcement (MongoDB)', () => {
  let app;
  let server;
  let baseUrl;

  let ownerToken = '';
  let workspaceId = '';
  let technicianToken = '';
  let sampleTicketId = '';

  before(async () => {
    const testUri = `mongodb://127.0.0.1:27017/fixflow_test_sub_${Date.now()}`;
    await connectMongo(testUri);
    app = createApp();

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    // 1. Register owner & workspace
    const regRes = await fetch(`${baseUrl}/api/auth/register-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tarun Sethi',
        email: 'tarun@sethifix.com',
        password: 'password123',
        shopName: 'Sethi Precision Repairs',
        shopPhone: '9888877777'
      })
    });
    const regData = await regRes.json();
    ownerToken = regData.token;
    workspaceId = regData.workspace.id;

    // 2. Create sample ticket
    const ticketRes = await fetch(`${baseUrl}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        customerName: 'Gaurav Jain',
        customerPhone: '9812345678',
        deviceCategory: 'Smartphone',
        brand: 'OnePlus',
        model: '11R',
        issueDescription: 'Battery drain issue',
        estimatedCost: 2600
      })
    });
    const ticketData = await ticketRes.json();
    sampleTicketId = ticketData.ticket.id;
  });

  after(async () => {
    if (server) server.close();
    try {
      await mongoose.connection.dropDatabase();
    } catch (e) {}
    await closeMongo();
  });

  test('GET /api/subscription returns current Free plan and live usage metrics', async () => {
    const res = await fetch(`${baseUrl}/api/subscription`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.currentPlan.id, 'free');
    assert.equal(data.currentPlan.name, 'Free');
    assert.equal(data.currentPlan.priceMonthlyInr, 0);

    // Verify staff usage
    assert.equal(data.usage.staff.current, 1);
    assert.equal(data.usage.staff.max, 1);

    // Verify Free tier is capped at 30 tickets per month
    assert.equal(data.usage.tickets.unlimited, false);
    assert.equal(data.usage.tickets.monthlyLimit, 30);
    assert.equal(data.usage.tickets.totalCreated, 1);
  });

  test('Premium feature gating: Free tier blocks Inventory, Repair Passport, and Analytics', async () => {
    // 1. Inventory is locked
    const invRes = await fetch(`${baseUrl}/api/features/inventory`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    const invData = await invRes.json();
    assert.equal(invRes.status, 403);
    assert.equal(invData.code, 'PLAN_FEATURE_LOCKED');

    // 2. Repair Passport is locked
    const passRes = await fetch(`${baseUrl}/api/features/repair-passport/${sampleTicketId}`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    assert.equal(passRes.status, 403);

    // 3. Analytics is locked
    const analyticsRes = await fetch(`${baseUrl}/api/features/analytics`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    assert.equal(analyticsRes.status, 403);
  });

  test('POST /api/subscription/change-plan switches plan to Starter', async () => {
    const res = await fetch(`${baseUrl}/api/subscription/change-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ planId: 'starter' })
    });
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.currentPlan.id, 'starter');
    assert.equal(data.usage.staff.max, 3);
  });

  test('POST /api/subscription/change-plan switches plan to Pro and unlocks Inventory & Repair Passport', async () => {
    const res = await fetch(`${baseUrl}/api/subscription/change-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ planId: 'pro' })
    });
    assert.equal(res.status, 200);

    // Inventory UNLOCKED
    const invRes = await fetch(`${baseUrl}/api/features/inventory`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    const invData = await invRes.json();
    assert.equal(invRes.status, 200);
    assert.ok(invData.items.length > 0);

    // Repair Passport UNLOCKED
    const passRes = await fetch(`${baseUrl}/api/features/repair-passport/${sampleTicketId}`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    const passData = await passRes.json();
    assert.equal(passRes.status, 200);
    assert.ok(passData.passport.certificateNumber.startsWith('RP-FF-'));
  });

  test('Downgrade safeguard: Blocks downgrade to Free if workspace has multiple active staff members', async () => {
    // Add 2 staff members
    await fetch(`${baseUrl}/api/workspace/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        name: 'Staff Tech 1',
        email: 'tech1@sethifix.com',
        password: 'password123',
        role: 'TECHNICIAN'
      })
    });

    await fetch(`${baseUrl}/api/workspace/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        name: 'Staff Tech 2',
        email: 'tech2@sethifix.com',
        password: 'password123',
        role: 'TECHNICIAN'
      })
    });

    // Attempting to downgrade to Free plan (maxStaff: 1) must be BLOCKED!
    const downgradeRes = await fetch(`${baseUrl}/api/subscription/change-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`
      },
      body: JSON.stringify({ planId: 'free' })
    });
    const downgradeData = await downgradeRes.json();

    assert.equal(downgradeRes.status, 400);
    assert.equal(downgradeData.success, false);
    assert.match(downgradeData.error, /Cannot switch to Free plan/);
  });
});
