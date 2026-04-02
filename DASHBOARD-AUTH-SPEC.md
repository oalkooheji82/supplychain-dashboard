# AJM Kooheji Group — Dashboard Authentication & Tiered Access System

## Project Overview

Add a complete authentication layer, WhatsApp-based two-factor authentication (2FA), role-based tiered access control, admin portal, and audit trail to the existing AJM Kooheji Group Supply Chain Dashboard.

The dashboard is used internally by AJM Kooheji Group B.S.C. (C), a Bahrain-based conglomerate operating divisions including HVAC & Project Solutions, Education, Electronics & Home Appliances, Motor & Marine (Yamaha), Tyres (Bridgestone), and Delmon Furniture Factory (DFF).

---

## Architecture

### Frontend (React)
- Login screen → 2FA verification screen → Force password change (first login) → Dashboard
- The existing dashboard content becomes gated behind authentication
- All UI uses a dark theme consistent with the existing dashboard

### Backend (Node.js / Express)
- Separate Express server running on port 3001
- Handles Twilio Verify API calls for WhatsApp OTP delivery
- Endpoints: `/api/2fa/send`, `/api/2fa/verify`, `/api/health`, `/api/audit`
- Uses environment variables for Twilio credentials (never exposed to frontend)

### Data Storage
- User accounts, audit logs, and session data stored via the app's existing data layer (database, localStorage, or persistent storage as applicable)
- Passwords stored hashed (use bcrypt) — never in plain text

---

## Authentication Flow

### Step 1: Login
- User enters username + password
- Validate against stored user record
- If account is deactivated, block login with message "Account deactivated — contact admin"
- On success, proceed to 2FA

### Step 2: Two-Factor Authentication (WhatsApp via Twilio Verify)
- Frontend calls backend `POST /api/2fa/send` with:
  ```json
  {
    "phone": "+97312345678",
    "username": "john.doe",
    "channel": "whatsapp"
  }
  ```
