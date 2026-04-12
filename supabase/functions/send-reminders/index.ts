// Supabase Edge Function: send-reminders
// Triggered by pg_cron or manual invocation to send timed emails to artists
//
// Email types:
//   - deadline_reminder: Sent ~2 weeks before June 22 deadline (around June 8)
//   - deadline_final: Sent ~3 days before deadline (around June 19)
//   - thank_you: Sent after artist drops off their canvas (status = 'dropped_off')
//   - invitation: Sent to all artists inviting them to the July 2nd reveal party
//
// Environment variables required:
//   - RESEND_API_KEY: Your Resend API key
//   - SUPABASE_URL: Auto-provided by Supabase
//   - SUPABASE_SERVICE_ROLE_KEY: Auto-provided by Supabase

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const FROM_EMAIL = "Art of Aviation <noreply@artowncommunitymural.com>";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ============================================================
// Email Templates
// ============================================================

function deadlineReminderEmail(artistName: string, gridCell: string, daysLeft: number): { subject: string; html: string } {
  return {
    subject: `Reminder: Your Art of Aviation canvas is due in ${daysLeft} days!`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff;">
        <div style="background: linear-gradient(135deg, #1a0000 0%, #0a0a0a 50%, #000a1a 100%); padding: 40px 30px; text-align: center;">
          <h1 style="font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">
            Art of Aviation<br><span style="color: #dc2626;">Community Mural</span>
          </h1>
        </div>
        <div style="padding: 30px;">
          <p style="color: #999; font-size: 16px; line-height: 1.6;">Hi ${artistName},</p>
          <p style="color: #999; font-size: 16px; line-height: 1.6;">
            This is a friendly reminder that your canvas for <strong style="color: #fff;">Square ${gridCell}</strong> 
            is due back at <strong style="color: #fff;">The Discovery Museum</strong> by 
            <strong style="color: #dc2626;">Monday, June 22nd</strong>.
          </p>
          <div style="background: rgba(220,38,38,0.1); border-left: 4px solid #dc2626; padding: 16px 20px; margin: 24px 0;">
            <p style="color: #fff; font-size: 18px; font-weight: bold; margin: 0;">
              ${daysLeft} days remaining
            </p>
            <p style="color: #999; font-size: 14px; margin: 8px 0 0 0;">
              Drop off at The Discovery Museum, 490 S Center St, Reno, NV
            </p>
          </div>
          <p style="color: #999; font-size: 16px; line-height: 1.6;">
            Your square is an essential piece of this collaborative masterpiece. We can't wait to see 
            your finished work assembled into the final mural!
          </p>
          <p style="color: #999; font-size: 16px; line-height: 1.6;">
            If you have any questions or need more time, please don't hesitate to reach out.
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            — The Art of Aviation Community Mural Team
          </p>
        </div>
      </div>
    `,
  };
}

function thankYouEmail(artistName: string, gridCell: string): { subject: string; html: string } {
  return {
    subject: `Thank you for your contribution to the Art of Aviation Mural!`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff;">
        <div style="background: linear-gradient(135deg, #1a0000 0%, #0a0a0a 50%, #000a1a 100%); padding: 40px 30px; text-align: center;">
          <h1 style="font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">
            Art of Aviation<br><span style="color: #dc2626;">Community Mural</span>
          </h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #dc2626; font-size: 24px; margin: 0 0 16px 0;">Thank You, ${artistName}!</h2>
          <p style="color: #999; font-size: 16px; line-height: 1.6;">
            We've received your completed canvas for <strong style="color: #fff;">Square ${gridCell}</strong>. 
            Your contribution is now part of something truly special — a collaborative masterpiece celebrating 
            Northern Nevada's rich aviation heritage.
          </p>
          <p style="color: #999; font-size: 16px; line-height: 1.6;">
            Your square will be carefully assembled alongside 233 other pieces to create the final 
            Art of Aviation Community Mural, which will be displayed at The Discovery Museum.
          </p>
          <div style="background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.2); padding: 20px; margin: 24px 0; text-align: center;">
            <p style="color: #fff; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">
              Save the Date
            </p>
            <p style="color: #dc2626; font-size: 22px; font-weight: 900; margin: 0;">
              July 2nd — Mural Unveiling
            </p>
            <p style="color: #999; font-size: 14px; margin: 8px 0 0 0;">
              Community Reception & Artown Kickoff at The Discovery Museum
            </p>
          </div>
          <p style="color: #999; font-size: 16px; line-height: 1.6;">
            We hope to see you there! A formal invitation with details will follow soon.
          </p>
          <p style="color: #999; font-size: 16px; line-height: 1.6;">
            In the meantime, share your experience on the 
            <a href="https://artowncommunitymural.com/follow-along" style="color: #dc2626;">Follow Along</a> page 
            — upload photos of your process and connect with fellow artists!
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            With gratitude,<br>
            — The Art of Aviation Community Mural Team
          </p>
        </div>
      </div>
    `,
  };
}

