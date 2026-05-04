import { readdir } from "node:fs/promises";

export async function read( context ) {
  // Products folder exists
  try {
    await readdir( context.assetsPath );
    console.log( `✓ Found ${context.assetsPath}` );
  } catch( e ) {
    context.errors.push( `[READ] Assets path not found: ${context.assetsPath}` );    
    return context;
  }

  // Output folder exists
  try {
    await readdir( context.outputPath );
    console.log( `✓ Found ${context.outputPath}` );
  } catch( e ) {
    context.errors.push( `[READ] Output path not found: ${context.outputPath}` );
    return context;
  }  

  return context;
}
