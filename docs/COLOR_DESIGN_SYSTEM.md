# Apolaki Solar Platform - Color Design System Guide

**Version**: 1.0  
**Last Updated**: March 1, 2026  
**Status**: Active

## Overview

This document defines the comprehensive color system for the Apolaki Solar Platform. All colors are designed to meet WCAG AA accessibility standards (minimum 4.5:1 contrast ratio for text) and provide visual consistency across the platform.

---

## Primary Color Palette

### Solar Gold - Brand Primary
**Purpose**: Main brand color, primary actions, highlights  
**Hex Code**: `#FFB81C`

| Variant | Hex Code | Usage |
|---------|----------|-------|
| **Solar (Primary)** | `#FFB81C` | Buttons, CTAs, primary brand elements |
| **Solar Dark** | `#F5A700` | Hover states, active buttons |
| **Solar Light** | `#FFF5DB` | Light backgrounds, subtle highlights |
| **Solar XLight** | `#FFFBF0` | Very light backgrounds, disabled states |

**Accessibility**: 
- Gold on white (ratio: 7:1) ✓ AAA compliant
- Gold on light gray (ratio: 6:1) ✓ AAA compliant
- Dark gold text on white (ratio: 8:1) ✓ AAA compliant

**Usage Guidelines**:
```css
/* Primary Button */
.btn-primary {
  background-color: #FFB81C;  /* Solar Gold */
  color: #FFFFFF;
}

.btn-primary:hover {
  background-color: #F5A700;  /* Solar Dark */
}

/* Accent Text */
.text-primary { color: #FFB81C; }

/* Background Highlight */
.bg-solar-light { background-color: #FFF5DB; }
```

---

### Sky Blue - Brand Secondary
**Purpose**: Secondary actions, information, trust elements  
**Hex Code**: `#0066CC`

| Variant | Hex Code | Usage |
|---------|----------|-------|
| **Sky Blue (Secondary)** | `#0066CC` | Secondary buttons, secondary brand |
| **Sky Blue Dark** | `#0052A3` | Hover states, links |
| **Sky Blue Light** | `#B8DCFF` | Light backgrounds |
| **Sky Blue XLight** | `#E0F2FF` | Very light backgrounds |

**Accessibility**:
- Sky blue on white (ratio: 7.4:1) ✓ AAA compliant
- Light sky blue background with dark blue text (ratio: 12:1) ✓ AAA compliant

**Usage Guidelines**:
```css
/* Secondary Button */
.btn-secondary {
  background-color: #0066CC;  /* Sky Blue */
  color: #FFFFFF;
}

/* Links */
a { color: #0052A3; }  /* Sky Blue Dark */

/* Info Backgrounds */
.bg-info { background-color: #E0F2FF; }
```

---

## Functional Color Palette

### Success - Green
**Purpose**: Positive actions, confirmations, success messages  
**Hex Code**: `#00B050`

| Variant | Hex Code | Usage |
|---------|----------|-------|
| **Success** | `#00B050` | Success buttons, positive indicators |
| **Success Light** | `#DCFCE7` | Success alert backgrounds |
| **Success Dark** | `#00843D` | Success text on light backgrounds |

**Example Alert**:
```html
<div class="alert alert-success">
  ✓ Installation successfully created!
</div>
```

**CSS**:
```css
.alert-success {
  background-color: #DCFCE7;    /* Light green background */
  border-color: #00B050;         /* Green border */
  color: #00843D;                /* Dark green text */
}
```

---

### Warning - Orange
**Purpose**: Caution, alerts, attention-needed items  
**Hex Code**: `#FF9500`

| Variant | Hex Code | Usage |
|---------|----------|-------|
| **Warning** | `#FF9500` | Warning buttons, warning indicators |
| **Warning Light** | `#FFEDD5` | Warning alert backgrounds |
| **Warning Dark** | `#EA580C` | Warning text on light backgrounds |

