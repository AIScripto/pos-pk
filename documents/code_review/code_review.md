# Code Review Checklist
## Architecture & Principles (25 pts)
- **Separation of Concerns**: Are global concerns (notifications, auth, routing, offline) handled by dedicated layers and not leaked into feature components? (0/5)
- **UI Libraries**: Is the custom component library (e.g., `PrimaryButton`) used exclusively, avoiding direct usage of raw HTML tags or third-party libraries (e.g., `MUI Button`)? (0/5)
- **State Management**: Is state scoped correctly? (e.g., session state in `AuthContext`, UI state in local components) (0/5)
- **Data Fetching Patterns**: Are there standard hooks (e.g., `useAPI`) for data fetching? (0/5)
- **Type Safety**: Does the codebase strictly enforce TypeScript interfaces and types (e.g., `Product`, `User`)? (0/5)

## Features & Correctness (30 pts)
- **F1: Auth & Role Management** (5/5) - Checks for proper session handling and role-based UI. *No issues found.*
- **F2: Navigation** (0/20) - Checks for breadcrumb, sidebar, and global tab navigation. *No breadcrumbs or global tabs found.*
- **F3: POS Page** (0/5) - Checks for product grid, cart, and ordering logic. *Cart logic and order creation seem to rely heavily on mock data; verify cart state initialization and order submission.*

## Patterns & Practices (20 pts)
- **P1: File & Component Naming**: Are components named consistently (e.g., PascalCase) and placed in appropriate directories? (0/5)
- **P2: CSS Standards**: Is styling handled via a shared design system (e.g., Tailwind CSS classes) rather than inline styles or custom CSS files per component? (0/5)
- **P3: Telemetry**: Are standard telemetry hooks (e.g., `useTrackEvent`) used for analytics and tracking? (0/5)
- **P4: Mock Data**: Is mock data properly isolated and used only for testing or demo purposes? (0/5)

## Code Quality (15 pts)
- **Q1: Error Handling**: Is error handling robust, with user-friendly messages and proper logging? (0/5)
- **Q2: Logging**: Is the logging strategy consistent (e.g., using a custom logger)? (0/5)
- **Q3: Performance**: Are there any obvious performance bottlenecks (e.g., unnecessary re-renders, heavy computations in render)? (0/5)

## Security & Robustness (10 pts)
- **S1: Input Validation**: Is user input validated to prevent security vulnerabilities? (0/5)
- **S2: Secure Data Handling**: Are sensitive data (passwords, tokens) handled securely? (0/5)

## Comments on Code
1. **Hardcoded Strings**: The string "4/5" appears multiple times in the code (e.g., in `OrderSidePanel.tsx` and ` POSPage.tsx`). This should be extracted to a constants file or configuration.
2. **Mock Data Dependency**: The `POSPage.tsx` heavily relies on hardcoded mock data for products and categories. This should be replaced with data from a proper API or store.
3. **Incomplete Navigation**: The navigation structure seems incomplete, with references to breadcrumbs and global tabs that are not fully implemented or visible.
4. **Unused Imports**: There are several unused imports in various files (e.g., `DialogContentText` in `ProductModal.tsx`, `OrderType` in `OrderSidePanel.tsx`). These should be removed.
5. **Inconsistent Styling**: While some components use Tailwind classes, others use inline styles (`style={{ ... }}`). A consistent styling approach should be adopted.

## Total Score: 35/100

## General Notes
- The project shows a good understanding of React principles and component-based architecture.
- The use of context for state management (e.g., `OrderContext`) is well-implemented.
- There is a clear effort to separate concerns, with dedicated components for different features.
- However, there are significant gaps in feature implementation (e.g., complete navigation, robust data handling) and adherence to best practices (e.g., hardcoded strings, inconsistent styling).

## Action Items
- [ ] Complete the navigation system and ensure breadcrumbs and global tabs are properly implemented.
- [ ] Replace mock data with real data from a proper source.
- [ ] Extract hardcoded strings to a constants file.
- [ ] Implement a consistent styling approach (e.g., Tailwind CSS).
- [ ] Remove unused imports and code.
- [ ] Add proper error handling and logging.
- [ ] Implement input validation for user inputs.
- [ ] Review and improve telemetry tracking implementation.
- [ ] Ensure sensitive data is handled securely.