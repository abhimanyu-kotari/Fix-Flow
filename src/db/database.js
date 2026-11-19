const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const env = require('../config/env');

let activeDbInstance = null;

/**
 * Initializes and returns the SQLite database instance.
 * @param {string} [customPath] - Path to SQLite file or ':memory:' for tests
 * @returns {DatabaseSync}
 */
function initDatabase(customPath) {
  const dbPath = customPath || env.DB_PATH;

  // If file-based, ensure directory exists
  if (dbPath !== ':memory:') {
    const dir = path.dirname(path.resolve(dbPath));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseSync(dbPath);

  // Enforce foreign key constraints
  db.exec('PRAGMA foreign_keys = ON;');
  
  if (dbPath !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
  }

  // Load and execute schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);

  return db;
}

/**
 * Singleton database accessor
 * @param {string} [dbPath]
 * @returns {DatabaseSync}
 */
function getDatabase(dbPath) {
  if (!activeDbInstance) {
    activeDbInstance = initDatabase(dbPath);
  }
  return activeDbInstance;
}

/**
 * Execute an ACID transaction block
 * @param {DatabaseSync} db 
 * @param {Function} callback 
 */
function withTransaction(db, callback) {
  db.exec('BEGIN TRANSACTION;');
  try {
    const result = callback(db);
    db.exec('COMMIT;');
    return result;
  } catch (err) {
    try {
      db.exec('ROLLBACK;');
    } catch (rollbackErr) {
      // ignore secondary rollback error
    }
    throw err;
  }
}

/**
 * Helper to close active singleton database (useful in test teardown)
 */
function closeDatabase() {
  if (activeDbInstance) {
    try {
      activeDbInstance.close();
    } catch (e) {
      // already closed
    }
    activeDbInstance = null;
  }
}

module.exports = {
  initDatabase,
  getDatabase,
  withTransaction,
  closeDatabase
};
