# FixFlow — Multi-Tenant Repair Operations & Customer Identity Platform

FixFlow is a production-grade SaaS platform engineered for electronic repair shops and their customers, featuring strict multi-tenancy, zero-leakage phone OTP authentication, customer deduplication, and a configurable SaaS subscription tier engine.

---

## 🌟 Key Architecture & Capabilities

### 1. Dual-Portal Experience
- **FixFlow Operations Portal (`/`)**: For repair shop owners and staff to create repair tickets, assign technicians, manage team seats, and switch subscription plans.
- **FixFlow Track (`/`)**: For customers to securely track repair status across multiple shops using only their phone number and a verified OTP code.

### 2. Verified Customer Identity & Anti-Duplication
- **E.164 Normalization**: Standardizes international phone numbers (e.g., `9876543210`, `09876543210`, `+91 98765 43210`, `(415) 555-2671`) using `google-libphonenumber`.
- **Global Identity Table**: Every customer has exactly one verified account in `customers` keyed by `phone_e164`. If a customer visits multiple FixFlow shops, their repairs are linked to their global account without creating duplicate customer entries.
- **Tenant Context (`shop_customers`)**: Each shop keeps isolated customer notes and display names without leaking them across shops.

### 3. Cryptographic Phone OTP Authentication
- **Anti-Enumeration Protection**: Phone lookup endpoints return a uniform generic response, preventing attackers from probing whether a phone number has repair records.
- **Salted SHA-256 Hashing**: OTPs are never stored in plain text.
- **Security Boundaries**:
  - 5-minute expiration window.
  - Maximum 3 incorrect attempts lockout.
  - 60-second resend cooldown (`429 COOLDOWN_ACTIVE`).
  - Rate limiting (max 5 requests per hour).
- **Pluggable SMS Provider**:
  - `MockSmsProvider`: In-memory driver for automated tests and development.
  - `ConsoleSmsProvider`: Prints styled OTP banners to stdout for manual local testing.
  - `TwilioSmsProvider`: Production delivery via Twilio API using environment credentials.

### 4. Role-Based Access Control (RBAC) & Tenant Isolation
- **Roles**:
  - `OWNER`: Full workspace control, subscription management, staff seat additions.
  - `MANAGER`: Ticket lifecycle management, staff assignment.
  - `TECHNICIAN`: Update ticket diagnostics, repair status, and progress notes.
- **Backend Isolation**: Every query is strictly scoped to `WHERE workspace_id = req.workspaceId` or `WHERE customer_id = req.customer.id`. Phone numbers alone never grant access to repair records.

### 5. Practical SaaS Subscription Model
Configurable plan definitions in `src/config/plans.js`:

| Plan | Price | Staff Limit | Branches | Features Included |
| :--- | :--- | :--- | :--- | :--- |
| **Free** | ₹0/mo | 1 (Owner only) | 1 | Core repair management, customer tracking, **unlimited tickets** (not capped at 30/mo) |
| **Starter** | ₹199/mo | Up to 3 | 1 | Basic reports, team coordination, SMS notifications |
| **Pro** | ₹499/mo | Up to 10 | 1 | Parts Inventory, Repair Passport certification, advanced reports |
| **Business** | ₹999/mo | Up to 25 | Up to 5 | Multi-branch franchise management, advanced analytics |

- **Backend Limit Enforcement**: Blocks adding staff once seat allowance is reached.
- **Downgrade Safeguard**: Blocks downgrading to a lower tier if active staff count exceeds the target plan's allowance.
- **Dev Sandbox Switcher**: Easily test upgrades/downgrades without a payment gateway.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ (tested on Node.js v24.13)
- npm v9+

### Installation & Setup
```bash
# Navigate to the workspace
cd "C:\Users\Abhimanyu Kotari\.gemini\antigravity\scratch\fixflow"

# Install dependencies (already installed)
npm install

# Start the FixFlow Server
npm start
```
The server will boot at: **`http://localhost:4000`**

### Running the Automated Test Suite
FixFlow includes 58 automated unit and end-to-end integration tests:
```bash
npm test
```

---

## 📁 Project Structure

```
fixflow/
├── package.json
├── .env.example
├── .env
├── README.md
├── src/
│   ├── config/
│   │   ├── env.js                  # Validated environment configuration
│   │   └── plans.js                # Configurable SaaS tier definitions & quotas
│   ├── db/
│   │   ├── database.js             # SQLite manager with ACID transactions (node:sqlite)
│   │   └── schema.sql              # Multi-tenant schema with foreign keys and indexes
│   ├── middleware/
│   │   ├── auth.js                 # Repairer JWT authentication & RBAC guards
│   │   ├── customerAuth.js         # Customer portal OTP session guard
│   │   └── planGuards.js           # SaaS feature entitlement middleware
│   ├── routes/
│   │   ├── authRoutes.js           # Owner signup, login, profile (/api/auth)
│   │   ├── workspaceRoutes.js      # Workspace stats & staff seat management (/api/workspace)
│   │   ├── ticketRoutes.js         # Ticket intake & lifecycle (/api/tickets)
│   │   ├── customerRoutes.js       # Shop-level customer directory (/api/customers)
│   │   ├── trackRoutes.js          # Customer Phone OTP & Ticket Tracker (/api/track)
│   │   ├── subscriptionRoutes.js   # Subscription usage & dev plan switcher (/api/subscription)
│   │   └── premiumRoutes.js        # Gated Pro/Business feature endpoints (/api/features)
│   ├── services/
│   │   ├── authService.js          # Password hashing, token signing, registration
│   │   ├── workspaceService.js     # Staff seat check & workspace metrics
│   │   ├── ticketService.js        # Customer deduplication & ticket engine
│   │   ├── otpService.js           # Cryptographic OTP generation, hashing & cooldown
│   │   ├── subscriptionService.js  # Plan usage calculations & downgrade safeguards
│   │   └── sms/
│   │       └── smsProvider.js      # Pluggable SMS provider (Mock, Console, Twilio)
│   ├── utils/
│   │   ├── crypto.js               # Bcrypt & JWT wrappers
│   │   └── phone.js                # E.164 normalization via google-libphonenumber
│   ├── public/
│   │   ├── index.html              # Responsive Dual-Portal single-page application
│   │   └── app.js                  # Frontend controllers & state management
│   └── index.js                    # Express application entrypoint
└── test/
    ├── phone.test.js               # E.164 normalization & country code edge cases
    ├── plans.test.js               # Plan quotas & feature flag entitlements
    ├── database.test.js            # ACID transactions, foreign keys & isolation
    ├── repairer-auth.test.js       # Owner auth, RBAC & staff seat limits
    ├── tickets.test.js             # Ticket lifecycle & multi-shop customer deduplication
    ├── customer-portal-otp.test.js # Anti-enumeration, salted hash & cooldown
    ├── subscription.test.js        # Feature gating, upgrades & downgrade safeguards
    └── e2e.test.js                 # Complete end-to-end integration flow
```
