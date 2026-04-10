

## Add Welcome Copy and Directions to Registration Page

### What changes
Update `src/pages/Register.tsx` to add a welcome section with event description, partner acknowledgments, and artist directions between the header and the grid.

### Content structure
1. **Title**: "Art of Aviation Community Mural"
2. **Welcome paragraph**: Describes the inaugural mural, Northern Nevada's pioneering spirit, aviation history, Discovery Museum installation, and Red White and Flight Drone Show tie-in.
3. **Community Partners** section with three entries (Gillemot Foundation, Artown, Discovery Museum) — each with a bold name and description.
4. **Directions** section as a styled callout/card:
   - Select an available square and register with name and phone number
   - Canvases available at The Discovery Museum after May 1
   - Completed squares due back by Monday, June 22nd
   - Any material allowed; match colors as closely as possible

### Technical approach
- Single file edit: `src/pages/Register.tsx`
- Replace the simple header with a richer welcome section using existing Card/typography components
- Keep the grid, legend, and registration form unchanged
- Use a visually distinct callout (e.g., bordered card with a list) for the directions so they stand out

