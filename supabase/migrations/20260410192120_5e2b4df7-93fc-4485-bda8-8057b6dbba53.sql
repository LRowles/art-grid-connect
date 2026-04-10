-- Replace the grid_status enum values
ALTER TYPE public.grid_status RENAME TO grid_status_old;
CREATE TYPE public.grid_status AS ENUM ('registered', 'picked_up', 'dropped_off');

-- Update existing data
ALTER TABLE public.grid_assignments ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.grid_assignments ALTER COLUMN status TYPE public.grid_status USING 
  CASE status::text
    WHEN 'available' THEN 'registered'::public.grid_status
    WHEN 'assigned' THEN 'registered'::public.grid_status
    WHEN 'in_progress' THEN 'picked_up'::public.grid_status
    WHEN 'completed' THEN 'dropped_off'::public.grid_status
    WHEN 'collected' THEN 'dropped_off'::public.grid_status
  END;
ALTER TABLE public.grid_assignments ALTER COLUMN status SET DEFAULT 'registered'::public.grid_status;

-- Update status_history columns
ALTER TABLE public.status_history ALTER COLUMN new_status TYPE public.grid_status USING
  CASE new_status::text
    WHEN 'available' THEN 'registered'::public.grid_status
    WHEN 'assigned' THEN 'registered'::public.grid_status
    WHEN 'in_progress' THEN 'picked_up'::public.grid_status
    WHEN 'completed' THEN 'dropped_off'::public.grid_status
    WHEN 'collected' THEN 'dropped_off'::public.grid_status
  END;
ALTER TABLE public.status_history ALTER COLUMN old_status TYPE public.grid_status USING
  CASE old_status::text
    WHEN 'available' THEN 'registered'::public.grid_status
    WHEN 'assigned' THEN 'registered'::public.grid_status
    WHEN 'in_progress' THEN 'picked_up'::public.grid_status
    WHEN 'completed' THEN 'dropped_off'::public.grid_status
    WHEN 'collected' THEN 'dropped_off'::public.grid_status
    ELSE NULL
  END;

DROP TYPE public.grid_status_old;