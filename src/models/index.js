const mongoose = require('mongoose');
const env = require('../config/env');

const Workspace = require('./Workspace');
const Subscription = require('./Subscription');
const User = require('./User');
const Customer = require('./Customer');
const ShopCustomer = require('./ShopCustomer');
const RepairTicket = require('./RepairTicket');
const OtpVerification = require('./OtpVerification');

let isConnected = false;

async function connectMongo(uri = env.MONGODB_URI) {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  const conn = await mongoose.connect(uri);
  isConnected = true;
  return conn;
}

async function closeMongo() {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

module.exports = {
  connectMongo,
  closeMongo,
  Workspace,
  Subscription,
  User,
  Customer,
  ShopCustomer,
  RepairTicket,
  OtpVerification
};
