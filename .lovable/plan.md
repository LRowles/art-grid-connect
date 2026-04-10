

## Make Root URL Public-Facing and Verify Grid Availability

### What changes

1. **Route `/` → public registration page**: Update `src/App.tsx` so the root path (`/`) renders the `Register` page instead of the admin dashboard. Move the admin dashboard to `/admin/*`.

2. **Update navigation links**: Update `PublicNav` and any internal links to reflect the new routes (e.g., admin links go to `/admin`).

3. **Verify grid availability**: All 234 grid cells (A1–R13) already exist in the database with no artists assigned, so they should all appear as available. No database changes needed.

### Technical details

**`src/App.tsx`**:
- Change `<Route path="/register" ...>` to `<Route path="/" element={<Register />} />`
- Move `ProtectedRoutes` from `/*` to `/admin/*`
- Keep `/about` as-is

**`src/components/PublicNav.tsx`**:
- Update "Register" link to point to `/` instead of `/register`
- Add redirect from `/register` to `/` for any existing shared links

**`src/pages/Register.tsx`**:
- Update any internal `Link` references if needed

**No database changes needed.**