- Backend calls Twilio Verify API to send a 6-digit OTP via WhatsApp
- If WhatsApp delivery fails (user doesn't have WhatsApp, error code 63024), backend automatically falls back to SMS
- User sees a 6-digit code entry screen with:
  - Six individual digit input boxes (auto-advance on entry, backspace goes back)
  - Display which channel was used (WhatsApp or SMS fallback)
  - Show masked phone number (e.g., "****5678")
  - 60-second cooldown before allowing resend
  - "Cancel" button to return to login
- Frontend calls backend `POST /api/2fa/verify` with:
  ```json
  {
    "phone": "+97312345678",
    "code": "123456",
    "username": "john.doe"
  }
  ```
- Backend calls Twilio Verify API to check the code
- If `status === "approved"` → proceed to dashboard (or password change if first login)
- If failed → show error, allow retry

### Step 3: Forced Password Change (First Login Only)
- If user's `mustChangePassword` flag is `true`, show password change screen before granting dashboard access
- Password requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (!@#$%^&*)
  - Must be different from the current/initial password
- Show password strength meter (Weak / Good / Strong)
- Show/hide password toggle
- Confirm password field with real-time match indicator
- On success, update user record: set new password hash and `mustChangePassword: false`

### Session Management
- After successful 2FA, create a session (JWT token or session cookie)
- Session timeout after 8 hours of inactivity
- Log out clears the session and returns to login screen

---

## Backend Server Specification

### File: `server.js`

```
Dependencies: express, cors, dotenv, twilio, bcrypt
Port: 3001 (configurable via PORT env var)
```

### Environment Variables (.env)
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=3001
```

### Endpoints

#### POST /api/2fa/send
- Input: `{ phone, username, channel }` where channel is "whatsapp" (default) or "sms"
- Clean and validate phone number (must include country code, e.g., +973...)
- Rate limit: max 3 requests per phone number per minute
- Call `client.verify.v2.services(verifySid).verifications.create({ to: phone, channel: "whatsapp" })`
- On Twilio error 63024 (WhatsApp unavailable), auto-retry with `channel: "sms"`
- Log the event to audit trail
- Response: `{ success, message, channel, status }`
- Never expose the actual OTP code in the response

#### POST /api/2fa/verify
- Input: `{ phone, code, username }`
- Validate code is exactly 6 digits
- Call `client.verify.v2.services(verifySid).verificationChecks.create({ to: phone, code })`
- Handle Twilio error 60202 (max check attempts) and 20404 (verification expired)
- Log the event to audit trail
- Response: `{ success, verified, message }`

#### GET /api/health
- Response: `{ status: "ok", twilioConfigured: true/false, timestamp }`

#### GET /api/audit
- Admin-only endpoint (add authentication check)
- Query param: `?limit=50`
- Response: `{ total, entries: [...] }`

### Error Handling
Map Twilio error codes to user-friendly messages:
- 60200 → "Invalid phone number"
- 60203 → "Max verification attempts reached. Wait 10 minutes."
- 63024 → WhatsApp unavailable, trigger SMS fallback
- 60202 → "Max check attempts. Request a new code."
- 20404 → "Code expired. Request a new code."

---

## Tiered Access Control System

### Tier Definitions

| Tier | Level | Role Label | Colour |
|------|-------|------------|--------|
| admin | 5 | Admin | Red (#EF4444) |
| ceo | 5 | CEO | Amber (#F59E0B) |
| gm | 4 | General Manager | Purple (#8B5CF6) |
| director | 3 | Director | Blue (#3B82F6) |
| manager | 2 | Manager | Cyan (#06B6D4) |
| officer | 1 | Officer / Staff | Green (#10B981) |

### Access Matrix — What Each Tier Can See

#### Procurement Module
| Field | Level 5 (Admin/CEO) | Level 4 (GM) | Level 3 (Director) | Level 2 (Manager) | Level 1 (Officer) |
|-------|---------------------|--------------|--------------------|--------------------|-------------------|
| PR Number & Item | ✅ | ✅ | ✅ | ✅ | ✅ |
| Quantity | ✅ | ✅ | ✅ | ✅ | ✅ |
| PO Status | ✅ | ✅ | ✅ | ✅ | ❌ |
| Unit Cost / Total | ✅ | ✅ | ✅ | ❌ | ❌ |
| Vendor Name | ✅ | ✅ | ✅ | ❌ | ❌ |
| Vendor Contact | ✅ | ✅ | ✅ | ❌ | ❌ |
| Payment Terms | ✅ | ✅ | ✅ | ❌ | ❌ |
| Payment Status | ✅ | ✅ | ✅ | ❌ | ❌ |
| Price Breakdown | ✅ | ✅ | ✅ | ❌ | ❌ |
| Margins | ✅ | ✅ | ❌ | ❌ | ❌ |
| Approvals | ✅ | ✅ | ✅ | ❌ | ❌ |

#### Shipments Module
| Field | Level 5 | Level 4 | Level 3 | Level 2 | Level 1 |
|-------|---------|---------|---------|---------|---------|
| Transit Status & Updates | ✅ | ✅ | ✅ | ✅ | ✅ |
| Items Description | ✅ | ✅ | ✅ | ✅ | ✅ |
| ETA | ✅ | ✅ | ✅ | ✅ | ✅ |
| Vendor Name | ✅ | ✅ | ✅ | ✅ | ❌ |
| Carrier | ✅ | ✅ | ✅ | ❌ | ❌ |
| B/L Number | ✅ | ✅ | ✅ | ❌ | ❌ |
| Freight Cost | ✅ | ✅ | ✅ | ❌ | ❌ |
| Invoice Reference | ✅ | ✅ | ✅ | ❌ | ❌ |
| Cost / Value | ✅ | ✅ | ✅ | ❌ | ❌ |
| Customs Duty | ✅ | ✅ | ❌ | ❌ | ❌ |
| Landed Cost | ✅ | ✅ | ❌ | ❌ | ❌ |

**Key rule for shipments (Level 1-2):** Below GM level, users can ONLY see transit updates, items, and ETA. All financial information (cost, price, freight, customs, landed cost) and vendor names are hidden. This is because financial info is confidential.

#### Warehouse Module
| Field | Level 5 | Level 4 | Level 3 | Level 2 | Level 1 |
|-------|---------|---------|---------|---------|---------|
| Stock Quantity | ✅ | ✅ | ✅ | ✅ | ✅ |
| Location | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reorder Level | ✅ | ✅ | ✅ | ✅ | ❌ |
| Ageing | ✅ | ✅ | ✅ | ✅ | ❌ |
| Avg Cost | ✅ | ✅ | ✅ | ❌ | ❌ |
| Total Value | ✅ | ✅ | ❌ | ❌ | ❌ |
| Damaged Stock | ✅ | ✅ | ✅ | ✅ | ❌ |

#### Deliveries Module
| Field | Level 5 | Level 4 | Level 3 | Level 2 | Level 1 |
|-------|---------|---------|---------|---------|---------|
| Schedule & Status | ✅ | ✅ | ✅ | ✅ | ✅ |
| Items | ✅ | ✅ | ✅ | ✅ | ✅ |
| Date | ✅ | ✅ | ✅ | ✅ | ✅ |
| Customer | ✅ | ✅ | ✅ | ✅ | ❌ |
| Driver | ✅ | ✅ | ✅ | ✅ | ❌ |
| Vehicle | ✅ | ✅ | ✅ | ✅ | ❌ |
| POD (Proof of Delivery) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delivery Cost | ✅ | ✅ | ✅ | ❌ | ❌ |
| Revenue | ✅ | ✅ | ❌ | ❌ | ❌ |

### Implementation Rules
- Columns that a user cannot access should be **completely removed** from their table view — not shown as blank or masked
- On the overview/dashboard page, summary cards showing financial totals (e.g., "Total PO Value", "Warehouse Value") should only appear for Level 3+
- Show an access level banner at the top of the dashboard indicating the user's tier and what level of access they have
- Each user is assigned to a specific division (or "all" for Admin/CEO). Users below Level 5 can only see data for their assigned division unless they have "all" division access.

### Division Filter
- Admin/CEO (Level 5): Can see all divisions and filter between them
- GM and below: Can only see their assigned division's data
- Divisions: HVAC & Project Solutions, Education, Electronics & Home Appliances, Motor & Marine (Yamaha), Tyres (Bridgestone), Delmon Furniture Factory (DFF)

---

## Admin Portal

Only accessible to users with `tier: "admin"` or `role: "admin"`.

### Dashboard Tab
- Summary cards: Total Users, Active Users, Admin/CEO count, Logins in last 24 hours
- Recent Activity feed showing the last 15 audit log entries

### User Management Tab
- Search/filter users by name or username
- "Add User" button opens a modal form with:
  - Username (lowercase, no spaces)
  - Full Name
  - Mobile number (with country code, e.g., +97312345678)
  - Initial password (user must change on first login)
  - Access Tier selector (CEO, GM, Director, Manager, Officer)
  - Division assignment (All, or specific division)
  - 2FA Method (WhatsApp or SMS)
  - Active toggle (on/off)
- Edit existing users (same form, pre-populated)
- Reset password button (generates temporary password, sets `mustChangePassword: true`)
- Activate/deactivate users
- Display user table with columns: User, Mobile, Tier, Division, 2FA Method, Status, Last Login, Actions

### Access Matrix Tab
- Visual display of the full access matrix
- Shows green dot for allowed and red dot for restricted
- Organized by module (Procurement, Shipments, Warehouse, Deliveries)
- Shows all tiers side by side so the admin can see at a glance what each level can access

### Audit Trail Tab
- Filterable log of every system event
- Filter buttons: All, Login, Logout, 2FA, Password, User, View
- Table columns: Timestamp, Action, User, Details
- Actions logged:
  - `LOGIN_FAILED` — bad credentials attempt
  - `LOGIN_BLOCKED` — deactivated account attempt
  - `LOGIN_2FA_INIT` — 2FA code requested
  - `2FA_CODE_SENT` — code dispatched via WhatsApp/SMS
  - `2FA_SUCCESS` — correct code entered
  - `2FA_FAILED` — wrong code entered
  - `2FA_RATE_LIMITED` — too many attempts
  - `LOGIN_SUCCESS` — full login completed
  - `LOGOUT` — user logged out
  - `PASSWORD_CHANGED` — user changed password
  - `PASSWORD_RESET_BY_ADMIN` — admin reset a user's password
  - `USER_CREATED` — new user account created
  - `USER_UPDATED` — user details modified
  - `USER_ACTIVATED` / `USER_DEACTIVATED` — account status changed
  - `VIEW_TAB` — user navigated to a dashboard tab (with tab name, tier, and division in details)
- Keep last 500 audit entries
- Each entry includes: timestamp (ISO), action, userId, details object (varies by action type)

### Admin Dashboard Preview
- "View as Dashboard" button lets the admin see the main dashboard as it appears to regular users
- Shows a red banner at the top: "ADMIN PREVIEW — Viewing as Dashboard user" with a "Back to Admin" button

---

## User Data Model

```json
{
  "id": "john.doe",
  "username": "john.doe",
  "password": "$2b$10$...",
  "role": "user",
  "tier": "manager",
  "fullName": "John Doe",
  "mobile": "+97312345678",
  "division": "hvac",
  "twoFactorMethod": "whatsapp",
  "mustChangePassword": true,
  "active": true,
  "createdAt": "2026-03-31T00:00:00Z",
  "lastLogin": "2026-03-31T12:00:00Z"
}
```

---

## Default Admin Account

Create this on first application load if no admin exists:

| Field | Value |
|-------|-------|
| Username | admin |
| Password | Admin@2026 (hashed with bcrypt) |
| Tier | admin |
| Full Name | Omar Al Kooheji |
| Mobile | +97300000000 |
| Division | all |
| Must Change Password | false |
| Active | true |

---

## UI/UX Requirements

### Theme
- Dark background: #060A10 (main), #0C1220 (secondary), #111827 (cards)
- Accent blue: #3B82F6
- Use clean, modern fonts (Outfit for body, JetBrains Mono for data/monospace)
- Tier colours used consistently: Admin=Red, CEO=Amber, GM=Purple, Director=Blue, Manager=Cyan, Officer=Green

### Login Screen
- Centered card with AJM Kooheji branding
- Shield icon with gradient blue
- Username and password fields with icons
- Show/hide password toggle (eye icon)
- "Sign In" button with loading state
- "Protected by Two-Factor Authentication" footer text

### 2FA Screen
- Green-themed icon (phone)
- Show delivery channel (WhatsApp or SMS) and masked phone number
- Six individual digit boxes with auto-advance
- Verify button with loading state
- Cancel and Resend buttons
- 60-second cooldown timer on Resend

### Password Change Screen
- Amber-themed icon (key)
- Password strength meter (3-bar visual: Weak/Good/Strong)
- Real-time password validation feedback
- Confirm password with mismatch warning

### Dashboard Header
- AJM Kooheji logo/icon + "Supply Chain" label
- User's tier badge (coloured)
- User's division badge (if not "all")
- User's full name
- Logout button

### Access Level Banner
- Coloured strip below the header showing:
  - "Access Tier: [Label] (Level X/5)"
  - Description of what they can see at that level

### Restricted Data Display
- Columns that a user cannot see should be completely removed from the table (not shown at all)
- Never show blank cells or "N/A" for restricted fields — just remove the column entirely

---

## Divisions Reference

| ID | Name | Icon |
|----|------|------|
| hvac | HVAC & Project Solutions | ❄️ |
| education | Education | 📚 |
| electronics | Electronics & Home Appliances | 📺 |
| motor | Motor & Marine (Yamaha) | ⚓ |
| tyres | Tyres (Bridgestone) | 🔵 |
| dff | Delmon Furniture Factory | 🪑 |

---

## File Structure

```
project/
├── src/                          # Frontend (React)
│   ├── App.jsx                   # Main app with auth state machine
│   ├── components/
│   │   ├── LoginScreen.jsx       # Username + password form
│   │   ├── TwoFactorScreen.jsx   # 6-digit code entry
│   │   ├── ChangePassword.jsx    # First-login password change
│   │   ├── AdminPortal.jsx       # Admin panel (users, audit, matrix)
│   │   ├── Dashboard.jsx         # Main tiered dashboard
│   │   └── ui/                   # Reusable components (Button, Input, Badge, Card, Toast)
│   ├── lib/
│   │   ├── access.js             # Tier definitions, access matrix, canAccess() helper
│   │   ├── audit.js              # Audit logging functions
│   │   └── api.js                # Backend API call helpers
│   └── data/
│       └── divisions.js          # Division definitions
├── server/                       # Backend (Node.js)
│   ├── server.js                 # Express server with Twilio integration
│   ├── package.json
│   └── .env.example              # Template for Twilio credentials
└── README.md
```

---

## Implementation Checklist

1. [ ] Set up backend Express server with Twilio Verify integration
2. [ ] Create `.env` configuration with Twilio credentials
3. [ ] Implement login screen with username/password validation
4. [ ] Implement 2FA screen calling backend `/api/2fa/send` and `/api/2fa/verify`
5. [ ] Implement forced password change screen for first-login users
6. [ ] Hash passwords with bcrypt (never store plain text)
7. [ ] Build the tiered access control system with `canAccess(tier, module, field)` helper
8. [ ] Implement the access matrix for all 4 modules (Procurement, Shipments, Warehouse, Deliveries)
9. [ ] Gate the existing dashboard behind authentication
10. [ ] Add division filtering (restrict users to their assigned division)
11. [ ] Build Admin Portal with 4 tabs (Dashboard, Users, Access Matrix, Audit Trail)
12. [ ] Implement user CRUD (create, read, update, activate/deactivate)
13. [ ] Implement password reset by admin
14. [ ] Build full audit trail logging all events listed above
15. [ ] Add "View as Dashboard" preview for admin
16. [ ] Add access level banner showing user's tier
17. [ ] Remove restricted columns entirely from table views (not masked, removed)
18. [ ] Test all 5 tier levels to verify correct data visibility
19. [ ] Seed default admin account on first load
20. [ ] Add session timeout (8 hours)

---

## Testing Scenarios

### Test each tier level:
- **Admin (Level 5):** Should see all data in all divisions, plus admin portal
- **CEO (Level 5):** Same data access as admin, but no admin portal unless also role=admin
- **GM (Level 4):** Full division data including all financials, customs, landed cost
- **Director (Level 3):** Division data with financials but NO margins, NO total warehouse value
- **Manager (Level 2):** Open items only — NO cost/price, NO vendor name, NO payment info. Shipments show ONLY transit updates + items + ETA
- **Officer (Level 1):** Basic view — PR numbers, item names, transit status, ETA only. All financial and vendor info completely hidden

### Test 2FA flow:
- Happy path: WhatsApp code received and entered correctly
- Wrong code: Error message, allow retry
- Expired code: "Request a new code" message
- WhatsApp unavailable: Automatic SMS fallback
- Rate limiting: Block after 3 requests per minute

### Test admin functions:
- Create a new user with specific tier and division
- Verify the user must change password on first login
- Reset a user's password from admin portal
- Deactivate a user and verify they cannot log in
- Check audit trail records all events
