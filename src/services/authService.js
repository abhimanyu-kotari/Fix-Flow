const { Workspace, Subscription, User } = require('../models');
const { hashPassword, comparePassword, signToken } = require('../utils/crypto');
const { normalizePhone } = require('../utils/phone');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') || 'shop';
}

async function registerOwner({ name, email, password, shopName, shopPhone, shopAddress }) {
  if (!name || !email || !password || !shopName) {
    throw new Error('Name, email, password, and shop name are required.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('A valid email address is required.');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  // Normalize shop phone
  let normalizedShopPhone = null;
  if (shopPhone) {
    const phoneRes = normalizePhone(shopPhone);
    normalizedShopPhone = phoneRes.isValid ? phoneRes.e164 : shopPhone.trim();
  }

  // Generate unique slug
  let baseSlug = slugify(shopName);
  let slug = baseSlug;
  let counter = 1;
  while (await Workspace.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const passwordHash = await hashPassword(password);

  // 1. Create Workspace
  const workspace = await Workspace.create({
    name: shopName.trim(),
    slug,
    phone: normalizedShopPhone,
    address: shopAddress ? shopAddress.trim() : null
  });

  // 2. Create Default Subscription (Free Tier)
  const subscription = await Subscription.create({
    workspace: workspace._id,
    planId: 'free',
    status: 'ACTIVE',
    isDevOverride: false
  });

  // 3. Create Owner User
  const user = await User.create({
    workspace: workspace._id,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: 'OWNER',
    isActive: true
  });

  const token = signToken({
    userId: user._id.toString(),
    workspaceId: workspace._id.toString(),
    email: user.email,
    role: 'OWNER',
    type: 'repairer'
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      workspaceId: workspace._id.toString(),
      name: user.name,
      email: user.email,
      role: 'OWNER',
      isActive: true
    },
    workspace: {
      id: workspace._id.toString(),
      name: workspace.name,
      slug: workspace.slug,
      phone: workspace.phone,
      address: workspace.address,
      planId: subscription.planId
    }
  };
}

async function login({ email, password }) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).populate('workspace');

  if (!user || !user.isActive || !user.workspace) {
    throw new Error('Invalid email or password.');
  }

  const isValidPassword = await comparePassword(password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Invalid email or password.');
  }

  const subscription = await Subscription.findOne({ workspace: user.workspace._id });

  const token = signToken({
    userId: user._id.toString(),
    workspaceId: user.workspace._id.toString(),
    email: user.email,
    role: user.role,
    type: 'repairer'
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      workspaceId: user.workspace._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    },
    workspace: {
      id: user.workspace._id.toString(),
      name: user.workspace.name,
      slug: user.workspace.slug,
      phone: user.workspace.phone,
      address: user.workspace.address,
      planId: subscription ? subscription.planId : 'free',
      subscriptionStatus: subscription ? subscription.status : 'ACTIVE'
    }
  };
}

async function getUserById(userId) {
  const user = await User.findById(userId).populate('workspace');
  if (!user || !user.workspace) return null;

  const subscription = await Subscription.findOne({ workspace: user.workspace._id });

  return {
    id: user._id.toString(),
    workspaceId: user.workspace._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    workspace: {
      id: user.workspace._id.toString(),
      name: user.workspace.name,
      slug: user.workspace.slug,
      phone: user.workspace.phone,
      address: user.workspace.address,
      planId: subscription ? subscription.planId : 'free',
      subscriptionStatus: subscription ? subscription.status : 'ACTIVE'
    }
  };
}

module.exports = {
  registerOwner,
  login,
  getUserById,
  slugify
};
