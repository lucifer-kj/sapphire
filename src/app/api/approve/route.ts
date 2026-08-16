import { NextRequest, NextResponse } from "next/server";
import { EmailDeliveryService } from "@/services/email-delivery";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      campaignId,
      conceptId,
      campaignTitle = "Social Media Campaign",
      conceptLabel = "Approved Concept",
      imageUrl,
      captionInstagram,
      captionLinkedin,
      recipientEmail,
    } = body;

    if (!captionInstagram || !captionLinkedin) {
      return NextResponse.json(
        { error: "Instagram and LinkedIn captions are required for approval." },
        { status: 400 }
      );
    }

    // 1. Deliver Email Package via Resend
    const deliveryResult = await EmailDeliveryService.sendApprovedPackage({
      campaignTitle,
      conceptLabel,
      imageUrl,
      captionInstagram,
      captionLinkedin,
      recipientEmail,
    });

    // 2. Update Supabase Concept & Campaign status to 'approved' & 'delivered'
    try {
      const supabase = createAdminClient();

      if (conceptId) {
        await supabase
          .from("concepts")
          .update({ status: "approved", is_selected: true })
          .eq("id", conceptId);
      }

      if (campaignId) {
        await supabase
          .from("campaigns")
          .update({ status: "delivered" })
          .eq("id", campaignId);
      }
    } catch (err) {
      console.warn("Supabase approval status update fallback:", err);
    }

    return NextResponse.json({
      success: true,
      emailId: deliveryResult.id,
      message: "Human approval confirmed. Final creative package emailed successfully!",
    });
  } catch (error: any) {
    console.error("Error in /api/approve route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to deliver approved package." },
      { status: 500 }
    );
  }
}
