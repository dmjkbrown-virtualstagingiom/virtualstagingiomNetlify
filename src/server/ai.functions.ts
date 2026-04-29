import { createServerFn } from "@tanstack/react-start";
import { getStore } from "@netlify/blobs";
import Replicate from "replicate";

const STYLE_PROMPTS: Record<string, string> = {
  scandinavian: "Redesign this room in a Scandinavian interior design style. Clean lines, natural light wood furniture, white walls, minimalist decor, neutral tones, cosy textures, simple and functional.",
  contemporary: "Redesign this room in a contemporary interior design style. Sleek modern furniture, neutral colour palette, clean lines, polished surfaces, minimal clutter, sophisticated lighting.",
  industrial: "Redesign this room in an industrial interior design style. Exposed brick walls, raw steel fixtures, dark metal furniture, concrete surfaces, Edison bulb lighting, urban loft aesthetic.",
  maximalist: "Redesign this room in a maximalist interior design style. Bold colours, rich jewel tones, layered patterns and textures, eclectic furniture, decorative accessories, dramatic and luxurious.",
  japandi: "Redesign this room in a Japandi interior design style. Warm wabi-sabi aesthetic, organic natural materials, low furniture, muted earthy tones, minimal clutter, zen calm atmosphere.",
  coastal: "Redesign this room in a coastal interior design style. Sea blues and sandy neutrals, natural linen fabrics, driftwood tones, rattan furniture, whitewashed walls, light and airy feel.",
  artdeco: "Redesign this room in an Art Deco interior design style. Geometric patterns, marble surfaces, gold and brass accents, velvet upholstery, mirrored furniture, glamorous and opulent.",
  biophilic: "Redesign this room in a biophilic interior design style. Living plant walls, abundant greenery, natural wood and stone materials, earthy tones, organic shapes, connection to nature.",
};

export const generateRoomImageFn = createServerFn({ method: "POST" })
  .inputValidator((formData: FormData) => formData)
  .handler(async ({ data: formData }) => {
    const file = formData.get("file") as File;
    const style = formData.get("style") as string;

    if (!file || !style) {
      throw new Error("File and style are required");
    }

    const buffer = await file.arrayBuffer();
    const store = getStore("room-images");
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    await store.set(filename, buffer, {
      metadata: { contentType: file.type },
    });

    const mimeType = file.type || "image/jpeg";
    const base64Image = Buffer.from(buffer).toString("base64");
    const dataUri = `data:${mimeType};base64,${base64Image}`;

    try {
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });

      const prompt = STYLE_PROMPTS[style] ||
        `Redesign this room in a ${style} interior design style. Professional real estate photograph, perfect lighting, wide angle.`;

      // Use predictions API to properly wait for completion
      let prediction = await replicate.predictions.create({
        model: "google/nano-banana",
        input: {
          prompt,
          image_input: [dataUri],
        },
      });

      // Poll until complete
      while (prediction.status !== "succeeded" && prediction.status !== "failed") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        prediction = await replicate.predictions.get(prediction.id);
      }

      if (prediction.status === "failed") {
        throw new Error(`Prediction failed: ${prediction.error}`);
      }

      const output = prediction.output;
      console.log("Prediction output:", JSON.stringify(output));

      let generatedUrl = "";
      if (typeof output === "string" && output.startsWith("http")) {
        generatedUrl = output;
      } else if (Array.isArray(output) && output.length > 0) {
        generatedUrl = typeof output[0] === "string" ? output[0] : String(output[0]);
      } else if (output && typeof (output as any).url === "string") {
        generatedUrl = (output as any).url;
      } else {
        throw new Error(`Unknown output format: ${JSON.stringify(output)}`);
      }

      return {
        success: true,
        originalImageKey: filename,
        generatedImageUrl: generatedUrl,
      };
    } catch (error) {
      console.error("AI Generation failed:", error);

      return {
        success: false,
        originalImageKey: filename,
        generatedImageUrl:
          "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1024&auto=format&fit=crop",
        warning: `AI generation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  });
