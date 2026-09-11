---
name: GFTeam Avaré
description: An editorial academy experience rooted in real photography and belt progression.
colors:
  primary: "#009246"
  green-deep: "#006b35"
  secondary: "#002776"
  accent: "#ffcc00"
  background: "#f2f3ee"
  surface: "#ffffff"
  text: "#090b0a"
  muted: "#5c635e"
  line: "#d1d6cf"
  surface-tint: "#e5e9e0"
typography:
  display:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(52px, 6.7vw, 96px)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(40px, 4.9vw, 70px)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  control: "3px"
spacing:
  section: "clamp(80px, 9vw, 136px)"
  gutter-desktop: "56px"
  gutter-tablet: "36px"
  gutter-mobile: "20px"
components:
  button-primary:
    backgroundColor: "{colors.green-deep}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "15px 22px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.green-deep}"
    rounded: "{rounded.control}"
  button-yellow:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
---

# Design System: GFTeam Avaré

## Overview

**Creative North Star: "A evolução começa na base"**

An editorial academy experience grounded in actual training photography, the professor's portrait and a physical belt tied across an architectural opening. Spacious neutral surfaces give the original Brazilian brand colors deliberate emphasis. Native HTML and CSS carry the content; isolated GSAP modules provide progression and feedback.

**Key Characteristics:**
- Authentic academy photography and prominent human portraits.
- Oversized compact lettering with readable supporting text.
- A physical belt interaction within a restrained green bay.
- Spacious editorial layouts instead of repeated feature cards.

The user authorized a complete visual replacement while retaining factual content, photos and the original color identity. The initial route direction is retained in `.impeccable/surfaces/home.md`; product facts are in `PRODUCT.md`. Design calibration: DESIGN_VARIANCE 8, MOTION_INTENSITY 6, VISUAL_DENSITY 4, matching the explicit editorial, energetic and disciplined brief.

## Colors

The exact source green `primary` fills the closing invitation; dark text preserves contrast. The yellow CTA and light emphasized word carry the closing hierarchy. `green-deep` is an accessible shade of that green, used for white-text buttons and the belt bay. Source navy appears in the actual logo and the conceptual practitioner's gi.

Paper is the dominant background; white and the pale green surface tint support contrast. Ink and muted green-gray distinguish body and secondary text. Planned coverage is approximately 70% neutral surfaces, 20% greens, 8% ink/navy and 2% yellow; this is a compositional guide, not a measured pixel ratio.

**The Local Rank Rule.** Belt colors belong to the belt and its five selectors; changing a rank never changes root brand tokens.

## Typography

Archivo 600 and 800 is the display family. Manrope 400, 500, 600 and 700 supplies supporting text and controls. All fonts are self-hosted through Fontsource.

Desktop display reaches 96px; mobile hero text uses `clamp(39px, 9.8vw, 59px)`. Section headings use the headline token with section-specific mobile adjustments. Cesinha's name and the footer wordmark use Archivo 800. Body text ranges from 12–15px in content blocks, with larger introductory text where needed. Small captions and functional sequence labels are subordinate roles, not templates for extra heading eyebrows.

Tracking stays at or above -0.04em. Headings use balanced wrapping; image captions sit outside the photo. The professor's role follows his name.

## Layout

The shared shell has a maximum width of 1328px. Desktop gutters are 56px, reducing to 36px below 1200px and 20px below 600px. Header height is 80px on desktop and 72px below 900px. Section spacing uses the section token, becoming 70px on mobile.

The desktop opening places editorial content beside a green belt bay. A large professor portrait and biography follow, with the smaller founder photograph offset within its own composition. The academy's identity is a pale tonal section. Training philosophy uses a sticky diagram beside four sequential statements. Practical information remains easy to scan, and the final invitation uses a full source-green surface.

Below 600px, the hero, portraits and academy content stack. The belt bay is 480px high: cloth sits at 25% of its width; the caption has a stable position at top 238px, left 49%, right 22px. This isolates text wrapping from the drag hint. The technique diagram stops sticking; its explicit controls remain available. Training columns stack and the schedule groups into two columns.

## Elevation & Depth

The interface relies on space and tonal surfaces. Depth is reserved for the belt: its anchor uses `0 7px 10px #002b252b`, and the SVG uses a small offset drop shadow. Cloth shading and fine woven geometry communicate a physical object. Content containers have no decorative card shadows.

## Shapes

Photographs keep rectangular crops. Buttons and interaction surfaces use a restrained 3px radius. Thin neutral separators organize navigation, schedule and FAQ. No glass panels or decorative particle layers are present.

## Components

- **Buttons:** dark green with white text, or yellow with ink text in the closing invitation. Standard minimum height is 54px; hover darkens the surface and shifts the Phosphor arrow. Press feedback moves the button by 2px. The outlined technique control has the same quiet geometry.
- **Navigation:** a single desktop row with an underline on hover/current location. Mobile uses a native modal dialog, contained keyboard focus, Escape dismissal and focus restoration. Choosing a link closes the dialog and focuses the destination.
- **Belt:** pointer capture supports mouse and touch. A downward pull of at least 40px advances exactly one rank per gesture, wrapping from black to white. Upward travel does not change rank. A damped spring settles the cloth after release; a second tail moves independently. Five labeled buttons and a keyboard slider expose the same states. Rank selection persists when the spring returns.
- **Technique:** two SVG practitioners share a connected 2D rig and five entry poses, followed by independent finish sequences grouped under the original four conceptual stages. Far/near limbs interleave across characters; fine outlines and local gi tones separate contacts. A fixed `150 115 400 278` viewBox makes ground positions readable without camera movement. Desktop/tablet scrolling advances the sequence; explicit selections stay in place until an intentional scroll gesture. Pause resumes the same technique.
- **Finish variations:** replays choose between stylized chave de braço (10 poses, 9.73s), triângulo (10 poses, 10.43s) and mata-leão (9 poses, 9.93s), including the shared entry. Each has individual setup, transition and hold timing. A shuffled cycle prevents immediate repeats; the live caption names the finish. A brief fade resets unrelated finishes. These remain conceptual, not instruction.
- **Contact signatures:** Phosphor Instagram, Facebook and YouTube logos precede their text labels. The closing GFTEAM wordmark uses `clamp(64px, 9vw, 130px)` on desktop and `12vw` on mobile, with whitespace below it.
- **Reduced motion:** spring and automatic animation stop. Rank selection still works, and technique controls advance immediately. Main content is readable without waiting for animation.
- **FAQ:** native `details` and `summary`, with a rotating plus icon and visible keyboard focus.
- **Focus:** 3px navy outline with a 6px offset; yellow focus outlines are used on the dark green belt bay and mobile dialog.
- **Assets:** original photographs are retained, with responsive WebP derivatives. Phosphor SVGs are delivered through CSS masks, avoiding a complete icon font.

## Do's and Don'ts

- **Do** preserve the exact original green, yellow and navy as the recognizable identity.
- **Do** use the dark green shade when small white text needs additional contrast.
- **Do** retain real photography, names, credentials and source contact information.
- **Do** provide explicit controls alongside scroll and drag interactions.
- **Don't** recolor the site according to the selected belt.
- **Don't** invent ranks, achievements, schedules, prices, promotions or testimonials.
- **Don't** replace professor photographs with stock or generated faces.
- **Don't** turn every content section into repeated cards or animate every element.

Final independent review disposition: ship; all five original findings were resolved. Runtime evidence and its limits are recorded in `QA.md`. One-off illustration coordinates and incidental tiny captions are deliberately not promoted to reusable design tokens.
