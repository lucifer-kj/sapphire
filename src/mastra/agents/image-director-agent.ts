import { generateObject } from "ai";
import { LockedShotListSchema, LockedShotList } from "@/lib/schema/shot-list";
import { ConceptItem, UserIntent, ResearchContext } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";
import { getReasoningModel, getReasoningFallbackModel } from "@/lib/ai-model";

export class ImageDirectorAgent {
  /**
   * Translates a Creative Director's high-level concept + Brand DNA + Research motifs
   * into a locked, non-negotiable physical shot list of 3-5 concrete objects/props.
   * This object serves as the ground truth contract for both Prompt Engineer and Critic.
   */
  static async compileLockedShotList(
    concept: ConceptItem,
    brand: BrandProfile,
    intent: UserIntent,
    research?: ResearchContext | null
  ): Promise<LockedShotList> {
    const systemPrompt = `You are Sapphire's Principal Image Director & Physical Asset Supervisor.
Your sole job is to translate the creative concept for "${brand.name}" into an explicit, non-negotiable LOCKED SHOT LIST of tangible physical elements that MUST appear in the generated photography.

RULES FOR PHYSICAL ASSET SPECIFICATION (CRITICAL):
1. required_props: MUST be 2 to 5 concrete, tangible physical objects (e.g. if Vietnamese coffee: ["traditional stainless steel phin filter", "glass of condensed milk coffee", "scattered dark roasted coffee beans on wooden surface"]). Never output vague abstractions like "luxury feel" or "vibe".
2. hero_subject: Explicit physical focal person, hands, or product asset in action.
3. setting: Specific authentic architectural or natural environment with tactile surface textures.
4. lighting_and_atmosphere: Precise lighting angle (e.g. golden hour morning side-light), color temperature, and atmospheric depth.
5. compositional_framing: Spatial positioning matching negative space void for typography overlay.
6. negative_constraints: Forbidden objects, clutter, or visual artifacts to exclude.`;

    const promptText = `Campaign Event / Topic: "${intent.event}" (${intent.objective})
Concept Label: "${concept.label}"
Creative Direction: "${concept.creative_direction}"
Visual Style: "${concept.visual_style}"
Archetype: "${concept.design_blueprint?.archetype || "editorial_magazine"}"
Research Motifs: ${research?.visual_motifs ? research.visual_motifs.join(", ") : "Authentic editorial storytelling"}`;

    try {
      const result = await generateObject({
        model: getReasoningModel(),
        schema: LockedShotListSchema,
        system: systemPrompt,
        prompt: promptText,
      });
      return result.object;
    } catch (err) {
      console.warn("ImageDirector primary failed, trying fallback:", err);
      try {
        const result = await generateObject({
          model: getReasoningFallbackModel(),
          schema: LockedShotListSchema,
          system: systemPrompt,
          prompt: promptText,
        });
        return result.object;
      } catch (err2) {
        const topic = intent.event.toLowerCase();
        let defaultProps = ["handcrafted hero product", "artisan detail asset", "natural ambient textures"];
        if (topic.includes("coffee")) {
          defaultProps = ["traditional stainless steel phin filter", "glass cup with dark coffee and condensed milk", "roasted coffee beans on rustic table"];
        } else if (topic.includes("hotel") || topic.includes("resort") || topic.includes("travel")) {
          defaultProps = ["luxury luggage or passport accessory", "balcony railing with scenic landmark view", "morning beverage on marble table"];
        }

        return {
          hero_subject: `Discerning traveler interacting with ${intent.event} hero props in tack-sharp focus`,
          required_props: defaultProps,
          setting: `Authentic scenic setting in ${intent.event} with rich architectural and natural textures`,
          lighting_and_atmosphere: "Warm directional morning side-lighting with crisp micro-contrast and rich natural depth",
          compositional_framing: "Vertical 4:5 commercial framing with upper 45% clean sky void for typography overlay",
          negative_constraints: ["blurry", "soft focus", "out of focus", "motion blur", "text", "watermark", "cluttered center", "distorted hands"],
        };
      }
    }
  }
}
