import { SatoriCompositorService } from "@/services/satori-compositor";
import { DesignSpecification } from "@/lib/schema/layout-dsl";

async function testSpeed() {
  const spec: DesignSpecification = {
    id: "test",
    version: "2.0",
    platform: "instagram",
    archetype: "editorial_magazine",
    canvas: {
      width: 1080,
      height: 1350,
      aspectRatio: "4:5",
      backgroundColor: "#09090b",
      safeZone: { top: 80, bottom: 80, left: 60, right: 60 },
    },
    brandTokens: {
      primaryColor: "#FAF7F2",
      surfaceColor: "#18181b",
      accentColor: "#D97757",
      mutedColor: "#A1A1AA",
      fontFamilyHeading: "Outfit",
      fontFamilyBody: "Plus Jakarta Sans",
      brandName: "Vagabond",
      socialHandle: "@vagabond",
    },
    layoutTree: [
      { type: "text", role: "eyebrow", content: "ARTISANAL RITUAL", label: "Eyebrow", title: "Eyebrow", description: "", indexNumber: "1" },
      { type: "text", role: "hook", content: "The World Begins After The First Sip", label: "Hook", title: "Hook", description: "", indexNumber: "2" },
      { type: "text", role: "subheadline", content: "Discover slow mornings with Vagabond Travel.", label: "Subheadline", title: "Subhead", description: "", indexNumber: "3" },
      { type: "text", role: "cta", content: "Explore Journeys →", label: "CTA", title: "CTA", description: "", indexNumber: "4" },
    ],
    photoPrompt: "test",
    negativePrompt: "none",
  };

  console.log("Testing Satori standalone speed...");
  const start = Date.now();
  const pngDataUrl = await SatoriCompositorService.compositePost(spec);
  const elapsed = Date.now() - start;
  console.log(`✅ Satori alone rendered in ${elapsed}ms! PNG size: ~${Math.round(pngDataUrl.length / 1024)} KB`);
}

testSpeed().catch(console.error);