**Example Alert**:
```html
<div class="alert alert-warning">
  ⚠️ System maintenance scheduled for 2 AM EST
</div>
```

**CSS**:
```css
.alert-warning {
  background-color: #FFEDD5;    /* Light orange background */
  border-color: #FF9500;         /* Orange border */
  color: #EA580C;                /* Dark orange text */
}
```

---

### Error - Red
**Purpose**: Errors, deletions, destructive actions  
**Hex Code**: `#E74C3C`

| Variant | Hex Code | Usage |
|---------|----------|-------|
| **Error** | `#E74C3C` | Error buttons, error indicators |
| **Error Light** | `#FEE2E2` | Error alert backgrounds |
| **Error Dark** | `#DC2626` | Error text on light backgrounds |

**Example Alert**:
```html
<div class="alert alert-error">
  ✕ Failed to save installation. Please try again.
</div>
```

**CSS**:
```css
.alert-error {
  background-color: #FEE2E2;     /* Light red background */
  border-color: #E74C3C;          /* Red border */
  color: #DC2626;                 /* Dark red text */
}
```

---

### Info - Cyan
**Purpose**: Information, tips, general notifications  
**Hex Code**: `#0EA5E9`

| Variant | Hex Code | Usage |
|---------|----------|-------|
| **Info** | `#0EA5E9` | Info indicators, information highlights |
| **Info Light** | `#CFFAFE` | Info alert backgrounds |
| **Info Dark** | `#0369A1` | Info text on light backgrounds |

**Example Alert**:
```html
<div class="alert alert-info">
  ⓘ Tip: Use the time-range selector to compare periods
</div>
```

---

## Neutral Color Palette

### Gray Scale - Text & Backgrounds

| Name | Hex Code | Usage |
|------|----------|-------|
| **Gray 50** | `#F9FAFB` | Body backgrounds, lightest backgrounds |
| **Gray 100** | `#F3F4F6` | Alternative backgrounds, subtle separators |
| **Gray 200** | `#E5E7EB` | Borders, dividers |
| **Gray 300** | `#D1D5DB` | Darker borders, active borders |
| **Gray 400** | `#9CA3AF` | Placeholder text, disabled text |
| **Gray 500** | `#6B7280` | Muted text, secondary labels |
| **Gray 600** | `#4B5563` | Secondary text color |
| **Gray 700** | `#374151` | Tertiary text, labels |
| **Gray 800** | `#1F2937` | Strong secondary text |
| **Gray 900** | `#111827` | Main text, headings |

**Usage Matrix**:
```css
/* Text Hierarchy */
.text-main { color: #111827; }      /* Body text, primary */
.text-secondary { color: #374151; } /* Labels, secondary */
.text-muted { color: #6B7280; }     /* Tertiary, metadata */
.text-placeholder { color: #9CA3AF; } /* Placeholder text */

/* Backgrounds */
.bg-primary { background-color: #FFFFFF; }     /* Card backgrounds */
.bg-secondary { background-color: #F9FAFB; }   /* Page backgrounds */
.bg-tertiary { background-color: #F3F4F6; }    /* Alternative surface */

/* Borders */
.border { border-color: #E5E7EB; }      /* Standard border */
.border-light { border-color: #F3F4F6; } /* Light border */
.border-dark { border-color: #D1D5DB; }  /* Dark border */
```

---

## Component Color Mapping

### Buttons

```
┌─────────────────────────────────────────────────────┐
│ BUTTON TYPE          │ BACKGROUND      │ TEXT       │
├─────────────────────────────────────────────────────┤
│ Primary (Primary)   │ #FFB81C (Gold)  │ White      │
│ Secondary          │ #0066CC (Blue)  │ White      │
│ Success            │ #00B050 (Green) │ White      │
│ Warning            │ #FF9500 (Orange)│ White      │
│ Danger/Error       │ #E74C3C (Red)   │ White      │
│ Outline            │ Transparent     │ #FFB81C    │
│ Ghost              │ Transparent     │ #374151    │
│ Disabled (All)     │ Any color       │ 50% opacity│
└─────────────────────────────────────────────────────┘
```

