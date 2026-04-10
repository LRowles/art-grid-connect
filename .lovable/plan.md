

## Public Artist Self-Registration Page

### What it does
A shareable link (e.g., `/register`) where any artist can see the mural grid, pick an available cell, and register themselves — no login required.

### How it works

**1. Database: Allow public read + insert access**
- Add RLS policies on `grid_assignments` and `artists` allowing `anon` role to:
  - **SELECT** grid_assignments (so the public grid shows which cells are taken)
  - **INSERT** into artists (so artists can register)
  - **UPDATE** grid_assignments (to claim a cell — restricted to cells where `artist_id IS NULL`)

**2. New page: `src/pages/Register.tsx`**
- Shows the mural image with grid overlay (reusing grid layout from GridDashboard)
- Available cells shown with outline/transparent styling; taken cells shown as filled (no artist details exposed)
- Click an available cell → opens a registration form asking for name, email, phone
- On submit: creates artist record, then updates the grid_assignment to link the artist and set status to `registered`
- Success confirmation with the assigned cell ID
- Taken cells are not clickable

**3. Routing: Add public route**
- In `App.tsx`, add `/register` as a public route outside `ProtectedRoutes`
- The admin dashboard remains protected

**4. Components**
- `PublicGridView` — simplified read-only grid (no admin controls)
- `RegistrationForm` — name, email, phone fields + selected cell display

### No changes needed
- No new database tables
- No auth changes (anon access via RLS)
- Admin features remain unchanged

