// Build ratios lookup
const RATIOS = {
  '1x1': {width: 1024, height: 1024},
  '9x16': {width: 1080, height: 1920},
  '16x9': {width: 1920, height: 1080}
};

const assets = document.querySelector( 'section div' );
const boxDeliverables = document.querySelector( '#deliverables' );
const boxFormats = document.querySelector( '#formats' );
const boxProducts = document.querySelector( '#products' );
const boxStatus = document.querySelector( '#status' );
const lnkArchive = document.querySelector( '#archive' );

// Load report file
async function loadReport( file ) {
  // Make archive available
  const archive = file.replace( 'json', 'tar.gz' ).replace( 'report', 'assets' );
  lnkArchive.href = `/output/${archive}`;

  return fetch( `/output/${file}` ).then( ( response ) => response.json() );
}

// Load available reports
async function loadReports() {
  return fetch( '/api/report' ).then( ( response ) => response.json() );
}

// Generate slug from product name
function slugify( value ) {
  return value
    .toLowerCase()
    .replace( /[^a-z0-9]+/g, '-' )    // Any sequence of characters that are not letters or numbers
    .replace( /(^-|-$)/g, '' );       // Clear hyphen at the beginning or the end    
}

// Main
// Populate report
async function main() {
  // Load respective data
  const reports = await loadReports();
  const report = await loadReport( reports[0] );

  console.log( report );

  // Expand outputs
  report.outputs = report.outputs.map( ( item ) => {
    // Find ratio
    let start = item.lastIndexOf( '/' ) + 1;
    let end = item.lastIndexOf( '.' );

    // Break down ratio parts
    let ratio = item.substring( start, end );
    const dimensions = `${RATIOS[ratio].width} x ${RATIOS[ratio].height}`;
    ratio = ratio.replace( 'x', ':' );

    // Return parts
    return {
      dimensions,
      ratio,
      source: item
    };
  } );

  // Expand products
  report.products = report.products.map( ( item ) => {
    // Match of file slug
    const slug = slugify( item );

    // Return parts
    return {
      header: item,
      assets: report.outputs.filter( ( value ) => value.source.indexOf( slug ) >= 0 )
    }
  } );

  // Report header

  // Products
  boxProducts.label = report.products.length;
  boxProducts.footer = report.products.map( ( item ) => item.header ).join( ', ' );

  // Formats
  const ratios = Object.keys( RATIOS );
  boxFormats.label = ratios.length;

  let formats = [];
  for( const ratio of ratios ) {
    const parts = ratio.split( 'x' );
    formats.push( `${parts[0]}:${parts[1]}` );
  }
  boxFormats.footer = formats.join( ', ' );

  // Deliverables
  boxDeliverables.label = report.outputs.length;

  // Status
  const completed = new Date( report.completedAt );
  const formatDate = new Intl.DateTimeFormat( navigator.language, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  } );
  const date = formatDate.format( completed );
  const formatTime = new Intl.DateTimeFormat( navigation.language, {
    hour: 'numeric', 
    minute: 'numeric', 
    hour12: true
  } );
  const time = formatTime.format( completed );      
  boxStatus.footer = `${date} at ${time}`;

  // Build assets display
  // Based on products
  for( const product of report.products ) {
    // List
    const list = document.createElement( 'ul' );
    list.classList.add( 'assets' );        
    list.classList.add( 'horizontal' );

    for( const asset of product.assets ) {
      // With item
      const item = document.createElement( 'li' );
      item.classList.add( 'grow' );

      // With asset card
      const card = document.createElement( 'lf-asset-card' );
      card.header = product.header;
      card.ratio = asset.ratio;
      card.dimensions = asset.dimensions;
      card.source = asset.source;

      item.appendChild( card );
      list.appendChild( item );        
    }

    assets.appendChild( list );      
  }

  console.log( report );
}

// Start
main();
