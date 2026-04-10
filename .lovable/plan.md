

## Add Grid Assignment and Status to Artist Form

### What changes
Enhance the Add/Edit Artist dialog to include:
1. A **grid cell dropdown** showing all available grid cells (plus the currently assigned one when editing)
2. A **status dropdown** with the 5 statuses (Available, Assigned, In Progress, Completed, Collected)

### Technical approach

**File: `src/pages/Artists.tsx`**
- Expand form state to include `gridCell` and `status` fields
- Add a `<Select>` dropdown for grid cell, populated from `assignments` data, filtered to show only unassigned cells (plus current cell when editing)
- Add a `<Select>` dropdown for status with all 5 enum values
- On save: after creating/updating the artist, call `useUpdateGridAssignment` to assign the selected grid cell and status
- When editing, pre-populate grid cell and status from `artistGridMap`
- Import `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` from shadcn

No database changes needed — the existing `grid_assignments` table and `useUpdateGridAssignment` hook already support this.