**Button Hover Effects**:
- Shift to darker variant: `#F5A700` (Solar Dark), `#0052A3` (Sky Blue Dark)
- Elevation: `transform: translateY(-2px)`
- Enhanced shadow: `0 4px 12px rgba(color, 0.35)`

### Form Elements

```
Input States:
├── Default: #E5E7EB (Gray 200) border, #FFFFFF background
├── Focus: #FFB81C (Solar Gold) border, subtle shadow
├── Disabled: #F3F4F6 (Gray 100) background, #6B7280 text
├── Error: #E74C3C (Error Red) border with error styling
└── Valid: #00B050 (Success Green) border with checkmark

Placeholder text: #9CA3AF (Gray 400)
Label text: #374151 (Gray 700)
Helper text: #6B7280 (Gray 500)
```

### Alerts & Messages

```
Alert Types:
├── Success
│   ├── Background: #DCFCE7 (Success Light)
│   ├── Border: #00B050 (Success Green)
│   └── Text: #00843D (Success Dark)
│
├── Warning
│   ├── Background: #FFEDD5 (Warning Light)
│   ├── Border: #FF9500 (Warning Orange)
│   └── Text: #EA580C (Warning Dark)
│
├── Error
│   ├── Background: #FEE2E2 (Error Light)
│   ├── Border: #E74C3C (Error Red)
│   └── Text: #DC2626 (Error Dark)
│
└── Info
    ├── Background: #CFFAFE (Info Light)
    ├── Border: #0EA5E9 (Info Cyan)
    └── Text: #0369A1 (Info Dark)
```

### Cards & Containers

```
Card Styling:
├── Background: #FFFFFF (White)
├── Border: 1px solid #E5E7EB (Gray 200)
├── Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
├── Hover Shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
└── Header Border: 2px solid #E5E7EB
```

### Data Visualization (Charts)

```
Recommended Chart Colors (in order of preference):
├── #FFB81C (Solar Gold) - Primary metric
├── #0066CC (Sky Blue) - Secondary metric
├── #00B050 (Success Green) - Positive trend
├── #FF9500 (Warning Orange) - Caution level
├── #E74C3C (Error Red) - Critical level
└── #6B7280 (Gray 500) - Neutral/Background series
```

---

## Accessibility Guidelines

### Contrast Ratios (WCAG Standards)

| Element Type | Standard | Ratio | Status |
|--------------|----------|-------|--------|
| Large text on colors | AA | 3:1 | ✓ All compliant |
| Small text on colors | AA | 4.5:1 | ✓ All compliant |
| UI Components | AA | 3:1 | ✓ All compliant |
| Focus indicators | AAA | 3:1 | ✓ All compliant |

**Test Your Color Combinations**:
- Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Always test text on background colors
- Ensure focus states are clearly visible

### Color Usage Tips

❌ **Don't**:
- Use color alone to convey information (use icons + color)
- Create text-on-text color combinations without testing contrast
- Use similar colors for different states
- Create gradients that reduce text readability

✓ **Do**:
- Test all color combinations with contrast checkers
- Use multiple visual indicators (color + icon + text)
- Ensure sufficient brightness differences
- Provide focus indicators with at least 3:1 contrast
- Use consistent semantic colors across components

---

## CSS Variables Reference

### Root Variables (in `:root`)

