

## Artown Branding, Restyle, and Partners/About Page

### What changes

1. **Add Artown logo** — copy the uploaded logo into `src/assets/` and display it prominently on the registration page header and the new About page.

2. **Restyle the color palette** — update CSS custom properties in `src/index.css` to reflect Artown's vibrant branding: bold reds, yellows, and greens drawn from the logo, with a clean white background. This gives the whole app a fresh, festival-like energy.

3. **Partners strip on `/register`** — replace the current plain-text partner list with a compact, visually appealing horizontal section showing partner names/logos with short one-line descriptions.

4. **New `/about` page** — a dedicated page with:
   - Full event description (the existing welcome copy)
   - Detailed partner bios for Artown, The Discovery Museum, and The George W. Gillemot Foundation
   - A "Register Now" call-to-action linking back to `/register`

5. **Navigation updates** — add a subtle top bar or links on the `/register` page to navigate between Register and About (keeping both public, no login required).

### Technical details

**Files changed:**
- `src/assets/artown-logo.jpg` — copy uploaded logo
- `src/index.css` — new color palette (warm reds/yellows for primary/accent, clean whites for background)
- `src/pages/Register.tsx` — simplified header with Artown logo, condensed partner strip, link to About page
- `src/pages/About.tsx` — new page with full event info, partner details, CTA
- `src/App.tsx` — add `/about` as a public route alongside `/register`

**Color direction:**
- Primary: bold red (~`0 80% 50%`) inspired by the Artown logo
- Accent: warm yellow (~`45 95% 55%`) from the logo's yellow/green
- Background: clean white, cards slightly off-white
- Text: dark charcoal for readability

**No database changes needed.**

