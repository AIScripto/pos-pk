# Implementation Plan — Test Accounts Selector on Login Interfaces

To simplify testing and demo actions, we will design and implement a beautiful, interactive **Test Accounts Selector** panel on the POS and Admin login pages. When clicked, it will automatically populate the credentials and set the appropriate login mode.

## User Review Required

> [!IMPORTANT]
> The login screens will display a list of available test accounts (Admin, Manager, Cashier) with emails, passwords, and PIN codes. Users will be able to click on any account to automatically fill the form and select the corresponding login tab.

## Open Questions

None.

## Proposed Changes

### Frontend: Login Pages Redesign

Add interactive test credentials widgets.

---

#### [MODIFY] [LoginPage.tsx](file:///Users/tk-lpt-1088/development/react/crip-crumbs/frontend/src/pages/LoginPage.tsx)
- Add a new interactive "Test Accounts Selector" panel inside the login card under `SHOW_DEMO_CREDENTIALS` (or as a separate sidebar block).
- Create a list mapping the three available roles (`admin`, `manager`, `pos` / `cashier`) with their respective email and password.
- Implement click handlers on each test account card to:
  - Auto-set the correct `mode` (`cashier` or `admin`).
  - Populate the corresponding email and password state variables.
  - Auto-select the first available branch and terminal if cashier mode is chosen.

---

#### [MODIFY] [AdminLoginPage.tsx](file:///Users/tk-lpt-1088/development/react/crip-crumbs/frontend/src/pages/admin/AdminLoginPage.tsx)
- Replace the simple single-line text credentials with a beautiful list of all available test roles.
- Implement the click handler to pre-fill the Admin login form fields automatically with the chosen account details.

## Verification Plan

### Automated Tests
- Run typecheck to verify frontend compiles perfectly:
  ```bash
  npm run typecheck
  ```

### Manual Verification
- Render the POS login screen (`/login`) and the Admin login screen (`/admin/login`).
- Verify that clicking on "Admin", "Manager", or "Cashier" correctly pre-fills the form and switches the active mode.
