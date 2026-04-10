import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, Database } from '@/integrations/supabase/types';

type GridStatus = Database['public']['Enums']['grid_status'];

export type GridAssignmentWithArtist = Tables<'grid_assignments'> & {
  artists: Tables<'artists'> | null;
};

export function useGridAssignments() {
  return useQuery({
    queryKey: ['grid_assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grid_assignments')
        .select('*, artists(*)')
        .order('grid_cell');
      if (error) throw error;
      return data as GridAssignmentWithArtist[];
    },
  });
}

export function useArtists() {
  return useQuery({
    queryKey: ['artists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateGridAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ gridCell, artistId, status, notes }: { gridCell: string; artistId?: string | null; status?: GridStatus; notes?: string }) => {
      // Get current assignment for history
      const { data: current } = await supabase
        .from('grid_assignments')
        .select('status')
        .eq('grid_cell', gridCell)
        .single();

      const updateData: Record<string, unknown> = {};
      if (artistId !== undefined) {
        updateData.artist_id = artistId;
        if (artistId && (!current || current.status === 'available')) {
          updateData.status = 'assigned';
          updateData.assigned_at = new Date().toISOString();
        }
        if (!artistId) {
          updateData.status = 'available';
          updateData.assigned_at = null;
        }
      }
      if (status !== undefined) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabase
        .from('grid_assignments')
        .update(updateData)
        .eq('grid_cell', gridCell)
        .select('*, artists(*)')
        .single();
      if (error) throw error;

      // Log status change
      if (status && current && current.status !== status) {
        await supabase.from('status_history').insert({
          grid_cell: gridCell,
          old_status: current.status,
          new_status: status,
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grid_assignments'] });
    },
  });
}

export function useCreateArtist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (artist: { name: string; email?: string; phone?: string }) => {
      const { data, error } = await supabase.from('artists').insert(artist).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
}

export function useUpdateArtist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; email?: string; phone?: string }) => {
      const { data, error } = await supabase.from('artists').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      queryClient.invalidateQueries({ queryKey: ['grid_assignments'] });
    },
  });
}

export function useDeleteArtist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('artists').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      queryClient.invalidateQueries({ queryKey: ['grid_assignments'] });
    },
  });
}

export function useStatusHistory(gridCell: string) {
  return useQuery({
    queryKey: ['status_history', gridCell],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('status_history')
        .select('*')
        .eq('grid_cell', gridCell)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!gridCell,
  });
}
