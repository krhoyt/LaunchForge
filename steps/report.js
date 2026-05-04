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
    errors: context.errors
  };

  // Report output path based on brief name
  const dot = brief.indexOf( '.' );
  const slug = slugify( brief.substring( 0, dot ) );
  const outputPath = path.join( context.outputPath, `report-${slug}.json` );

  // Write report
  await Bun.write( outputPath, JSON.stringify( report, null, 2 ) );

  // Log it
  console.log( `✓ Report written to ${outputPath}` );

  // Done!
  return context;
}
