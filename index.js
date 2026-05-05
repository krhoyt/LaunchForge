import { readdir } from "node:fs/promises";

// Steps
import { parse } from "./steps/parse.js";
import { read } from "./steps/read.js";
import { validate } from "./steps/validate.js";
import { generate } from "./steps/generate.js";
import { compose } from "./steps/compose.js";
import { report } from "./steps/report.js";

// Check for OpenAI API key
// Bun automatically reads .env file if present
if( !process.env.OPENAI_API_KEY ) {
  console.error( '[RUNNER] OPENAI_API_KEY is not set. Add it to a .env file.' );
  process.exit( 1 );
}

async function main() {
  // Check for JSON files
  const briefs = ( await readdir( './input/briefs' ) ).filter( ( item ) => item.endsWith( '.json' ) );

  // Steps to be called
  // Allows step loop to break on errors for current brief
  const steps = [read, parse, validate, generate, compose, report];    
  
  // Error/warning reporting
  let errors = [];  
  let warnings = [];

  // Report progress
  if( briefs.length ) {
    console.log( `✓ Found ${ briefs.length} brief${briefs.length > 1 ? 's' : ''}` );    
  } else {
    console.log( '[RUNNER] No briefs found' );
  }

  for( const brief of briefs ) {
    // Here we go!
    console.log( `→ Processing: ${brief}` );

    // Setup context/state
    // Gets passed to each step
    const context = {
      briefPath: `./input/briefs/${brief}`,
      assetsPath: './input/products',
      outputPath: './output',
      campaign: null,
      missingAssets: [],
      generatedAssets: [],
      reusedAssets: [],
      missingHeroAsset: null,
      generatedHeroAsset: null,
      reusedHeroAsset: null,      
      outputs: [],
      errors: [],
      warnings: []
    };

    // Process brief
    for( const step of steps ) {
      await step( context );

      // Errors in this step
      // Stop processing this brief
      if( context.errors.length ) {
        break;
      }
    }    

    // Push error to higher scope
    if( context.errors.length ) {
      errors.push( {
        brief,
        errors: [... context.errors]
      } );
    }

    // Push warnings to higher scope
    if( context.warnings.length ) {
      warnings.push( {
        brief,
        warnings: [... context.warnings]
      } );
    }    
  }

  // Report errors per brief
  if( errors.length ) {
    console.log( '\nErrors:' );    

    for( const entry of errors ) {
      console.log( `[BRIEF] ${entry.brief}` );      

      for( const error of entry.errors ) {
        console.log( `- ${error}` );
      }
    }
  }
  
  // Report warnings per brief
  if( warnings.length ) {
    console.log( '\nWarnings:' );    

    for( const entry of warnings ) {
      console.log( `[BRIEF] ${entry.brief}` );      

      for( const warning of entry.warnings ) {
        console.log( `- ${warning}` );
      }
    }
  }  

  // For automation
  if( errors.length ) {
    process.exitCode = 1;
  }  
}

// Alternative web view
if( Bun.argv.includes( '--serve' ) ) {
  const server = Bun.serve( {
    port: 3000,
    async fetch( req ) {
      const url = new URL( req.url );
      const pathname = url.pathname;

      // API
      if( pathname.startsWith( '/api/' ) ) {
        if( pathname === '/api/report' && req.method === 'GET' ) {
          const reports = await readdir( './output' );
          return Response.json( reports.filter( ( item ) => item.endsWith( '.json' ) ) );
        }

        return new Response( 'Not Found', {status: 404} );
      }

      // Serve output files
      if( pathname.startsWith( '/output/' ) ) {
        const relativePath = pathname.replace( '/output/', '' );
        const file = Bun.file( `./output/${relativePath}` );
        if( await file.exists() ) {
          return new Response( file );
        }

        return new Response( 'Not Found', {status: 404} );
      }      

      // Static
      let filePath = pathname === '/' ? '/index.html' : pathname;
      const file = Bun.file( `public${filePath}` );
      if( await file.exists() ) {
        return new Response( file );
      }

      // Fallback
      return new Response( Bun.file( './public/index.html' ) );
    }
  } );

  console.log( `→ Server running at ${server.url}` );  
}

// Main CLI process
await main();