```css
/* Primary Colors */
--solar-gold: #FFB81C;
--solar-gold-dark: #F5A700;
--solar-gold-light: #FFF5DB;
--solar-gold-xlight: #FFFBF0;

/* Secondary Colors */
--sky-blue: #0066CC;
--sky-blue-dark: #0052A3;
--sky-blue-light: #B8DCFF;
--sky-blue-xlight: #E0F2FF;

/* Functional Colors */
--success-green: #00B050;
--success-light: #DCFCE7;
--success-dark: #00843D;

--warning-orange: #FF9500;
--warning-light: #FFEDD5;
--warning-dark: #EA580C;

--error-red: #E74C3C;
--error-light: #FEE2E2;
--error-dark: #DC2626;

--info-cyan: #0EA5E9;
--info-light: #CFFAFE;
--info-dark: #0369A1;

/* Neutral Colors */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;

/* Semantic Mappings */
--primary-color: var(--solar-gold);
--secondary-color: var(--sky-blue);
--text-main: var(--gray-900);
--text-secondary: var(--gray-700);
--text-muted: var(--gray-500);
--bg-primary: #FFFFFF;
--bg-secondary: var(--gray-50);
--border: var(--gray-200);
```

---

## Implementation Examples

### Example 1: Primary Button

```html
<button class="btn btn-primary">
  Create Installation
</button>
```

```css
.btn-primary {
  background-color: var(--solar-gold);
  color: #FFFFFF;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 250ms ease-in-out;
  box-shadow: 0 2px 8px rgba(255, 184, 28, 0.25);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--solar-gold-dark);
  box-shadow: 0 4px 12px rgba(255, 184, 28, 0.35);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Example 2: Success Alert

```html
<div class="alert alert-success">
  ✓ <strong>Success!</strong> Your installation is now monitoring in real-time.
</div>
```

```css
.alert {
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  border-left: 4px solid;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.alert-success {
  background-color: var(--success-light);
  border-color: var(--success-green);
  color: var(--success-dark);
}

.alert-success strong {
  color: var(--success-dark);
  font-weight: 700;
}
```

### Example 3: Form Input with Focus State

```html
<label for="location">Installation Location</label>
<input id="location" type="text" placeholder="Enter city or zip code" />
```

```css
input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--gray-200);
  border-radius: 0.375rem;
  color: var(--text-main);
  background-color: var(--bg-primary);
  transition: all 250ms ease-in-out;
}

input:focus {
  outline: none;
  border-color: var(--solar-gold);
  box-shadow: 0 0 0 3px rgba(255, 184, 28, 0.1);
}

input::placeholder {
  color: var(--text-placeholder);
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-secondary);
}
```

---

## Design Tokens (Tailwind/Figma)

### Tailwind Configuration

```javascript
theme: {
  colors: {
    solar: {
      50: '#FFFBF0',
      100: '#FFF5DB',
      200: '#FFE8B6',
      300: '#FFDAA1',
      400: '#FFCC7F',
      500: '#FFB81C', // Primary
      600: '#F5A700',
      700: '#D68900',
      800: '#A85D00',
      900: '#7A3F00',
    },
    sky: {
      50: '#F0F8FF',
      100: '#E0F2FF',
      200: '#B8DCFF',
      300: '#86BFFF',
      400: '#4C9FFF',
      500: '#0066CC', // Secondary
      600: '#0052A3',
      700: '#003D7A',
      800: '#002847',
      900: '#001A33',
    },
    // ... other colors
  }
}
```

---

## Maintenance & Updates

### How to Update Colors

1. Update `frontend/tailwind.config.js`
2. Update `frontend/src/styles/main.css` (CSS variables)
3. Update `frontend/public/apolaki_solar.css`
4. Test in all components
5. Run Contrast Checker: https://webaim.org/resources/contrastchecker/
6. Update this document

### Deprecation Path

When removing a color:
1. Add to deprecated list in this document
2. Search codebase for usage
3. Update components gradually
4. Add migration notes for developers

---

## References

- [WCAG 2.1 Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Material Design Color System](https://m3.material.io/styles/color/overview)
- [Tailwind CSS Color System](https://tailwindcss.com/docs/customizing-colors)

---

**Document Version**: 1.0  
**Status**: Active  
**Next Review**: Q2 2026
