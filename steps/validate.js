import path from "node:path";
import { readdir } from "node:fs/promises";

import { RATIOS } from "../lib/config.js";
import { slugify } from "../util/slugify.js";
import { mkdir } from "node:fs/promises";

export async function validate( context ) {
  // Parse was successful
  if( !context.campaign ) {
    context.errors.push( '[VALIDATE] Campaign not parsed' );
    return context;
  }

  // Products array has two elements
  if( context.campaign.products.length < 2 ) {
    context.errors.push( '[VALIDATE] There must be at least two products' );    
  } else {
    console.log( '✓ At least two products found' );
  }

  // Product names are non-empty
  const names = [];
  let hasInvalid = false;

  for( const product of context.campaign.products ) {
    if( typeof product.name !== 'string' || !product.name.trim() ) {
      context.errors.push( '[VALIDATE] Product missing valid name' );
      hasInvalid = true;
    } else {
      names.push( product.name );
    }
  }

  console.log( '✓ Product names present' );

  // Product names are unique
  if( !hasInvalid ) {
    const uniqueNames = new Set( names );

    if( uniqueNames.size !== names.length ) {
      context.errors.push( '[VALIDATE] Product names must be unique' );
    } else {
      console.log( '✓ Product names are unique' );
    }
  } 

  /*
   * Maximizing reuse on both product assets and hero asset
   * $ Cost saver for me in development
   * ♥ Would be a big cost saver for customer in production
   */
  
  // Check for input asset presence
  const inputFiles = await readdir( context.assetsPath );
  
  // Reused for hero check
  let generatedPath = path.join( context.outputPath, 'generated' );
  await mkdir( generatedPath, {recursive: true} );

  let generatedFiles = await readdir( generatedPath );

  for( const product of context.campaign.products ) {
    const slug = slugify( product.name );
    const generatedFile = `${slug}.png`;

    // Reuse input asset
    if( product.asset && inputFiles.includes(product.asset) ) {
      context.reusedAssets.push( {
        ... product,
        source: 'input',
        path: path.join( context.assetsPath, product.asset )
      } );

      console.log( `✓ Found input asset for ${product.name}` );
    } else if( generatedFiles.includes( generatedFile ) ) {
      // Reuse generated asset from previous run    
      context.reusedAssets.push( {
        ... product,
        source: 'generated',
        path: path.join( generatedPath, generatedFile )
      } );

      console.log( `✓ Reusing generated asset for ${product.name}` );
    } else {
      // Missing entirely. Generate later.
      context.missingAssets.push( structuredClone( product ) );

      const message = `[VALIDATE] Missing asset for ${product.name}. Will be generated.`;
      context.warnings.push( message );   
      console.log( `⚠ ${message}` );
    }
  }

  // Check for hero asset
  const heroFile = 'hero-background.png';

  generatedPath = path.join( context.outputPath, 'generated' );
  generatedFiles = await readdir( generatedPath );

  if(
    context.campaign.heroAsset &&
    files.includes(context.campaign.heroAsset)
  ) {
    // Reuse input asset
    context.reusedHeroAsset = {
      source: 'input',
      path: path.join( context.assetsPath, context.campaign.heroAsset )
    };

    console.log( '✓ Found input hero asset' );
  } else if( generatedFiles.includes( heroFile ) ) {
    // Reuse generated asset from previous run        
    context.reusedHeroAsset = {
      source: 'generated',
      path: path.join( generatedPath, heroFile )
    };

    console.log( '✓ Reusing generated hero asset' );
  } else {
    // Specified but not found
    if( context.campaign.heroAsset ) {
      context.missingHeroAsset = {
        asset: context.campaign.heroAsset,
        reason: 'Referenced hero asset not found'
      };
    } else {
      // Not specified
      context.missingHeroAsset = {
        asset: null,
        reason: 'No hero asset provided'
      };
    }

    const warning = context.campaign.heroAsset
      ? 'Hero asset not found. Will be generated.'
      : 'Missing hero asset. Will be generated.';

    context.warnings.push( `[VALIDATE] ${warning}` );
    console.log( `⚠ ${warning}` );
  }

  // Check for safe output paths
  const seenPaths = new Set();

  for( const product of context.campaign.products ) {
    const slug = slugify( product.name );

    for( const ratio of RATIOS ) {
      const outputPath = path.resolve(
        context.outputPath,
        'posts',
        slug,
        `${ratio.name}.png`
      );

      const root = path.resolve( context.outputPath );

      if( !outputPath.startsWith( root ) ) {
        context.errors.push( `[VALIDATE] Unsafe output path for ${product.name}` );
        continue;
      }

      if( seenPaths.has( outputPath ) ) {
        context.errors.push( `[VALIDATE] Duplicate output path for ${product.name}` );
      } else {
        seenPaths.add( outputPath );
      }
    }
  }  

  // Message
  let message = context.campaign.message;

  if( typeof message !== 'string' ) {
    context.errors.push( '[VALIDATE] Message field must be a string' );    
  } else {
    message = message.trim();

    if( !message.length ) {
      context.errors.push( '[VALIDATE] Message field is empty' );
    } else {
      console.log( '✓ Message field has content' );

      // Polite check for length
      if( message.length > 120 ) {
        context.warnings.push( `[VALIDATE] Message length (${message.length}) may be too long for layout` );
      }

      // Store trimmed so we do not need to do it later
      context.campaign.message = message;
    }
  }

  // Market
  if (
    typeof context.campaign.market !== 'string' ||
    !context.campaign.market.trim()
  ) {
    context.errors.push( '[VALIDATE] Market field is empty' );
  } else {
    console.log( '✓ Market field has content' );
  }  

  // Audience
  if (
    typeof context.campaign.audience !== 'string' ||
    !context.campaign.audience.trim()
  ) {
    context.errors.push( '[VALIDATE] Audience field is empty' );
  } else {
    console.log( '✓ Audience field has content' );
  }

  // Note on ratios
  // TODO: Ratios configurable externally
  console.log( '✓ Using default aspect ratios (1:1, 9:16, 16:9)' );

  return context;
}
