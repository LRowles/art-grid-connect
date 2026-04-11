import { SQUARE_IMAGE_URLS } from './squareImageUrls';

const RESEND_API_KEY = 're_DzRYm6Ty_GXhqnLYsuak5aAPDdKFGqHfY';

export async function sendConfirmationEmail(
  email: string,
  name: string,
  cell: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const imageUrl = SQUARE_IMAGE_URLS[cell] || '';

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0a192f 0%,#1e3a8a 100%);padding:36px 40px;text-align:center;">
          <h1 style="color:#d4af37;font-size:28px;margin:0 0 8px 0;font-family:Georgia,serif;">Art of Aviation</h1>
          <p style="color:#e2e8f0;font-size:16px;margin:0;">Community Mural &mdash; Reno 250 Celebration</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <h2 style="color:#0a192f;font-size:22px;margin:0 0 16px 0;">Welcome, ${name}!</h2>
          <p style="color:#334155;font-size:16px;line-height:1.6;margin:0 0 16px 0;">
            You have successfully registered for <strong style="color:#1e3a8a;">Square ${cell}</strong> in the Art of Aviation Community Mural. Here is your assigned square artwork:
          </p>
          ${imageUrl ? `<div style="text-align:center;margin:24px 0;">
            <img src="${imageUrl}" alt="Square ${cell}" style="max-width:280px;border:3px solid #d4af37;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.12);" />
            <p style="color:#64748b;font-size:13px;margin:8px 0 0 0;">Your square: ${cell}</p>
          </div>` : ''}
          <div style="background:#f8fafc;border-left:4px solid #d4af37;padding:20px 24px;margin:24px 0;border-radius:0 8px 8px 0;">
            <h3 style="color:#0a192f;font-size:18px;margin:0 0 12px 0;">Next Steps</h3>
            <ol style="color:#334155;font-size:15px;line-height:1.8;margin:0;padding-left:20px;">
              <li>Pick up your canvas square at the designated location</li>
              <li>Paint your masterpiece inspired by the mural section</li>
              <li>Return your completed canvas by <strong>June 22nd</strong></li>
              <li>Join us for a community reception and Artown Kickoff the evening of <strong>July 2nd</strong> at The Discovery, where we will unveil the final mural!</li>
            </ol>
          </div>
          <p style="color:#334155;font-size:16px;line-height:1.6;margin:16px 0 0 0;">
            Thank you for being part of this incredible community art project!
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#0a192f;padding:24px 40px;text-align:center;">
          <p style="color:#94a3b8;font-size:13px;margin:0 0 4px 0;">A project by Artown &bull; The Discovery Museum &bull; The George W. Gillemot Foundation</p>
          <p style="color:#94a3b8;font-size:13px;margin:0;">Presenting Partner: <strong style="color:#d4af37;">Strengthen our Community</strong></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Art of Aviation Mural <noreply@artowncommunitymural.com>',
        to: [email],
        subject: `Art of Aviation Mural - You are registered for Square ${cell}!`,
        html: htmlBody,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || `HTTP ${response.status}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
