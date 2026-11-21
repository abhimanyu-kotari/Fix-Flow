const { Subscription, User, RepairTicket } = require('../models');
const { PLANS, getPlan, isValidPlan } = require('../config/plans');

async function getWorkspaceSubscription(workspaceId) {
  const sub = await Subscription.findOne({ workspace: workspaceId });
  if (!sub) {
    throw new Error('Subscription not found for this workspace.');
  }

  const currentPlan = getPlan(sub.planId);
  const currentStaffCount = await User.countDocuments({ workspace: workspaceId, isActive: true });
  const totalTickets = await RepairTicket.countDocuments({ workspace: workspaceId });

  const usage = {
    staff: {
      current: currentStaffCount,
      max: currentPlan.maxStaff,
      remaining: Math.max(0, currentPlan.maxStaff - currentStaffCount)
    },
    branches: {
      current: 1,
      max: currentPlan.maxBranches
    },
    tickets: {
      totalCreated: totalTickets,
      unlimited: currentPlan.unlimitedTickets,
      monthlyLimit: currentPlan.maxTicketsPerMonth
    }
  };

  const availablePlans = Object.values(PLANS).map(p => ({
    ...p,
    isCurrent: p.id === currentPlan.id,
    isUpgrade: p.priceMonthlyInr > currentPlan.priceMonthlyInr,
    isDowngrade: p.priceMonthlyInr < currentPlan.priceMonthlyInr
  }));

  return {
    subscription: {
      id: sub._id.toString(),
      workspaceId: workspaceId.toString(),
      planId: sub.planId,
      status: sub.status,
      isDevOverride: sub.isDevOverride,
      currentPeriodEnd: sub.currentPeriodEnd,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt
    },
    currentPlan,
    usage,
    availablePlans
  };
}

async function updateWorkspacePlan(workspaceId, operatorUser, targetPlanId, options = {}) {
  const { autoDeactivateExcessStaff = false } = options;
  if (!operatorUser || operatorUser.role !== 'OWNER') {
    throw new Error('Unauthorized: Only the shop owner can manage workspace subscriptions.');
  }

  if (!isValidPlan(targetPlanId)) {
    throw new Error(`Invalid plan: ${targetPlanId}. Available plans: free, starter, pro, business.`);
  }

  const normalizedPlanId = targetPlanId.toLowerCase();
  const targetPlan = getPlan(normalizedPlanId);

  const currentStaffCount = await User.countDocuments({ workspace: workspaceId, isActive: true });

  if (currentStaffCount > targetPlan.maxStaff) {
    if (autoDeactivateExcessStaff) {
      // Keep owner active, deactivate excess staff accounts
      const nonOwners = await User.find({ workspace: workspaceId, role: { $ne: 'OWNER' }, isActive: true }).sort({ createdAt: -1 });
      let excess = currentStaffCount - targetPlan.maxStaff;
      for (const staffMember of nonOwners) {
        if (excess <= 0) break;
        staffMember.isActive = false;
        await staffMember.save();
        excess--;
      }
    } else {
      throw new Error(
        `Cannot switch to ${targetPlan.name} plan: Workspace currently has ${currentStaffCount} active staff member(s), but ${targetPlan.name} allows a maximum of ${targetPlan.maxStaff}. Please deactivate excess staff accounts first.`
      );
    }
  }

  await Subscription.findOneAndUpdate(
    { workspace: workspaceId },
    { $set: { planId: normalizedPlanId, isDevOverride: true } },
    { upsert: true, returnDocument: 'after' }
  );

  return getWorkspaceSubscription(workspaceId);
}

module.exports = {
  getWorkspaceSubscription,
  updateWorkspacePlan
};
