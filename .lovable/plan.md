
## Community Mural Grid Tracker — Reno 250 Celebration

### Overview
A web app for organizers to assign and track ~234 grid pieces (A1–R13) across 250 artists, with a visual mural grid and multi-stage status tracking.

### Features

**1. Visual Mural Grid Dashboard (Home Page)**
- Display the mural artwork as the background with a clickable grid overlay (18 columns × 13 rows)
- Each cell color-coded by status: Available (transparent/outline), Assigned (blue), In Progress (yellow), Completed (green), Collected (purple)
- Click any cell to see details or assign/update it
- Legend showing status colors
- Summary stats: total assigned, in progress, completed, remaining

**2. Grid Cell Detail Panel**
- Click a cell to open a side panel or modal showing:
  - Grid ID (e.g., "F7")
  - Current status with ability to change it (Available → Assigned → In Progress → Completed → Collected)
  - Assigned artist info (name, email, phone)
  - Assignment date and status change history
- Quick assign: search/select an artist or add a new one inline

**3. Artist Management Page**
- Table of all registered artists with name, email, phone, assigned grid piece, and status
- Add new artists individually or bulk import (CSV)
- Search and filter by name, status, or grid piece
- Edit or remove artist assignments

**4. Admin Authentication**
- Simple password-protected access (Supabase auth) so only organizers can view/edit
- No artist-facing login needed since it's admin-only

**5. Database (Supabase/Lovable Cloud)**
- `artists` table: id, name, email, phone, created_at
- `grid_assignments` table: id, grid_cell (e.g., "F7"), artist_id, status (enum: available/assigned/in_progress/completed/collected), assigned_at, updated_at, notes
- Status change log for tracking history

**6. Export & Reporting**
- Export artist list with grid assignments as CSV
- Print-friendly grid view showing assignments
