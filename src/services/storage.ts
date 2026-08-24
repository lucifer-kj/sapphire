import { createAdminClient } from "@/lib/supabase/admin";

export class StorageService {
  private static BUCKET_NAME = "generated-posts";
  private static bucketEnsured = false;

  /**
   * Ensures the storage bucket exists with public read access.
   */
  private static async ensureBucket(supabase: any): Promise<boolean> {
    if (this.bucketEnsured) return true;

    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const exists = buckets?.some((b: any) => b.name === this.BUCKET_NAME);

      if (!exists) {
        await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
        });
      }
      this.bucketEnsured = true;
      return true;
    } catch (err) {
      console.warn("Could not ensure Supabase storage bucket:", err);
      return false;
    }
  }

  /**
   * Uploads a base64 or buffer image to Supabase Storage and returns the public CDN URL.
   * If storage fails or is unavailable, falls back safely to returning the original data URI.
   */
  static async uploadImage(
    imageData: string,
    fileName: string,
    contentType: "image/png" | "image/jpeg" = "image/png"
  ): Promise<string> {
    if (!imageData) return "";

    // If it's already a hosted http URL, return it directly
    if (imageData.startsWith("http://") || imageData.startsWith("https://")) {
      return imageData;
    }

    try {
      const supabase = createAdminClient();
      if (!supabase) return imageData;

      await this.ensureBucket(supabase);

      // Extract raw buffer from base64 string
      const base64Clean = imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Clean, "base64");

      const path = `${Date.now()}_${fileName}`;

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(path, buffer, {
          contentType,
          upsert: true,
        });

      if (error || !data) {
        console.warn("Supabase storage upload warning:", error?.message);
        return imageData;
      }

      const { data: publicUrlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(path);

      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    } catch (err) {
      console.warn("StorageService upload fallback to inline data URI:", err);
    }

    return imageData;
  }
}
