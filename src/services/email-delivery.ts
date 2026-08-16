import { Resend } from "resend";

export interface PackageDeliveryOptions {
  campaignTitle: string;
  conceptLabel: string;
  imageUrl?: string;
  captionInstagram: string;
  captionLinkedin: string;
  recipientEmail?: string;
  brandName?: string;
}

export class EmailDeliveryService {
  /**
   * Delivers an approved creative package via Resend email.
   */
  static async sendApprovedPackage(options: PackageDeliveryOptions): Promise<{ success: boolean; id?: string }> {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn("RESEND_API_KEY is not configured in .env.local");
      return { success: false };
    }

    const resend = new Resend(apiKey);

    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const toEmail = options.recipientEmail || process.env.RESEND_TO_EMAIL;

    if (!toEmail) {
      throw new Error("Recipient email address is required for delivery.");
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Inter, system-ui, sans-serif; background-color: #FAF9F5; color: #141413; padding: 24px; }
          .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid rgba(20,20,19,0.12); border-radius: 12px; overflow: hidden; padding: 24px; }
          .header { font-size: 20px; font-weight: 700; color: #141413; margin-bottom: 8px; }
          .sub { font-size: 13px; color: #B0AEA5; margin-bottom: 20px; }
          .badge { display: inline-block; padding: 4px 8px; background: #FAF9F5; border: 1px solid rgba(20,20,19,0.12); border-radius: 6px; font-size: 12px; font-weight: 600; }
          .image-box { margin: 20px 0; border-radius: 8px; overflow: hidden; border: 1px solid rgba(20,20,19,0.12); }
          .image-box img { width: 100%; height: auto; display: block; }
          .caption-card { background: #FAF9F5; border: 1px solid rgba(20,20,19,0.12); border-radius: 8px; padding: 16px; margin-bottom: 16px; font-size: 13px; line-height: 1.5; }
          .footer { text-align: center; font-size: 12px; color: #B0AEA5; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="badge">${options.brandName || "Vagabond Travel Agency"} — Approved Creative Package</div>
          <h1 class="header">${options.campaignTitle}</h1>
          <p class="sub">${options.conceptLabel} • Human Approved Delivery</p>

          ${
            options.imageUrl
              ? `
          <div class="image-box">
            <img src="${options.imageUrl}" alt="Approved Social Media Visual Artwork" />
          </div>
          <p style="text-align: right; font-size: 12px;"><a href="${options.imageUrl}" target="_blank" style="color: #D97757; text-decoration: none;">Download High-Res Image &rarr;</a></p>
          `
              : ""
          }

          <div class="caption-card">
            <strong style="color: #141413; display: block; margin-bottom: 6px;">📸 Instagram Caption & Hashtags:</strong>
            <p style="white-space: pre-wrap; margin: 0;">${options.captionInstagram}</p>
          </div>

          <div class="caption-card">
            <strong style="color: #141413; display: block; margin-bottom: 6px;">💼 LinkedIn Professional Caption:</strong>
            <p style="white-space: pre-wrap; margin: 0;">${options.captionLinkedin}</p>
          </div>

          <div class="footer">
            Delivered autonomously by Sapphire AI Creative Director.
          </div>
        </div>
      </body>
    </html>
    `;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `Approved Content Package: ${options.campaignTitle} (${options.conceptLabel})`,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend Email Delivery Error:", error);
      throw new Error(`Email delivery failed: ${error.message}`);
    }

    return { success: true, id: data?.id };
  }
}
