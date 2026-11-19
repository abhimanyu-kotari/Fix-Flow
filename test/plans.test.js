const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
  PLANS,
  getPlan,
  isValidPlan,
  hasFeature,
  canAddStaff,
  canAddBranch
} = require('../src/config/plans');

describe('SaaS Subscription Plans & Entitlements', () => {
  test('defines all 4 standard subscription plans', () => {
    assert.ok(PLANS.free);
    assert.ok(PLANS.starter);
    assert.ok(PLANS.pro);
    assert.ok(PLANS.business);
  });

  test('limits Free plan to 30 tickets per month', () => {
    assert.equal(PLANS.free.unlimitedTickets, false);
    assert.equal(PLANS.free.maxTicketsPerMonth, 30);
    assert.equal(PLANS.free.priceMonthlyInr, 0);
  });

  test('validates staff account limits across plans', () => {
    assert.equal(PLANS.free.maxStaff, 1);       // Owner only
    assert.equal(PLANS.starter.maxStaff, 3);    // 3 staff
    assert.equal(PLANS.pro.maxStaff, 10);       // 10 staff
    assert.equal(PLANS.business.maxStaff, 25);   // Multi-staff team
  });

  test('canAddStaff checks quota correctly', () => {
    // Free: 1 max staff
    assert.equal(canAddStaff('free', 0), true);
    assert.equal(canAddStaff('free', 1), false);

    // Starter: 3 max staff
    assert.equal(canAddStaff('starter', 2), true);
    assert.equal(canAddStaff('starter', 3), false);

    // Pro: 10 max staff
    assert.equal(canAddStaff('pro', 9), true);
    assert.equal(canAddStaff('pro', 10), false);
  });

  test('validates feature gating across tiers', () => {
    // Inventory Management
    assert.equal(hasFeature('free', 'inventoryManagement'), false);
    assert.equal(hasFeature('starter', 'inventoryManagement'), false);
    assert.equal(hasFeature('pro', 'inventoryManagement'), true);
    assert.equal(hasFeature('business', 'inventoryManagement'), true);

    // Repair Passport
    assert.equal(hasFeature('free', 'repairPassport'), false);
    assert.equal(hasFeature('starter', 'repairPassport'), false);
    assert.equal(hasFeature('pro', 'repairPassport'), true);
    assert.equal(hasFeature('business', 'repairPassport'), true);

    // Multi-Branch Management
    assert.equal(hasFeature('free', 'multiBranch'), false);
    assert.equal(hasFeature('starter', 'multiBranch'), false);
    assert.equal(hasFeature('pro', 'multiBranch'), false);
    assert.equal(hasFeature('business', 'multiBranch'), true);
  });

  test('canAddBranch restricts branches to Business plan', () => {
    assert.equal(canAddBranch('free', 1), false);
    assert.equal(canAddBranch('starter', 1), false);
    assert.equal(canAddBranch('pro', 1), false);
    assert.equal(canAddBranch('business', 1), true);
    assert.equal(canAddBranch('business', 5), false);
  });

  test('isValidPlan validates identifiers', () => {
    assert.equal(isValidPlan('free'), true);
    assert.equal(isValidPlan('PRO'), true);
    assert.equal(isValidPlan('enterprise'), false);
    assert.equal(isValidPlan(''), false);
  });
});
