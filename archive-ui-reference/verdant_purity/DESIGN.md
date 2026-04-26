# Design System Strategy: The Pure Editorial Approach

## 1. Overview & Creative North Star: "The Digital Dairy"
This design system moves beyond the generic "delivery app" template. Our Creative North Star is **"Organic Editorial."** We treat every screen like a high-end health and wellness publication—prioritizing breathability, sophisticated tonal depth, and intentional asymmetry. 

To achieve "Pure" and "Fresh" qualities, we reject the rigid, boxed-in structures of traditional apps. Instead, we use expansive white space and overlapping elements to suggest the fluidity of milk and the natural growth of greenery. This is a high-end, production-ready environment where the interface recedes to let the product quality shine.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is rooted in the `primary` (#0f5238) "Fresh Green," but its luxury comes from the supporting neutral scale.

*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. We define boundaries through background shifts. For example, a `surface-container-low` (#f2f4f3) section should sit directly on a `surface` (#f8faf9) background. The eye perceives the edge through the shift in tone, not a mechanical line.
*   **Surface Hierarchy & Nesting:** Think of the UI as layers of fine paper. 
    *   **Level 0:** `surface` (#f8faf9) for the main background.
    *   **Level 1:** `surface-container-lowest` (#ffffff) for primary interactive cards.
    *   **Level 2:** `surface-container-highest` (#e1e3e2) for subtle accentuation of utility areas like sidebars or footers.
*   **The "Glass & Gradient" Rule:** To elevate the "Fresh" personality, main hero sections or floating navigation bars should use **Glassmorphism**. Apply `surface` with 80% opacity and a `20px` backdrop blur. 
*   **Signature Textures:** For high-impact CTAs, do not use flat green. Use a subtle linear gradient from `primary` (#0f5238) to `primary_container` (#2d6a4f) at a 135-degree angle to add "soul" and dimension.

---

## 3. Typography: The Authority of Sans
We use a dual-font system to balance editorial authority with functional clarity.

*   **Display & Headlines (Manrope):** Chosen for its geometric purity and modern "tech-organic" feel. 
    *   `display-lg` (3.5rem) should be used with tight letter-spacing (-0.02em) for hero headlines to establish a premium, "Trustworthy" presence.
*   **Body & Labels (Inter):** A workhorse for legibility. 
    *   Use `body-md` (0.875rem) for product descriptions and `label-md` (0.75rem) for nutritional facts. 
    *   **Editorial Note:** Always maintain a line height of at least 1.5 for body text to ensure the "Simple" and "Fresh" brand personality is felt in the reading experience.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows often look "dirty." We use light and tone to create a sense of "Pure" elevation.

*   **The Layering Principle:** Instead of a shadow, place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#f2f4f3) background. This creates a "soft lift" that feels architectural rather than digital.
*   **Ambient Shadows:** For floating elements (e.g., a "Quick Add" FAB), use an extra-diffused shadow: `box-shadow: 0 12px 32px rgba(25, 28, 28, 0.06)`. Note the 6% opacity; it should feel like a whisper of light.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., in high-contrast modes), use `outline_variant` (#bfc9c1) at 20% opacity. Never use 100% opaque lines.
*   **Glassmorphism:** Use `surface_variant` at 70% opacity with a blur for overlays to maintain the "Daily Use" context—allowing the user to see the "Fresh" products behind the interface.

---

## 5. Components: Fluidity & Intent

*   **Buttons:**
    *   *Primary:* Rounded-xl (1.5rem) for a pill shape. Gradient fill (Primary to Primary-Container). No border.
    *   *Secondary:* `surface-container-high` background with `on-surface` text. This feels integrated, not loud.
*   **Cards (Product & Delivery):**
    *   Strictly **no dividers**. Use 24px of vertical white space to separate the product image from the title. 
    *   Corners must follow the `lg` (1rem) scale for a friendly, approachable feel.
*   **Input Fields:**
    *   Use a "Soft-Infill" style: `surface-container-lowest` background with a `ghost border` on focus. Do not use underline-only inputs; they feel too "banking-lite" for a fresh dairy brand.
*   **Chips (Subscriptions):**
    *   Use `secondary_fixed` (#c1ebdf) for active "Daily Delivery" states. It provides a "Fresh" hit of color without the weight of the primary green.
*   **Milk Subscription Calendar:**
    *   Avoid grids with lines. Use a `surface-container-low` background for the container, and use `primary` circles to indicate delivery dates. The contrast between the soft gray and the deep green creates instant "Clarity."

---

## 6. Do's and Don'ts

### Do:
*   **Do** embrace asymmetry. Position a product image slightly overlapping the edge of a container to create a "Signature" look.
*   **Do** use `primary_fixed` (#b1f0ce) for success states instead of a generic bright green; it feels more "Pure" and curated.
*   **Do** maximize white space. If you think there is enough space, add 8px more.

### Don't:
*   **Don't** use black (#000000). Use `on_surface` (#191c1c) for all text to keep the "Soft" aesthetic.
*   **Don't** use 90-degree sharp corners. Everything must touch the `0.5rem` to `1.5rem` roundedness scale to feel "Simple" and safe.
*   **Don't** use standard "heavy" dividers. If you must separate content, use a 4px height `surface-container-low` bar instead of a 1px line.