const { Subscription } = require('../models');
const { hasFeature, getPlan } = require('../config/plans');

function requirePlanFeature(featureKey) {
  return async (req, res, next) => {
    if (!req.workspaceId) {
      return res.status(401).json({ error: 'Workspace authentication required.' });
    }

    const sub = await Subscription.findOne({ workspace: req.workspaceId });
    const planId = sub ? sub.planId : 'free';

    if (!hasFeature(planId, featureKey)) {
      const currentPlan = getPlan(planId);
      return res.status(403).json({
        success: false,
        error: `The feature "${featureKey}" is not included in your current ${currentPlan.name} plan. Please upgrade your subscription to access this feature.`,
        code: 'PLAN_FEATURE_LOCKED',
        feature: featureKey,
        currentPlan: currentPlan.id
      });
    }

    req.currentPlan = planId;
    next();
  };
}

module.exports = {
  requirePlanFeature
};
