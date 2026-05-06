import { Glob } from "bun";
import path from "node:path";

import { slugify } from "../util/slugify";

export async function report( context ) {
  // Brief file name
  const brief = path.basename( context.briefPath );

  // Report JSON
  // Partial of context
  const report = {
    brief,
    products: context.campaign.products.map( ( item ) => item.name ),
    outputs: context.outputs,
    reusedAssets: context.reusedAssets,
    generatedAssets: context.generatedAssets,
    hero: context.reusedHeroAsset ?? context.generatedHeroAsset ?? null,
    warnings: context.warnings,
    errors: context.errors,
    completedAt: new Date()
  };

  // Report output path based on brief name
  const dot = brief.indexOf( '.' );
  const slug = slugify( brief.substring( 0, dot ) );
  const reportPath = path.join( context.outputPath, `report-${slug}.json` );   

  // Write report
  await Bun.write( reportPath, JSON.stringify( report, null, 2 ) );

  // Log it
  console.log( `✓ Report written to ${reportPath}` );

  // Archive image files
  const files = {};

  // Normalize paths for cross-platform compatibility    
  // Read asset bytes
  for( const path of context.outputs ) {
    const archivePath = path.replaceAll( '\\', '/' );
    files[archivePath] = await Bun.file( path ).bytes();
  }

  // Create archive and write to disk
  const archive = new Bun.Archive( files, {compress: 'gzip'} );
  const archivePath = path.join( context.outputPath, `assets-${slug}.tar.gz` );
  await Bun.write( archivePath, archive );  

  // Log it
  console.log( `✓ Archive written to ${archivePath}` );

  // Done!
  return context;
}
