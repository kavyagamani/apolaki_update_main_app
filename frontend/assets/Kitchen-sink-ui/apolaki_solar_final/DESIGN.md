# Kinetic Azure Design System

### 1. Overview & Creative North Star
**Creative North Star: The Precision Pulse**
Kinetic Azure is a high-performance design system built for the intersection of data density and editorial elegance. It moves away from the "cluttered dashboard" trope by treating data points as premium content. The system utilizes intentional asymmetry—such as offset alignment in headers and varying card heights—to create a rhythmic flow that guides the eye through complex information without fatigue.

### 2. Colors
The palette is anchored by a deep **Kinetic Azure (#0F6CBD)** and a high-contrast **Solar Gold (#F4C94C)**. A supporting tertiary color is `#b9b9b9`, providing additional flexibility.
- **The "No-Line" Rule:** Sectioning is achieved through shifts between `#FDFDFD` (Base), `#FFFFFF` (Elevated Cards), and `#1A1C1E` (Impact Sections). Traditional 1px borders are replaced by these tonal blocks or subtle `shadow-sm` elevations.
- **Surface Hierarchy:** 
    - **Base:** `#FDFDFD` for the main canvas.
    - **Level 1:** `#FFFFFF` for primary interaction cards.
    - **Impact:** `#1A1C1E` for dark-mode data visualizations within a light-mode layout.
- **Glass & Gradient:** Use `backdrop-blur-xl` with 80% opacity for sticky elements (Headers/Nav) to maintain spatial awareness.

### 3. Typography
Kinetic Azure utilizes a sophisticated scale that mixes ultra-tight display headings with wide-tracked labels, primarily using the **Plus Jakarta Sans** font family for a clean, modern aesthetic.
- **Display & Headline:** Uses **TT Fors** (Bold) and **Plus Jakarta Sans**. Headlines are set with `tight-display` (-0.04em letter spacing) to feel impactful and architectural.
- **Body & Labels:** **Plus Jakarta Sans** provides clarity.
- **Ground Truth Scale:**
    - **Large Display:** 36px (2.25rem) for hero metrics.
    - **Headlines:** 28px and 24px for section titles.
    - **Body:** 14px (0.875rem) and 16px (1rem).
    - **Micro-Labels:** 8px to 10px, always uppercase with `tracking-[0.1em]` to `0.2em` for a technical, precise feel.

### 4. Elevation & Depth
Depth is defined by "The Layering Principle" rather than heavy drop shadows.
- **Tonal Layering:** Objects gain importance by moving from the neutral `#FDFDFD` background onto `#FFFFFF` cards, or into the high-contrast `#1A1C1E` containers.
- **Ambient Shadows:** 
    - `shadow-sm`: Used for primary data cards to create a subtle lift from the background.
    - `shadow-lg`: Reserved for high-impact primary CTAs or floating action menus.
- **Glassmorphism:** Navigation and Header bars use a `95%` or `80%` white alpha with a 20px blur to simulate a premium frosted glass effect.

### 5. Components
- **Buttons:** 
    - *Primary:* Solid Azure or Gold with rounded-xl (12px) corners.
    - *Impact:* Ghost buttons with `white/10` background and `white/20` borders for use on dark containers.
- **Cards:** Defined by `bg-white`, `rounded-xl`, and `shadow-sm`. Interior padding is generous (20px to 24px).
- **Data Bars:** Use 20% opacity versions of the brand colors (e.g., `secondary/20`) for bar backgrounds to create a layered "liquid" look.
- **Status Indicators:** Small, 6px circles with `animate-pulse` for live states.

### 6. Do's and Don'ts
**Do:**
- Use wide letter-spacing on small uppercase labels for a "technical instrumentation" feel.
- Use `tight-display` on large numbers to emphasize scale.
- Apply `rounded-xl` (12px) to all main containers for a modern, approachable feel.

**Don't:**
- Use standard 1px black or grey borders; use `slate-100` or background shifts instead.
- Use standard sans-serif fonts for display metrics; keep the tracking tight and the weight heavy.
- Overuse shadows; let the color transitions do the work of defining boundaries.