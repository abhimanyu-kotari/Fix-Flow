const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { connectMongo, closeMongo } = require('../src/models');
const { createApp } = require('../src/index');
const { mockProviderInstance } = require('../src/services/sms/smsProvider');

describe('Phase 6: End-to-End System Integration & Workflow Verification (MongoDB)', () => {
  let app;
  let server;
  let baseUrl;

  before(async () => {
    const testUri = `mongodb://127.0.0.1:27017/fixflow_test_e2e_${Date.now()}`;
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

  let shop1Token = '';
  let shop1WorkspaceId = '';
  let shop2Token = '';
  let customerPhone = '9876543210';
  let ticket1Id = '';
  let customerSessionToken = '';

  test('Static Asset Delivery: Serves Dual-Portal Web UI', async () => {
    const htmlRes = await fetch(`${baseUrl}/`);
    assert.equal(htmlRes.status, 200);
    const htmlText = await htmlRes.text();
    assert.match(htmlText, /FixFlow/);

    const jsRes = await fetch(`${baseUrl}/app.js`);
    assert.equal(jsRes.status, 200);
  });

  test('E2E Step 1: Shop Owner registers workspace and starts on Free SaaS tier', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Karan Singhania',
        email: 'karan@summitlab.com',
        password: 'password123',
        shopName: 'Summit Mobile Lab',
        shopPhone: '9800011122',
        shopAddress: 'Sector 18, Noida'
      })
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.ok(data.token);
    assert.equal(data.workspace.name, 'Summit Mobile Lab');

    shop1Token = data.token;
    shop1WorkspaceId = data.workspace.id;

    // Verify initial subscription is Free
    const subRes = await fetch(`${baseUrl}/api/subscription`, {
      headers: { Authorization: `Bearer ${shop1Token}` }
    });
    const subData = await subRes.json();
    assert.equal(subData.currentPlan.id, 'free');
    assert.equal(subData.usage.tickets.unlimited, true);
  });

  test('E2E Step 2: Shop creates repair ticket and deduplicates customer identity', async () => {
    const res = await fetch(`${baseUrl}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shop1Token}`
      },
      body: JSON.stringify({
        customerName: 'Meera Iyer',
        customerPhone: customerPhone,
        deviceCategory: 'Smartphone',
        brand: 'Google',
        model: 'Pixel 8 Pro',
        issueDescription: 'Broken AMOLED display and casing dent',
        estimatedCost: 12500,
        estimatedCompletionDate: '2026-11-15'
      })
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.ticket.customerPhone, '+919876543210');
    assert.equal(data.ticket.status, 'RECEIVED');
    ticket1Id = data.ticket.id;

    // Register second shop and create ticket for SAME customer
    const shop2Res = await fetch(`${baseUrl}/api/auth/register-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sunil Rao',
        email: 'sunil@gadgethub.com',
        password: 'password123',
        shopName: 'Gadget Hub Connaught',
        shopPhone: '9811002233'
      })
    });
    shop2Token = (await shop2Res.json()).token;

    const t2Res = await fetch(`${baseUrl}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shop2Token}`
      },
      body: JSON.stringify({
        customerName: 'Meera Iyer',
        customerPhone: '+91 98765-43210',
        deviceCategory: 'Laptop',
        brand: 'Dell',
        model: 'XPS 13',
        issueDescription: 'Trackpad unresponsive',
        estimatedCost: 3200
      })
    });
    const t2Data = await t2Res.json();
    assert.equal(t2Data.ticket.customerId, data.ticket.customerId); // Deduplicated!
  });

  test('E2E Step 3: Customer logs into FixFlow Track via Phone OTP without a password', async () => {
    await fetch(`${baseUrl}/api/track/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: customerPhone })
    });

    const sentOtp = mockProviderInstance.getLastMessageForPhone('+919876543210');
    assert.ok(sentOtp);

    const verifyRes = await fetch(`${baseUrl}/api/track/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: customerPhone, otp: sentOtp.otp })
    });
    const verifyData = await verifyRes.json();
    assert.equal(verifyRes.status, 200);
    assert.ok(verifyData.token);
    assert.equal(verifyData.customer.name, 'Meera Iyer');

    customerSessionToken = verifyData.token;
  });

  test('E2E Step 4: Customer views multi-shop repair tickets on FixFlow Track', async () => {
    const res = await fetch(`${baseUrl}/api/track/tickets`, {
      headers: { Authorization: `Bearer ${customerSessionToken}` }
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.count, 2);

    const shopNames = data.tickets.map(t => t.shop_name);
    assert.ok(shopNames.includes('Summit Mobile Lab'));
    assert.ok(shopNames.includes('Gadget Hub Connaught'));
  });

  test('E2E Step 5: Shop lifecycle update is reflected in real-time on customer portal', async () => {
    // Shop 1 progresses repair
    await fetch(`${baseUrl}/api/tickets/${ticket1Id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shop1Token}`
      },
      body: JSON.stringify({
        status: 'COMPLETED',
        notes: 'Genuine AMOLED screen installed, calibrated, and passed 24-point hardware check.'
      })
    });

    // Customer refreshes their FixFlow Track view
    const custRes = await fetch(`${baseUrl}/api/track/tickets`, {
      headers: { Authorization: `Bearer ${customerSessionToken}` }
    });
    const custData = await custRes.json();
    const updatedTicket = custData.tickets.find(t => t.id === ticket1Id);

    assert.equal(updatedTicket.status, 'COMPLETED');
    const latestEvent = updatedTicket.timeline[updatedTicket.timeline.length - 1];
    assert.equal(latestEvent.to_status, 'COMPLETED');
  });

  test('E2E Step 6: SaaS Upgrade to Pro unlocks Repair Passport generation', async () => {
    // Upgrade to Pro
    await fetch(`${baseUrl}/api/subscription/change-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shop1Token}`
      },
      body: JSON.stringify({ planId: 'pro' })
    });

    // Passport generation is now authorized!
    const passportRes = await fetch(`${baseUrl}/api/features/repair-passport/${ticket1Id}`, {
      headers: { Authorization: `Bearer ${shop1Token}` }
    });
    const passportData = await passportRes.json();
    assert.equal(passportRes.status, 200);
    assert.ok(passportData.passport.certificateNumber);
    assert.equal(passportData.passport.device, 'Google Pixel 8 Pro');
  });
});
