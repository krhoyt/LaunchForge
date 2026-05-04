export function slugify( value ) {
  return value
    .toLowerCase()
    .replace( /[^a-z0-9]+/g, '-' )    // Any sequence of characters that are not letters or numbers
    .replace( /(^-|-$)/g, '' );       // Clear hyphen at the beginning or the end    
}
