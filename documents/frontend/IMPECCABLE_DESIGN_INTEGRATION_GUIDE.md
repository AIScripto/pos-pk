# Impeccable Design Integration & POS UI/UX Architecture Guide

---

## 1. Architectural Strategy & Vision

As the **Principal UI/UX Designer & Senior Solution Architect**, this guide operationalizes the **[Impeccable.style](https://impeccable.style)** design engineering standard directly into our **Vite + React 18 + TypeScript** retail POS platform (`pos-pk`).

### Core Objectives
1. **Eliminate AI UI Slop**: Strip out repetitive nested cards, low-contrast pastels, and status-chip soup.
2. **Cashier Speed & Ergonomics**: Enforce minimum 48px touch targets, fixed-dimension containers to eliminate layout shifts, and rapid keyboard-driven workflows.
3. **Tabular Numerics**: Standardize all PKR currency figures, tax calculations, and barcode data with fixed-width tabular figures (`tnum`).
4. **Resilient POS Edge States**: Guarantee hardened visual states for network disconnection, FBR fiscalization latency, receipt printer offline, and cash drawer timeouts.

---

## 2. Configuration & Tooling Setup

### 2.1 NPM Scripts Configuration (`frontend/package.json`)
Add dedicated design quality gates and detector scripts:

```json
{
  "scripts": {
    "lint:design": "impeccable detect src/",
    "design:audit": "impeccable audit --strict",
    "design:live": "impeccable live --port 5173"
  }
}
```

### 2.2 Agent Configuration (`.impeccable/config.json`)
```json
{
  "framework": "react",
  "bundler": "vite",
  "styling": "tailwind",
  "rules": {
    "wcagContrast": "AA",
    "minTouchTarget": 48,
    "tabularNumbers": true,
    "maxCardNestingDepth": 1
  }
}
```

---

## 3. Design Tokens Architecture (`src/styles/tokens.css`)

Our design tokens are structured to guarantee high-contrast readability under varying retail lighting conditions (harsh fluorescent lights, direct sunlight, or dim counter environments):

```css
:root {
  /* Surface Hierarchies */
  --pos-canvas: #090D16;
  --pos-panel: #111827;
  --pos-panel-raised: #1F2937;
  --pos-border: #374151;
  --pos-border-focus: #3B82F6;

  /* Action & Semantic Tokens */
  --pos-action-cash: #059669;      /* High-contrast Complete/Pay Green */
  --pos-action-cash-hover: #10B981;
  --pos-action-accent: #2563EB;    /* Modifiers / Split Bill Blue */
  --pos-action-danger: #DC2626;    /* Void / Delete Red */
  --pos-action-numpad: #1E293B;    /* Tactile Keypad Surface */

  /* Text & Typography */
  --pos-text-primary: #F9FAFB;     /* 98% Contrast Ratio */
  --pos-text-secondary: #9CA3AF;   /* Sub-labels & Metadata */
  --pos-text-muted: #6B7280;

  /* Typography Feature Settings */
  --pos-font-tabular: "Outfit", "Inter", -apple-system, sans-serif;
}

/* Enforce Tabular Numerics for Currency and Quantities */
.pos-numeric {
  font-family: var(--pos-font-tabular);
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
  letter-spacing: -0.02em;
}
```

---

## 4. Cashier Component Modernization Roadmap

| Priority | Component Area | Current Pain Point | Target Impeccable Command & Pattern |
| :--- | :--- | :--- | :--- |
| **P0** | **Cashier Login & Lock** ([CashierLoginForm.tsx](file:///Users/tk-lpt-1088/development/react/pos-pk/frontend/src/components/auth/CashierLoginForm.tsx)) | Small numpad buttons, ambiguous error states | `/impeccable harden` + `/impeccable bolder`<br>Enforce 64px PIN numpad, tactile vibration feedback, auto-focus PIN input. |
| **P0** | **Cart Summary & Totals** | Shift on dynamic line items, proportional font numbers | `/impeccable typeset` + `/impeccable distill`<br>Fixed layout height, right-aligned tabular PKR totals, prominent green Pay CTA. |
| **P1** | **Payment Modal (Multi-Tender)** | Cluttered payment options, card-in-card nesting | `/impeccable clarify`<br>Single-level modal with large Cash, Card, Raast QR, and Credit buttons. |
| **P1** | **Receipt & FBR Status Preview** | Weak typography hierarchy, unaligned tax breakdowns | `/impeccable typeset`<br>Monospace/tabular thermal printer preview layout with QR verification code badge. |
| **P2** | **Offline Banner & Sync Indicator** | Intrusive overlay blocking cashier entry | `/impeccable quieter`<br>Subtle top-bar pulse dot with instant offline queue badge. |

---

## 5. Standard Operating Procedure for AI Design Commands

When developing or refactoring any POS frontend component with our AI harness:

1. **Before writing code**: Run `/impeccable shape [component]` to produce a brief focusing on cashier ergonomics and keybindings.
2. **After initial implementation**: Run `/impeccable audit` to automatically flag contrast issues, overflow risks, and nested DOM depth.
3. **For fine-tuning**:
   - Use `/impeccable distill` if the view feels crowded.
   - Use `/impeccable typeset` if prices, quantities, or tables are misaligned.
   - Use `/impeccable harden` to verify zero-quantity cart, network drop, and refund permission edge cases.
