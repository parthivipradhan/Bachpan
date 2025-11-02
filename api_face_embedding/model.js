import { AutoProcessor, CLIPVisionModelWithProjection, RawImage } from '@xenova/transformers';

// Load the processor and model ONCE and reuse
const processorPromise = AutoProcessor.from_pretrained('Xenova/clip-vit-base-patch32'); // or patch16
const visionModelPromise = CLIPVisionModelWithProjection.from_pretrained('Xenova/clip-vit-base-patch32');

// Function to generate embedding from an image
export async function visionEmbeddingGenerator(image_path) {
  const processor = await processorPromise;
  const visionModel = await visionModelPromise;

  try {
    const image = await RawImage.read(image_path); // Reads and preprocesses the image
    const image_inputs = await processor(image);

    const { image_embeds } = await visionModel(image_inputs);
    return image_embeds.data; // Float32Array - your image embedding
  } catch (err) {
    console.error(`Error processing ${image_path}:`, err);
    return null;
  }
}

export function cosineSimilarity(vecA, vecB) {
  let dot = 0.0, normA = 0.0, normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}