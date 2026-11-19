/**
 * Configurable SaaS Plan Definitions for FixFlow
 * 
 * Rules & Requirements:
 * - Free: ₹0/month, 1 owner account (no additional staff), 1 branch,
 *   core repair management, customer tracking, and unlimited tickets (not capped at 30/mo).
 * - Starter: ₹199/month, unlimited tickets, up to 3 staff accounts, basic reports, SMS alerts.
 * - Pro: ₹499/month, up to 10 staff accounts, inventory, Repair Passport, advanced reports.
 * - Business: ₹999/month, multiple branches (up to 5), 25 staff accounts, advanced analytics, priority support.
 */

const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    priceMonthlyInr: 0,
    maxStaff: 1, // Owner account only
    maxBranches: 1,
    unlimitedTickets: true, // Specifically not capped at 30/month
    features: {
      coreRepairManagement: true,
      customerTracking: true,
      basicReports: false,
      smsNotifications: false,
      inventoryManagement: false,
      repairPassport: false,
      advancedReports: false,
      multiBranch: false,
      advancedAnalytics: false
    },
    description: 'Essential repair tracking and customer identity for independent solo repairers.'
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    priceMonthlyInr: 199,
    maxStaff: 3,
    maxBranches: 1,
    unlimitedTickets: true,
    features: {
      coreRepairManagement: true,
      customerTracking: true,
      basicReports: true,
      smsNotifications: true,
      inventoryManagement: false,
      repairPassport: false,
      advancedReports: false,
      multiBranch: false,
      advancedAnalytics: false
    },
    description: 'Ideal for small repair shops with up to 3 technicians needing team coordination.'
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceMonthlyInr: 499,
    maxStaff: 10,
    maxBranches: 1,
    unlimitedTickets: true,
    features: {
      coreRepairManagement: true,
      customerTracking: true,
      basicReports: true,
      smsNotifications: true,
      inventoryManagement: true,
      repairPassport: true,
      advancedReports: true,
      multiBranch: false,
      advancedAnalytics: false
    },
    description: 'Complete workshop platform with parts inventory, Repair Passport, and advanced reporting.'
  },
  business: {
    id: 'business',
    name: 'Business',
    priceMonthlyInr: 999,
    maxStaff: 25,
    maxBranches: 5,
    unlimitedTickets: true,
    features: {
      coreRepairManagement: true,
      customerTracking: true,
      basicReports: true,
      smsNotifications: true,
      inventoryManagement: true,
      repairPassport: true,
      advancedReports: true,
      multiBranch: true,
      advancedAnalytics: true
    },
    description: 'High-volume repair franchises with multi-branch management and deep business analytics.'
  }
};

/**
 * Get plan details by ID (defaults to 'free')
 * @param {string} planId 
 */
function getPlan(planId) {
  const normalizedId = (planId || 'free').toLowerCase();
  return PLANS[normalizedId] || PLANS.free;
}

/**
 * Validate whether a plan identifier exists
 * @param {string} planId 
 */
function isValidPlan(planId) {
  if (!planId) return false;
  return Boolean(PLANS[planId.toLowerCase()]);
}

/**
 * Check if a plan grants access to a specific feature flag
 * @param {string} planId 
 * @param {string} featureKey 
 */
function hasFeature(planId, featureKey) {
  const plan = getPlan(planId);
  return Boolean(plan.features && plan.features[featureKey]);
}

/**
 * Check if current staff count is within the plan allowance
 * @param {string} planId 
 * @param {number} currentStaffCount 
 */
function canAddStaff(planId, currentStaffCount) {
  const plan = getPlan(planId);
  return currentStaffCount < plan.maxStaff;
}

/**
 * Check if current branch count is within the plan allowance
 * @param {string} planId 
 * @param {number} currentBranchCount 
 */
function canAddBranch(planId, currentBranchCount) {
  const plan = getPlan(planId);
  return currentBranchCount < plan.maxBranches;
}

module.exports = {
  PLANS,
  getPlan,
  isValidPlan,
  hasFeature,
  canAddStaff,
  canAddBranch
};
