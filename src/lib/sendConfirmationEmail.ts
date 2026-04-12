import { supabase } from '@/integrations/supabase/client';

/**
 * Sends a confirmation email to a newly registered artist by calling
 * the `send-confirmation-email` Supabase Edge Function.
 *
 * The Resend API key is stored securely as a Supabase secret and is
 * NEVER exposed to the browser. The frontend only sends the artist's
 * details to the Edge Function, which handles the actual email delivery.
 */
export async function sendConfirmationEmail(
  email: string,
  name: string,
  cell: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: { email, name, cell },
    });

    if (error) {
      console.error('Edge Function error:', error);
      return { success: false, error: error.message };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
