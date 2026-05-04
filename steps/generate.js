import { mkdir } from "node:fs/promises";
import path from "node:path";

import { generateImage } from "../lib/openai-image.js";
import { slugify } from "../util/slugify.js";

export async function generate( context ) {
  // Generate missing assets
  for( const product of context.missingAssets ) {
    const slug = slugify( product.name );

    const outputPath = path.join(
      context.outputPath,
      'generated',
      `${slug}.png`
    );    

    // Lay down the output folder structure
    await mkdir( path.dirname( outputPath ), {recursive: true} );

    // Build LLM prompt
    // Neat little filter trick for optional lines of context
    // If field does not exist, it will resolve as undefined (falsy)
    // Otherwise it will resolve with string (true)
    // Brand rules extended or outright replaced in some areas to get specific result
    // Trying to coax the model for a transparent background
    const prompt = [
      `Create a clean product image for ${product.name}.`,
      product.positioning && `Positioning: ${product.positioning}.`,
      context.campaign.brand && `Brand: ${context.campaign.brand}.`,
      context.campaign.brandRules?.tone && `Tone: ${context.campaign.brandRules.tone}.`,
      context.campaign.brandRules?.colors && `Visual accents may use these brand colors: ${context.campaign.brandRules.colors.join( ', ' )}.`,
      'Style: Modern consumer product marketing image.',
      'Subject: Isolated product only.',
      'Background: Fully transparent (alpha channel).',
      'Edges: Clean cutout, no background artifacts.',
      'Constraints: No text, no logos, no watermarks, no third-party brands, no copyrighted characters.'
    ].filter( Boolean ).join( ' ' );          

    try {
      // Call LLM for image generation
      // Leverage API background option to try and force transparency
      await generateImage( {
        prompt,
        outputPath,
        background: 'transparent'
      } );

      // Add to context
      context.generatedAssets.push( {
        product: product.name,
        path: outputPath
      } );        

      console.log( `✓ Generated product image for ${product.name}` );
    } catch( err ) {
      // Bzzt!
      context.errors.push(
        `[GENERATE] Failed to generate ${ratio.name} for ${product.name}: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      );
    
      console.log( `✕ Failed product image for ${product.name}` );              
    }
  }

  // Generate missing hero asset
  if( context.missingHeroAsset ) {
    const outputPath = path.join(
      context.outputPath,
      'generated',
      'hero-background.png'
    );

    const prompt = [
      `Create a social campaign background image for ${context.campaign.name}.`,
      `Brand: ${context.campaign.brand}.`,
      context.campaign.brandRules?.tone && `Tone: ${context.campaign.brandRules.tone}.`,
      context.campaign.brandRules?.colors && `Use brand colors: ${context.campaign.brandRules.colors.join( ', ' )}.`,
      'Style: Modern marketing background, playful nostalgic tech aesthetic.',
      'No text, no logos, no people, no copyrighted characters.',
      'Leave open space for product and message overlay.',
      'Composition: Wide background with visual interest on edges, center area kept relatively open for product and text.'      
    ].filter( Boolean ).join( ' ' );

    await generateImage( {
      prompt,
      outputPath,
      size: '1536x1024',
      background: 'opaque'
    } );

    context.generatedHeroAsset = {
      path: outputPath
    };

    console.log( '✓ Generated hero background' );
  }  

  return context;
}
