const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { connectMongo, closeMongo, Customer, ShopCustomer } = require('../src/models');
const { createApp } = require('../src/index');

describe('Phase 3: Customer Registration & Repair Ticket Engine (MongoDB)', () => {
  let app;
  let server;
  let baseUrl;

  let shop1Token = '';
  let shop1WorkspaceId = '';
  let shop2Token = '';
  let shop2WorkspaceId = '';

  before(async () => {
    const testUri = `mongodb://127.0.0.1:27017/fixflow_test_tickets_${Date.now()}`;
    await connectMongo(testUri);
    app = createApp();

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    // Register Shop 1
    const res1 = await fetch(`${baseUrl}/api/auth/register-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Shop 1 Owner',
        email: 'owner1@shop1.com',
        password: 'password123',
        shopName: 'Shop One Care',
        shopPhone: '9800000001'
      })
    });
    const data1 = await res1.json();
    shop1Token = data1.token;
    shop1WorkspaceId = data1.workspace.id;

    // Register Shop 2
    const res2 = await fetch(`${baseUrl}/api/auth/register-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Shop 2 Owner',
        email: 'owner2@shop2.com',
        password: 'password123',
        shopName: 'Shop Two Tech',
        shopPhone: '9800000002'
      })
    });
    const data2 = await res2.json();
    shop2Token = data2.token;
    shop2WorkspaceId = data2.workspace.id;
  });

  after(async () => {
    if (server) server.close();
    try {
      await mongoose.connection.dropDatabase();
    } catch (e) {}
    await closeMongo();
  });

  let createdTicket1Id = '';
  let createdTicket2Id = '';
  let sharedCustomerId = '';

  test('POST /api/tickets creates ticket and registers global customer with normalized E.164 phone', async () => {
    const res = await fetch(`${baseUrl}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shop1Token}`
      },
      body: JSON.stringify({
        customerName: 'Sameer Khan',
        customerPhone: '9876543210',
        deviceCategory: 'Smartphone',
        brand: 'Apple',
        model: 'iPhone 14 Pro',
        issueDescription: 'Cracked screen and damaged front camera',
        estimatedCost: 9500,
        estimatedCompletionDate: '2026-11-10'
      })
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.ticket.customerPhone, '+919876543210');
    assert.equal(data.ticket.deviceCategory, 'Smartphone');
    assert.equal(data.ticket.status, 'RECEIVED');
    assert.ok(data.ticket.ticketNumber.startsWith('FF-'));
    assert.equal(data.ticket.isNewCustomer, true);

    createdTicket1Id = data.ticket.id;
    sharedCustomerId = data.ticket.customerId;

    const custDoc = await Customer.findById(sharedCustomerId);
    assert.equal(custDoc.phoneE164, '+919876543210');
  });

  test('POST /api/tickets at Shop 2 deduplicates customer and links to the same global account', async () => {
    const res = await fetch(`${baseUrl}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shop2Token}`
      },
      body: JSON.stringify({
        customerName: 'Sameer Khan',
        customerPhone: '+91 98765-43210',
        deviceCategory: 'Laptop',
        brand: 'Apple',
        model: 'MacBook Air M2',
        issueDescription: 'Keyboard liquid spill',
        estimatedCost: 14000
      })
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.ticket.customerPhone, '+919876543210');
    assert.equal(data.ticket.isNewCustomer, false);
    assert.equal(data.ticket.customerId, sharedCustomerId);

    createdTicket2Id = data.ticket.id;

    // Verify exactly ONE customer exists in the entire database
    const totalCustomers = await Customer.countDocuments({});
    assert.equal(totalCustomers, 1);

    // Verify both shops have distinct shop_customers relationships
    const relShop1 = await ShopCustomer.findOne({ workspace: shop1WorkspaceId, customer: sharedCustomerId });
    const relShop2 = await ShopCustomer.findOne({ workspace: shop2WorkspaceId, customer: sharedCustomerId });
    assert.ok(relShop1);
    assert.ok(relShop2);
  });

  test('GET /api/tickets isolates workspace repair tickets', async () => {
    const res1 = await fetch(`${baseUrl}/api/tickets`, {
      headers: { Authorization: `Bearer ${shop1Token}` }
    });
    const data1 = await res1.json();
    assert.equal(res1.status, 200);
    assert.equal(data1.tickets.length, 1);
    assert.equal(data1.tickets[0].id, createdTicket1Id);
    assert.equal(data1.tickets[0].model, 'iPhone 14 Pro');

    const res2 = await fetch(`${baseUrl}/api/tickets`, {
      headers: { Authorization: `Bearer ${shop2Token}` }
    });
    const data2 = await res2.json();
    assert.equal(res2.status, 200);
    assert.equal(data2.tickets.length, 1);
    assert.equal(data2.tickets[0].id, createdTicket2Id);
    assert.equal(data2.tickets[0].model, 'MacBook Air M2');

    // Cross-workspace ticket detail access is rejected with 404
    const crossRes = await fetch(`${baseUrl}/api/tickets/${createdTicket2Id}`, {
      headers: { Authorization: `Bearer ${shop1Token}` }
    });
    assert.equal(crossRes.status, 404);
  });

  test('PATCH /api/tickets/:id updates ticket status and records audit history', async () => {
    // 1. Update status to DIAGNOSING
    const res1 = await fetch(`${baseUrl}/api/tickets/${createdTicket1Id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shop1Token}`
      },
      body: JSON.stringify({
        status: 'DIAGNOSING',
        notes: 'Disassembled casing; display connector checked.'
      })
    });
    assert.equal(res1.status, 200);

    // 2. Update status to IN_PROGRESS
    const res2 = await fetch(`${baseUrl}/api/tickets/${createdTicket1Id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shop1Token}`
      },
      body: JSON.stringify({
        status: 'IN_PROGRESS',
        notes: 'Replacement display installed, calibrating TrueTone.'
      })
    });
    assert.equal(res2.status, 200);

    // 3. Update status to COMPLETED
    const res3 = await fetch(`${baseUrl}/api/tickets/${createdTicket1Id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shop1Token}`
      },
      body: JSON.stringify({
        status: 'COMPLETED',
        notes: 'Quality control pass completed. Ready for customer pickup.'
      })
    });
    const data3 = await res3.json();
    assert.equal(res3.status, 200);
    assert.equal(data3.ticket.status, 'COMPLETED');

    assert.equal(data3.ticket.timeline.length, 4);
    assert.equal(data3.ticket.timeline[0].to_status, 'RECEIVED');
    assert.equal(data3.ticket.timeline[1].to_status, 'DIAGNOSING');
    assert.equal(data3.ticket.timeline[2].to_status, 'IN_PROGRESS');
    assert.equal(data3.ticket.timeline[3].to_status, 'COMPLETED');
  });

  test('GET /api/customers lists shop customers with ticket metrics', async () => {
    const res = await fetch(`${baseUrl}/api/customers`, {
      headers: { Authorization: `Bearer ${shop1Token}` }
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.customers.length, 1);
    assert.equal(data.customers[0].phone_e164, '+919876543210');
    assert.equal(data.customers[0].ticket_count, 1);
  });

  test('POST /api/tickets supports non-compulsory fields and applies smart fallbacks', async () => {
    // Ticket with empty / omitted non-compulsory fields
    const res = await fetch(`${baseUrl}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shop1Token}`
      },
      body: JSON.stringify({
        customerPhone: '9988776655'
        // customerName, brand, model, issue, cost are all omitted
      })
    });
    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.ticket.customerPhone, '+919988776655');
    assert.equal(data.ticket.customerName, 'Walk-in Customer');
    assert.equal(data.ticket.brand, 'Generic');
    assert.equal(data.ticket.model, 'Device');
    assert.equal(data.ticket.deviceCategory, 'Smartphone');
    assert.equal(data.ticket.estimatedCost, 0);
  });

  test('POST /api/tickets supports assigned staff name and mobile number', async () => {
    const res = await fetch(`${baseUrl}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shop1Token}`
      },
      body: JSON.stringify({
        customerPhone: '9911223344',
        brand: 'Samsung',
        model: 'Galaxy S23',
        assignedStaffName: 'Vikram Technician',
        assignedStaffPhone: '9811122233'
      })
    });
    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.ticket.assignedStaffName, 'Vikram Technician');
    assert.equal(data.ticket.assignedStaffPhone, '+919811122233');

    // Verify it is returned in ticket details
    const getRes = await fetch(`${baseUrl}/api/tickets/${data.ticket.id}`, {
      headers: { Authorization: `Bearer ${shop1Token}` }
    });
    const getData = await getRes.json();
    assert.equal(getData.ticket.assigned_staff_name, 'Vikram Technician');
    assert.equal(getData.ticket.assigned_staff_phone, '+919811122233');
  });

  test('DELETE /api/tickets/:id deletes repair ticket from workspace', async () => {
    // Create a disposable ticket
    const createRes = await fetch(`${baseUrl}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shop1Token}`
      },
      body: JSON.stringify({
        customerPhone: '9123000000',
        brand: 'Google',
        model: 'Pixel 7'
      })
    });
    const createData = await createRes.json();
    const ticketId = createData.ticket.id;

    // Delete it
    const delRes = await fetch(`${baseUrl}/api/tickets/${ticketId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${shop1Token}` }
    });
    const delData = await delRes.json();
    assert.equal(delRes.status, 200);
    assert.equal(delData.success, true);

    // Verify it is no longer found
    const getRes = await fetch(`${baseUrl}/api/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${shop1Token}` }
    });
    assert.equal(getRes.status, 404);
  });
});
