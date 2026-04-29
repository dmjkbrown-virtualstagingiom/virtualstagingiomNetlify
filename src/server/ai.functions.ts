import { createServerFn } from "@tanstack/react-start";
import { getStore } from "@netlify/blobs";
import Replicate from "replicate";

export const generateRoomImageFn = createServerFn({ method: "POST" })
  .inputValidator((formData: FormData) => formData)
  .handler(async ({ data: formData }) => {
    const file = formData.get("file") as File;
    const style = formData.get("style") as string;

    if (!file || !style) {
      throw new Error("File and style are required");
    }

    // 1. Save uploaded photo temporarily to Netlify Blobs
    const buffer = await file.arrayBuffer();
    const store = getStore("room-images");
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    await store.set(filename, buffer, {
      metadata: { contentType: file.type },
    });

    // We are using Replicate to generate an image-to-image transformation
    // passing the image as a Data URI.
    try {
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });

      const mimeType = file.type || "image/jpeg";
      const base64Image = Buffer.from(buffer).toString("base64");
      const dataUri = `data:${mimeType};base64,${base64Image}`;

      const output = await replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            prompt: `A highly realistic, professional real estate photograph of a beautiful room decorated in the ${style} interior design style. Perfect lighting, wide angle.`,
            image: dataUri,
            prompt_strength: 0.65,
            num_outputs: 1
          }
        }
      );

      let generatedUrl = "";
      if (Array.isArray(output) && output.length > 0) {
        generatedUrl = typeof output[0] === 'string' ? output[0] : String(output[0]);
      } else if (typeof output === "string") {
        generatedUrl = output;
      } else {
        console.error("Unexpected output format:", output);
        throw new Error("Unexpected output format from Replicate");
      }

      return {
        success: true,
        originalImageKey: filename,
        generatedImageUrl: generatedUrl,
      };
    } catch (error) {
      console.error("AI Generation failed:", error);

      // Fallback/mock response for development if API keys are not set
      // Simulate a 3-second delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      return {
        success: true,
        originalImageKey: filename,
        // Mock a colored placeholder as a fallback image
        generatedImageUrl:
          "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1024&auto=format&fit=crop",
        warning:
          "AI generation failed or not configured. Returning fallback image.",
      };
    }
  });
