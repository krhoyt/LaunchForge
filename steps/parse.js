export async function parse( context ) {
  // JSON is syntactically valid
  // NOTE: Bun lazy reads files
  try {
    const file = Bun.file( context.briefPath, {type: 'application/json'} );
    context.campaign = await file.json();
    console.log( `✓ Valid brief JSON file` );
  } catch( e ) {
    context.errors.push( '[PARSE] Invalid JSON' );
    return context;
  }

  /*
   * Review structure 
   * Validation happens in own step
   */

  // Campaign
  if( typeof context.campaign.name !== 'string' ) {
    context.errors.push( '[PARSE] Campaign name must be a string' );
  } else {
    console.log( '✓ Campaign name is a string' );
  }

  // Market
  if( typeof context.campaign.market !== 'string' ) {
    context.errors.push( '[PARSE] Market must be a string' );
  } else {
    console.log( '✓ Market is a string' );
  }

  // Region
  if( typeof context.campaign.region !== 'string' ) {
    context.errors.push( '[PARSE] Region must be a string' );
  } else {
    console.log( '✓ Region is a string' );
  }
  
  // Audience
  if( typeof context.campaign.audience !== 'string' ) {
    context.errors.push( '[PARSE] Audience must be a string' );
  } else {
    console.log( '✓ Audience is a string' );
  }  

  // Message
  if( typeof context.campaign.audience !== 'string' ) {
    context.errors.push( '[PARSE] Message must be a string' );
  } else {
    console.log( '✓ Message is a string' );
  }    

  // Products
  if( !context.campaign.products ) {
    context.errors.push( '[PARSE] Products array is not present' );    
  } else if( !Array.isArray( context.campaign.products ) ) {
    context.errors.push( '[PARSE] Products must be an array' );
  } else {
    console.log( '✓ Products present and is an array' );

    // Deeper structural dive on products
    context.campaign.products.forEach( ( product, i ) => {
      // Products have names and are strings      
      if( !product.name ) {
        context.errors.push( `[PARSE] Product name ${i + 1} is not present` );        
      } else if( typeof product.name !== 'string' ) {
        context.errors.push( `[PARSE] Product name ${i + 1} must be a string` );
      }

      // Product asset is present in structure and is null or string
      if( 
        product.asset !== undefined &&
        product.asset !== null &&
        typeof product.asset !== 'string'
      ) {
        context.errors.push( `[PARSE] Product "${product.name}" asset must be a string or null` );
      }            
    } );
  }    

  // Hero asset
  if (
    context.campaign.heroAsset !== undefined &&
    context.campaign.heroAsset !== null &&
    typeof context.campaign.heroAsset !== 'string'
  ) {
    context.errors.push( '[PARSE] heroAsset must be a string or null' );
  }  

  return context;
}
