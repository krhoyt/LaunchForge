import OpenAI from "openai";

import { DEFAULT_IMAGE_MODEL, DEFAULT_IMAGE_SIZE } from "./config.js";

// Presence of environment variable is checked in main
const client = new OpenAI( {
  apiKey: process.env.OPENAI_API_KEY
} );

export async function generateImage( {prompt, size, outputPath, background} ) {
  // Default size if size is null or undefined
  const finalSize = size ?? DEFAULT_IMAGE_SIZE;

  const result = await client.images.generate( {
    model: DEFAULT_IMAGE_MODEL,
    prompt,
    size: finalSize,
    background
  } );

  const base64 = result.data?.[0]?.b64_json;

  if( !base64 ) {
    // Throw for program error, not process error
    throw new Error( 'OpenAI image generation did not return image data' );
  }

  // Write to file
  await Bun.write( outputPath, Buffer.from( base64, 'base64' ) );

  return outputPath;
}
