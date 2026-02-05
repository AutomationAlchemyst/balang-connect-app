# Design System: Breezy Balang Welcome
**Project ID:** 6162856176582044019

## 1. Visual Theme & Atmosphere
The "Breezy Balang Welcome" design system embodies a **Premium Coastal Immersive** aesthetic, described as "Coastal Glassmorphism." The vibe is airy, refreshing, and high-end, utilizing deep oceanic contrasts against bright, sun-bleached surfaces. It prioritizes depth through layering and transparency, evoking the clarity of coastal waters and the softness of beach-front luxury.

## 2. Color Palette & Roles

*   **Breezy Aqua (#0df2df):** A vibrant, high-energy primary accent used for major calls to action, active selections, and progress status. It represents the "spirit" of the brand.
*   **Deep Oceanic Teal (#09a093):** A sophisticated mid-tone used for secondary buttons, icon containers, and gradient transitions, providing grounding depth to the lighter aqua.
*   **Midnight Sea (#041F1C):** The primary typographic color. A near-black with a hint of deep forest green, ensuring sharp readability and a premium "heavy" weight to the brand's voice.
*   **Sun-Kissed Mist (White/40):** The base for the glassmorphic system. Semi-transparent and frosted, used for all major UI containers to allow background colors to "bleed" through.

## 3. Typography Rules
*   **Font Family:** `Plus Jakarta Sans` is used exclusively, providing a modern, geometric, and clean-cut profile.
*   **Headers:** Rendered in **Heavy/Black weight and Uppercase** to command attention. Letter-spacing is set to "Tighter" for a dense, high-impact headline look.
*   **Italics:** Strategically applied to secondary brand words to introduce a sense of "breeze" and fluidity (e.g., *Balang*).
*   **Body Text:** Bold weights are preferred over regular, emphasizing confidence and premium quality.

## 4. Component Stylings

*   **Buttons:**
    *   **Shape:** Generously rounded pill-shapes or custom `rounded-2xl` corners.
    *   **Style:** Heavy gradients from Breezy Aqua to Deep Oceanic Teal.
    *   **Behavior:** Features "Elastic Bounce" on interaction and subtle rotation shifts to feel alive and organic.
*   **Cards/Containers:**
    *   **Shape:** Generously rounded corners (`rounded-[2rem]` / 32px).
    *   **Surfacing:** "Frosted Glass" effect with `backdrop-blur-2xl` and a delicate white stroke border (`border-white/60`).
    *   **Depth:** Supported by "Whisper-soft diffused shadows" with a subtle aqua tint to simulate light passing through tropical water.
*   **Inputs/Forms:** 
    *   **Style:** Transparent glass-style backgrounds with strong white borders.
    *   **Focus:** "Luminescent Rings" using Breezy Aqua with high glow (`focus:ring-8`).

## 5. Layout Principles
The layout follows a "Breathing Room" strategy with generous vertical margins and wide container padding. Elements are often "Tilted" or "Floating" (subtle rotation and bouncing animations) to avoid a rigid, corporate grid feel, instead opting for a "Curated Gallery" alignment.

## 6. Design System Notes for Stitch Generation
*   **Always** use `backdrop-blur-2xl` for containers.
*   **Always** prefix brand colors with descriptive intent (e.g., "Use Breezy Aqua for the submit button").
*   **Ensure** all images are framed in glass panels with subtle rotation.
*   **Maintain** the `Plus Jakarta Sans` font throughout all generated components.
