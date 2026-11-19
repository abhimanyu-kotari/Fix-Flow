-- FixFlow SQLite Database Schema
-- Multi-Tenant Data Architecture with Strict Workspace Isolation & Customer Deduplication

PRAGMA foreign_keys = ON;

-- 1. Workspaces (Repair Shops / Tenants)
CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Users (Shop Owners, Managers, and Technicians)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('OWNER', 'MANAGER', 'TECHNICIAN')),
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- 3. Customers (Global Verified Customer Accounts keyed by E.164 phone)
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    phone_e164 TEXT NOT NULL UNIQUE,
    default_name TEXT NOT NULL,
    is_verified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4. Shop-Customer Relationship (Shop-specific context, internal notes & overrides)
CREATE TABLE IF NOT EXISTS shop_customers (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    shop_display_name TEXT,
    internal_notes TEXT,
    first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(workspace_id, customer_id),
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 5. Repair Tickets
CREATE TABLE IF NOT EXISTS repair_tickets (
    id TEXT PRIMARY KEY,
    ticket_number TEXT NOT NULL UNIQUE,
    workspace_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    device_category TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    issue_description TEXT NOT NULL,
    estimated_cost REAL NOT NULL DEFAULT 0,
    estimated_completion_date TEXT,
    status TEXT NOT NULL DEFAULT 'RECEIVED' CHECK(status IN ('RECEIVED', 'DIAGNOSING', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'DELIVERED', 'CANCELLED')),
    assigned_to_user_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 6. Ticket History / Audit Trail
CREATE TABLE IF NOT EXISTS ticket_history (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    from_status TEXT,
    to_status TEXT NOT NULL,
    notes TEXT,
    changed_by_user_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (ticket_id) REFERENCES repair_tickets(id) ON DELETE CASCADE
);

-- 7. Subscriptions (1-to-1 with Workspace)
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL UNIQUE,
    plan_id TEXT NOT NULL DEFAULT 'free',
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELLED')),
    is_dev_override INTEGER NOT NULL DEFAULT 0,
    current_period_end TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- 8. OTP Verifications (Hashed OTPs with salt, expiry, and attempt limits)
CREATE TABLE IF NOT EXISTS otp_verifications (
    id TEXT PRIMARY KEY,
    phone_e164 TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    expires_at TEXT NOT NULL,
    last_sent_at TEXT NOT NULL DEFAULT (datetime('now')),
    consumed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_workspace ON users(workspace_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_e164);
CREATE INDEX IF NOT EXISTS idx_shop_customers_ws_cust ON shop_customers(workspace_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_ws ON repair_tickets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_cust ON repair_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_status ON repair_tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket ON ticket_history(ticket_id);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone_e164);
CREATE INDEX IF NOT EXISTS idx_subscriptions_ws ON subscriptions(workspace_id);
