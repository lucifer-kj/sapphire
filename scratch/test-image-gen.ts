import { ImageGenerationService } from "../src/services/image-generation";

async function main() {
  const prompt = "Cinematic travel photography of a family enjoying vacation in Japan, cherry blossoms, golden hour light, 8k";
  console.log("Testing Image Generation with prompt:", prompt);
  
  const url = await ImageGenerationService.generateImageUrl(prompt);
  console.log("Generated Image URL length:", url.length);
  console.log("URL preview:", url.slice(0, 100) + "...");
}

main().catch(console.error);
