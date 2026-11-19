const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { connectMongo, closeMongo, OtpVerification } = require('../src/models');
const { createApp } = require('../src/index');
const { mockProviderInstance } = require('../src/services/sms/smsProvider');

describe('Phase 4: FixFlow Track Customer Portal & Phone OTP Engine (MongoDB)', () => {
  let app;
  let server;
  let baseUrl;

  let shop1Token = '';
  let shop2Token = '';
  let registeredCustomerPhone = '9876543210';
  let secondCustomerPhone = '9123456780';

  before(async () => {
    const testUri = `mongodb://127.0.0.1:27017/fixflow_test_otp_${Date.now()}`;
    await connectMongo(testUri);
    app = createApp();

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    // 1. Setup Shop 1 & Shop 2
    const shop1Res = await fetch(`${baseUrl}/api/auth/register-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Shop 1 Owner',
        email: 'owner1@tracktest.com',
        password: 'password123',
        shopName: 'Metro Mobile Care',
        shopPhone: '9800000010'
      })
    });
    const shop1Data = await shop1Res.json();
    shop1Token = shop1Data.token;

    const shop2Res = await fetch(`${baseUrl}/api/auth/register-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Shop 2 Owner',
        email: 'owner2@tracktest.com',
        password: 'password123',
        shopName: 'Downtown Laptop Hub',
        shopPhone: '9800000020'
      })
    });
    const shop2Data = await shop2Res.json();
    shop2Token = shop2Data.token;

    // 2. Register Ticket 1 for Customer 1 at Shop 1
    await fetch(`${baseUrl}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shop1Token}`
      },
      body: JSON.stringify({
        customerName: 'Ananya Roy',
        customerPhone: registeredCustomerPhone,
        deviceCategory: 'Smartphone',
        brand: 'Apple',
        model: 'iPhone 13',
        issueDescription: 'Battery service needed',
        estimatedCost: 3500
      })
    });

    // 3. Register Ticket 2 for Customer 1 at Shop 2
    await fetch(`${baseUrl}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shop2Token}`
      },
      body: JSON.stringify({
        customerName: 'Ananya Roy',
        customerPhone: '+91 98765 43210',
        deviceCategory: 'Laptop',
        brand: 'Lenovo',
        model: 'ThinkPad T14',
        issueDescription: 'Fan noise and overheating',
        estimatedCost: 2200
      })
    });

    // 4. Register Ticket for Customer 2 at Shop 1
    await fetch(`${baseUrl}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shop1Token}`
      },
      body: JSON.stringify({
        customerName: 'Ramesh Gupta',
        customerPhone: secondCustomerPhone,
        deviceCategory: 'Tablet',
        brand: 'Samsung',
        model: 'Galaxy Tab S8',
        issueDescription: 'Charging port loose',
        estimatedCost: 1800
      })
    });
  });

  beforeEach(() => {
    mockProviderInstance.clear();
  });

  after(async () => {
    if (server) server.close();
    try {
      await mongoose.connection.dropDatabase();
    } catch (e) {}
    await closeMongo();
  });

  test('POST /api/track/otp/request returns uniform response for unregistered number (anti-enumeration)', async () => {
    const res = await fetch(`${baseUrl}/api/track/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9999900000' })
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.match(data.message, /If this phone number is registered with FixFlow repairs/);
    assert.equal(data.cooldownSeconds, 60);

    assert.equal(mockProviderInstance.sentMessages.length, 0);
  });

  test('POST /api/track/otp/request sends OTP for registered customer and hashes it in database', async () => {
    const res = await fetch(`${baseUrl}/api/track/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: registeredCustomerPhone })
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);

    const sentMsg = mockProviderInstance.getLastMessageForPhone('+919876543210');
    assert.ok(sentMsg);
    assert.match(sentMsg.otp, /^\d{6}$/);

    const dbOtp = await OtpVerification.findOne({ phoneE164: '+919876543210', consumed: false });
    assert.ok(dbOtp);
    assert.notEqual(dbOtp.otpHash, sentMsg.otp);
    assert.equal(dbOtp.otpHash.length, 64);
    assert.ok(dbOtp.salt);
  });

  test('POST /api/track/otp/request enforces 60-second resend cooldown', async () => {
    const res = await fetch(`${baseUrl}/api/track/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: registeredCustomerPhone })
    });

    const data = await res.json();
    assert.equal(res.status, 429);
    assert.equal(data.code, 'COOLDOWN_ACTIVE');
    assert.match(data.error, /Please wait/);
    assert.ok(data.retryAfterSeconds > 0);
  });

  test('POST /api/track/otp/verify enforces maximum 3 attempts lockout', async () => {
    // 1st wrong attempt
    const res1 = await fetch(`${baseUrl}/api/track/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: registeredCustomerPhone, otp: '000000' })
    });
    const data1 = await res1.json();
    assert.equal(res1.status, 400);
    assert.equal(data1.remainingAttempts, 2);

    // 2nd wrong attempt
    const res2 = await fetch(`${baseUrl}/api/track/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: registeredCustomerPhone, otp: '111111' })
    });
    const data2 = await res2.json();
    assert.equal(res2.status, 400);
    assert.equal(data2.remainingAttempts, 1);

    // 3rd wrong attempt -> locks out code
    const res3 = await fetch(`${baseUrl}/api/track/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: registeredCustomerPhone, otp: '222222' })
    });
    const data3 = await res3.json();
    assert.equal(res3.status, 400);
    assert.match(data3.error, /Maximum attempts reached/);
  });

  test('POST /api/track/otp/verify validates correct code and returns customer session', async () => {
    await OtpVerification.updateMany({ phoneE164: '+919876543210' }, { $set: { consumed: true } });

    await fetch(`${baseUrl}/api/track/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: registeredCustomerPhone })
    });

    const sentMsg = mockProviderInstance.getLastMessageForPhone('+919876543210');
    assert.ok(sentMsg);

    const verifyRes = await fetch(`${baseUrl}/api/track/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: registeredCustomerPhone,
        otp: sentMsg.otp
      })
    });

    const verifyData = await verifyRes.json();
    assert.equal(verifyRes.status, 200);
    assert.equal(verifyData.success, true);
    assert.ok(verifyData.token);
    assert.equal(verifyData.customer.phone, '+919876543210');
    assert.equal(verifyData.customer.isVerified, true);
  });

  test('GET /api/track/tickets returns customer repair tickets across multiple shops with timelines', async () => {
    await OtpVerification.updateMany({ phoneE164: '+919876543210' }, { $set: { consumed: true } });
    await fetch(`${baseUrl}/api/track/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: registeredCustomerPhone })
    });
    const msg = mockProviderInstance.getLastMessageForPhone('+919876543210');

    const verifyRes = await fetch(`${baseUrl}/api/track/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: registeredCustomerPhone, otp: msg.otp })
    });
    const customer1Session = await verifyRes.json();

    const ticketsRes = await fetch(`${baseUrl}/api/track/tickets`, {
      headers: { Authorization: `Bearer ${customer1Session.token}` }
    });
    const ticketsData = await ticketsRes.json();

    assert.equal(ticketsRes.status, 200);
    assert.equal(ticketsData.success, true);
    assert.equal(ticketsData.count, 2);

    const shopNames = ticketsData.tickets.map(t => t.shop_name);
    assert.ok(shopNames.includes('Metro Mobile Care'));
    assert.ok(shopNames.includes('Downtown Laptop Hub'));
  });

  test('DELETE /api/track/tickets/:id allows customer to delete / cancel their ticket', async () => {
    // 1. Get customer session
    await OtpVerification.updateMany({ phoneE164: '+919876543210' }, { $set: { consumed: true } });
    await fetch(`${baseUrl}/api/track/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: registeredCustomerPhone })
    });
    const msg = mockProviderInstance.getLastMessageForPhone('+919876543210');

    const verifyRes = await fetch(`${baseUrl}/api/track/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: registeredCustomerPhone, otp: msg.otp })
    });
    const session = await verifyRes.json();

    // 2. Fetch tickets
    const ticketsRes = await fetch(`${baseUrl}/api/track/tickets`, {
      headers: { Authorization: `Bearer ${session.token}` }
    });
    const ticketsData = await ticketsRes.json();
    const targetTicket = ticketsData.tickets[0];

    // 3. Delete ticket as customer
    const delRes = await fetch(`${baseUrl}/api/track/tickets/${targetTicket.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.token}` }
    });
    const delData = await delRes.json();
    assert.equal(delRes.status, 200);
    assert.equal(delData.success, true);

    // 4. Verify count decreased
    const remainingRes = await fetch(`${baseUrl}/api/track/tickets`, {
      headers: { Authorization: `Bearer ${session.token}` }
    });
    const remainingData = await remainingRes.json();
    assert.equal(remainingData.count, ticketsData.count - 1);
  });

  test('POST /api/track/register and POST /api/track/login supports zero-OTP customer password tracking', async () => {
    // 1. Register customer with password
    const regRes = await fetch(`${baseUrl}/api/track/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '9591560751',
        name: 'Abhimanyu Kotari',
        password: 'CustomerPass123'
      })
    });
    const regData = await regRes.json();
    assert.equal(regRes.status, 200);
    assert.equal(regData.success, true);
    assert.ok(regData.token);
    assert.equal(regData.customer.name, 'Abhimanyu Kotari');

    // 2. Reject login with wrong password
    const failLoginRes = await fetch(`${baseUrl}/api/track/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '9591560751',
        password: 'WrongPassword'
      })
    });
    assert.equal(failLoginRes.status, 401);

    // 3. Login with correct password
    const loginRes = await fetch(`${baseUrl}/api/track/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '9591560751',
        password: 'CustomerPass123'
      })
    });
    const loginData = await loginRes.json();
    assert.equal(loginRes.status, 200);
    assert.equal(loginData.success, true);
    assert.ok(loginData.token);

    // 4. Verify authenticated session can access tickets
    const ticketsRes = await fetch(`${baseUrl}/api/track/tickets`, {
      headers: { Authorization: `Bearer ${loginData.token}` }
    });
    assert.equal(ticketsRes.status, 200);
  });
});