function invitationEmail(artistName: string, gridCell: string): { subject: string; html: string } {
  return {
    subject: `You're Invited! Art of Aviation Mural Unveiling — July 2nd at The Discovery`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff;">
        <div style="background: linear-gradient(135deg, #1a0000 0%, #0a0a0a 50%, #000a1a 100%); padding: 40px 30px; text-align: center;">
          <h1 style="font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">
            Art of Aviation<br><span style="color: #dc2626;">Community Mural</span>
          </h1>
          <p style="color: #dc2626; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; margin-top: 8px;">
            You're Invited
          </p>
        </div>
        <div style="padding: 30px;">
          <p style="color: #999; font-size: 16px; line-height: 1.6;">Dear ${artistName},</p>
          <p style="color: #999; font-size: 16px; line-height: 1.6;">
            As a contributing artist to the Art of Aviation Community Mural (Square ${gridCell}), 
            you are cordially invited to the <strong style="color: #fff;">Community Reception & Artown Kickoff</strong> 
            where we will unveil the completed mural for the first time!
          </p>
          
          <div style="background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.2); padding: 24px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #dc2626; font-weight: bold; font-size: 14px; padding: 8px 0; vertical-align: top; width: 80px;">EVENT</td>
                <td style="color: #fff; font-size: 16px; padding: 8px 0;">Community Reception & Artown Kickoff</td>
              </tr>
              <tr>
                <td style="color: #dc2626; font-weight: bold; font-size: 14px; padding: 8px 0; vertical-align: top;">DATE</td>
                <td style="color: #fff; font-size: 16px; padding: 8px 0;">Wednesday, July 2, 2026</td>
              </tr>
              <tr>
                <td style="color: #dc2626; font-weight: bold; font-size: 14px; padding: 8px 0; vertical-align: top;">TIME</td>
                <td style="color: #fff; font-size: 16px; padding: 8px 0;">Evening (details to follow)</td>
              </tr>
              <tr>
                <td style="color: #dc2626; font-weight: bold; font-size: 14px; padding: 8px 0; vertical-align: top;">VENUE</td>
                <td style="color: #fff; font-size: 16px; padding: 8px 0;">The Discovery Museum<br><span style="color: #999; font-size: 14px;">490 S Center St, Reno, NV 89501</span></td>
              </tr>
            </table>
          </div>

          <p style="color: #999; font-size: 16px; line-height: 1.6;">
            This will be a celebration of community, creativity, and our shared skies. Come see your 
            square assembled alongside 233 others into a stunning collaborative masterpiece — and enjoy 
            an evening of art, connection, and the official start of Artown!
          </p>

          <p style="color: #999; font-size: 16px; line-height: 1.6;">
            The mural will also serve as the entrance centerpiece to The Discovery's new aviation-themed 
            exhibition, which opens that same evening.
          </p>

          <div style="background: rgba(0,204,255,0.08); border: 1px solid rgba(0,204,255,0.2); padding: 16px 20px; margin: 24px 0;">
            <p style="color: #00ccff; font-size: 14px; font-weight: bold; margin: 0 0 4px 0;">
              Also Coming Up: Red, White & Flight — July 4th
            </p>
            <p style="color: #999; font-size: 14px; margin: 0;">
              Free drone show, Reno Phil concert & aerospace expo at Mackay Stadium. 
              <a href="https://redwhiteandflight.org/" style="color: #dc2626;">Secure your free spot →</a>
            </p>
          </div>

          <p style="color: #999; font-size: 16px; line-height: 1.6;">
            We hope to see you there!
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            With gratitude,<br>
            — The Art of Aviation Community Mural Team<br>
            <span style="font-size: 12px;">Presented by The George W. Gillemot Foundation, Artown, The Discovery Museum & Strengthen our Community</span>
          </p>
        </div>
      </div>
    `,
  };
}

// ============================================================
// Send email via Resend API
// ============================================================

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to send email:", err);
    return false;
  }
}

// ============================================================
// Main handler
// ============================================================

serve(async (req) => {
  try {
    const { email_type } = await req.json();

    if (!email_type) {
      return new Response(JSON.stringify({ error: "email_type is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get all artists with email and their grid assignments
    const { data: assignments, error: assignErr } = await supabase
      .from("grid_assignments")
      .select("grid_cell, artist_id, status, artists(id, name, email)")
      .not("artist_id", "is", null);

    if (assignErr) throw assignErr;

    let sent = 0;
    let failed = 0;
    const now = new Date();
    const deadline = new Date("2026-06-22T23:59:59");
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    for (const assignment of assignments || []) {
      const artist = (assignment as any).artists;
      if (!artist?.email) continue;

      // Check if we already sent this type of email to this artist
      const { data: existing } = await supabase
        .from("email_reminders")
        .select("id")
        .eq("artist_id", artist.id)
        .eq("email_type", email_type)
        .eq("status", "sent")
        .limit(1);

      if (existing && existing.length > 0) continue; // Already sent

      let emailContent: { subject: string; html: string } | null = null;

      switch (email_type) {
        case "deadline_reminder":
          // Only send if deadline is in the future and canvas not yet returned
          if (daysLeft > 0 && assignment.status !== "dropped_off") {
            emailContent = deadlineReminderEmail(artist.name, assignment.grid_cell, daysLeft);
          }
          break;

        case "thank_you":
          // Only send to artists who have dropped off their canvas
          if (assignment.status === "dropped_off") {
            emailContent = thankYouEmail(artist.name, assignment.grid_cell);
          }
          break;

        case "invitation":
          // Send to all registered artists
          emailContent = invitationEmail(artist.name, assignment.grid_cell);
          break;

        default:
          break;
      }

      if (emailContent) {
        const success = await sendEmail(artist.email, emailContent.subject, emailContent.html);
        
        // Log the email
        await supabase.from("email_reminders").insert({
          artist_id: artist.id,
          email_type,
          status: success ? "sent" : "failed",
        });

        if (success) sent++;
        else failed++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent, failed, email_type }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
