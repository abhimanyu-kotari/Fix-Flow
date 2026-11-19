const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const {
  connectMongo,
  closeMongo,
  Workspace,
  Subscription,
  User,
  Customer,
  ShopCustomer,
  RepairTicket
} = require('../src/models');

describe('MongoDB Multi-Tenant Schema & Isolation', () => {
  let dbUri;

  before(async () => {
    dbUri = `mongodb://127.0.0.1:27017/fixflow_test_db_${Date.now()}`;
    await connectMongo(dbUri);
  });

  after(async () => {
    try {
      await mongoose.connection.dropDatabase();
    } catch (e) {}
    await closeMongo();
  });

  beforeEach(async () => {
    await Workspace.deleteMany({});
    await Subscription.deleteMany({});
    await User.deleteMany({});
    await Customer.deleteMany({});
    await ShopCustomer.deleteMany({});
    await RepairTicket.deleteMany({});
  });

  test('enforces unique customer identity on normalized E.164 phone', async () => {
    await Customer.create({
      phoneE164: '+919876543210',
      defaultName: 'Rahul Sharma',
      isVerified: true
    });

    // Attempting to insert a duplicate customer with the same phone must fail
    await assert.rejects(
      async () => {
        await Customer.create({
          phoneE164: '+919876543210',
          defaultName: 'Rahul S.',
          isVerified: true
        });
      },
      /E11000 duplicate key error/
    );
  });

  test('supports customer deduplication across multiple repair shops while isolating workspace data', async () => {
    // 1. Create two separate repair shops (workspaces)
    const ws1 = await Workspace.create({ name: 'Apex Repairs', slug: 'apex-repairs' });
    const ws2 = await Workspace.create({ name: 'Gadget Lab', slug: 'gadget-lab' });

    // 2. Global verified customer visits both shops
    const phone = '+919876543210';
    const customer = await Customer.create({
      phoneE164: phone,
      defaultName: 'Priya Patel',
      isVerified: true
    });

    // 3. Shop 1 records a relationship & creates a repair ticket
    await ShopCustomer.create({
      workspace: ws1._id,
      customer: customer._id,
      shopDisplayName: 'Priya',
      internalNotes: 'VIP customer'
    });

    await RepairTicket.create({
      ticketNumber: 'APEX-101',
      workspace: ws1._id,
      customer: customer._id,
      deviceCategory: 'Smartphone',
      brand: 'Apple',
      model: 'iPhone 13',
      issueDescription: 'Cracked OLED',
      estimatedCost: 8500,
      status: 'RECEIVED'
    });

    // 4. Shop 2 records a relationship with the same customer & creates a ticket
    await ShopCustomer.create({
      workspace: ws2._id,
      customer: customer._id,
      shopDisplayName: 'Priya Patel',
      internalNotes: 'Referred by tech forum'
    });

    await RepairTicket.create({
      ticketNumber: 'GLAB-201',
      workspace: ws2._id,
      customer: customer._id,
      deviceCategory: 'Laptop',
      brand: 'Dell',
      model: 'XPS 15',
      issueDescription: 'Battery replacement',
      estimatedCost: 4500,
      status: 'IN_PROGRESS'
    });

    // 5. Verify Shop 1 only sees their ticket
    const shop1Tickets = await RepairTicket.find({ workspace: ws1._id });
    assert.equal(shop1Tickets.length, 1);
    assert.equal(shop1Tickets[0].ticketNumber, 'APEX-101');

    // 6. Verify Shop 2 only sees their ticket
    const shop2Tickets = await RepairTicket.find({ workspace: ws2._id });
    assert.equal(shop2Tickets.length, 1);
    assert.equal(shop2Tickets[0].ticketNumber, 'GLAB-201');

    // 7. Verify the Customer sees all tickets across both shops in FixFlow Track
    const customerTickets = await RepairTicket.find({ customer: customer._id })
      .populate('workspace', 'name')
      .sort({ createdAt: 1 });

    assert.equal(customerTickets.length, 2);
    assert.equal(customerTickets[0].workspace.name, 'Apex Repairs');
    assert.equal(customerTickets[1].workspace.name, 'Gadget Lab');
  });

  test('enforces compound uniqueness on ShopCustomer(workspace, customer)', async () => {
    const ws = await Workspace.create({ name: 'Single Shop', slug: 'single-shop' });
    const cust = await Customer.create({ phoneE164: '+919988776655', defaultName: 'Anita' });

    await ShopCustomer.create({
      workspace: ws._id,
      customer: cust._id,
      shopDisplayName: 'Anita'
    });

    await assert.rejects(
      async () => {
        await ShopCustomer.create({
          workspace: ws._id,
          customer: cust._id,
          shopDisplayName: 'Anita Duplicate'
        });
      },
      /E11000 duplicate key error/
    );
  });
});
