import { createCanvas, loadImage } from "canvas";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { LAYOUTS } from "../lib/config.js";
import { RATIOS } from "../lib/config.js";
import { slugify } from "../util/slugify.js";

export async function compose( context ) {
  // Flatten image files into single map
  const productImages = {};

  // Reused
  // May include generated from previous pass
  for( const asset of context.reusedAssets ) {
    productImages[asset.name] = await loadImage( asset.path );
  }

  // Newly generated
  for( const asset of context.generatedAssets ) {
    productImages[asset.product] = await loadImage( asset.path );    
  }

  // Hero path either reused or generated
  let heroImage = null;

  if( context.reusedHeroAsset ) {
    heroImage = await loadImage( context.reusedHeroAsset.path );
  } else if( context.generatedHeroAsset ) {
    heroImage = await loadImage( context.generatedHeroAsset.path );
  }  

  // Somehow missed it along the way?
  // No composing for us
  if( !heroImage ) {
    context.errors.push( '[COMPOSE] No hero image available' );
    return context;
  }  

  // For each product
  for( const product of context.campaign.products ) {

    // For each ratio
    for( const ratio of RATIOS ) {

      // Create canvas
      const canvas = createCanvas( ratio.width, ratio.height );
      const ctx = canvas.getContext( '2d' );        
  
      // Draw hero
      ctx.drawImage( 
        heroImage, 
        LAYOUTS[ratio.name].hero.x,        
        LAYOUTS[ratio.name].hero.y,                
        LAYOUTS[ratio.name].hero.width,
        LAYOUTS[ratio.name].hero.height
      );

      // Draw product
      ctx.drawImage( 
        productImages[product.name], 
        LAYOUTS[ratio.name].product.x,        
        LAYOUTS[ratio.name].product.y,                
        LAYOUTS[ratio.name].product.width,
        LAYOUTS[ratio.name].product.height
      );

      // Draw name
      ctx.font = `${LAYOUTS[ratio.name].name.font}px "Arial Black"`;
      ctx.fillStyle = context.campaign.brandRules.colors[2];
      ctx.lineWidth = 2;
      ctx.strokeStyle = context.campaign.brandRules.colors[1];
      ctx.fillText( product.name, LAYOUTS[ratio.name].name.x, LAYOUTS[ratio.name].name.y );
      ctx.strokeText( product.name, LAYOUTS[ratio.name].name.x, LAYOUTS[ratio.name].name.y );      

      // Draw message
      ctx.font = `${LAYOUTS[ratio.name].message.font}px "Arial Black"`;
      ctx.fillStyle = context.campaign.brandRules.colors[2];
      ctx.lineWidth = 2;
      ctx.strokeStyle = context.campaign.brandRules.colors[1];
      ctx.fillText( context.campaign.message, LAYOUTS[ratio.name].message.x, LAYOUTS[ratio.name].message.y );
      ctx.strokeText( context.campaign.message, LAYOUTS[ratio.name].message.x, LAYOUTS[ratio.name].message.y );

      // Encode PNG from canvas
      // Generate path slug from product name
      // Combine to full output path
      // Make sure directory exists
      // Write the file to disk
      const pngFile = canvas.toBuffer( 'image/png' );
      const slug = slugify( product.name );
      const outputPath = path.join( context.outputPath, 'posts', slug, `${ratio.name}.png` );      
      await mkdir( path.dirname( outputPath ), {recursive: true} );      
      await Bun.write( outputPath, pngFile );

      context.outputs.push( outputPath );
      console.log( `✓ Composed ${ratio.name} post for ${product.name}` );      
    }
  }  

  return context;
}

// Sizing to cover output image with input image
function computeImageBounds( imageWidth, imageHeight, targetWidth, targetHeight ) {
  const scale = Math.max( targetWidth / imageWidth, targetHeight / imageHeight );
  return {
    scale,
    width: imageWidth * scale,
    height: imageHeight * scale
  };
}
