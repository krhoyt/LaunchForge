export default class LaunchForgeAssetCard extends HTMLElement {
  constructor() {
    super();

    const template = document.createElement( 'template' );
    template.innerHTML = /* template */ `
      <style>
        :host {
          border: solid 1px lightgrey;
          border-radius: 12px;
          box-sizing: border-box;
          display: flex;
          flex-direction: row;
          gap: 16px;
          padding: 16px;
          position: relative;
          width: 100%;
        }

        a {
          align-items: center;
          align-self: flex-end;
          border: solid 1px lightgrey;
          border-radius: 6px;
          color: purple;
          display: flex;
          flex-direction: row;
          font-weight: 600;
          gap: 8px;
          line-height: 24px;
          margin-top: auto;
          padding: 8px 16px 8px 16px;
          text-decoration: none;
          transition: background 300ms ease;
          -moz-osx-font-smoothing: grayscale;            
          -webkit-font-smoothing: antialiased;   
          -webkit-tap-highlight-color: transparent;                           
        }

        a:hover {
          background: color-mix( in srgb, purple 25%, transparent );
        }

        div {
          display: flex;
          flex-basis: 0;
          flex-direction: column;
          flex-grow: 1;
        }

        h3 {
          font-size: 16px;
          font-weight: 600;
          line-height: 24px;
          margin: 0;
          padding: 0;
          -moz-osx-font-smoothing: grayscale;            
          -webkit-font-smoothing: antialiased;          
        }

        img {
          border-radius: 6px;
          height: 160px;
        }

        p {
          line-height: 24px;
          margin: 0;
          padding: 0;
          -moz-osx-font-smoothing: grayscale;            
          -webkit-font-smoothing: antialiased;          
        }

        p[part=dimensions] {
          color: grey;
        }

        p[part=ratio] {
          align-self: flex-start;
          background: color-mix( in srgb, purple 25%, transparent );
          border-radius: 16px;
          color: purple;
          font-weight: 600;
          margin: 0 0 8px 0;
          padding: 4px 12px 4px 12px;
        }
      </style>
      <img />
      <div>      
        <h3></h3>
        <p part="ratio"></p>
        <p part="dimensions"></p>
        <a href="" download>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><g fill="currentColor"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/></g></svg>        
          <span>Download</span>
        </a>
      </div>
    `;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$dimensions = this.shadowRoot.querySelector( 'p[part=dimensions]' );        
    this.$download = this.shadowRoot.querySelector( 'a' );
    this.$header = this.shadowRoot.querySelector( 'h3' );
    this.$image = this.shadowRoot.querySelector( 'img' );    
    this.$ratio = this.shadowRoot.querySelector( 'p[part=ratio]' );
  }
  
  // When attributes change
  _render() {
    this.$image.alt = this.header === null ? '' : this.header;
    this.$image.src = this.source === null ? '' : this.source;
    this.$header.innerText = this.header === null ? '' : this.header;        
    this.$ratio.innerText = this.ratio === null ? '' : this.ratio;
    this.$dimensions.innerText = this.dimensions === null ? '' : this.dimensions;
    this.$download.href = this.source === null ? '' : this.source;
  }

  // Promote properties
  // Values may be set before module load
  _upgrade( property ) {
    if( this.hasOwnProperty( property ) ) {
      const value = this[property];
      delete this[property];
      this[property] = value;
    }
  }

  // Setup
  connectedCallback() {
    this._upgrade( 'dimensions' );                 
    this._upgrade( 'header' );     
    this._upgrade( 'ratio' );
    this._upgrade( 'source' );    
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'dimensions',
      'header',
      'ratio',
      'source'
    ];
  }

  // Observed attribute has changed
  // Update render
  attributeChangedCallback( name, old, value ) {
    this._render();
  } 

  // Attributes
  // Reflected
  // Boolean, Float, Integer, String, null
  get dimensions() {
    if( this.hasAttribute( 'dimensions' ) ) {
      return this.getAttribute( 'dimensions' );
    }

    return null;
  }

  set dimensions( value ) {
    if( value !== null ) {
      this.setAttribute( 'dimensions', value );
    } else {
      this.removeAttribute( 'dimensions' );
    }
  }

  get header() {
    if( this.hasAttribute( 'header' ) ) {
      return this.getAttribute( 'header' );
    }

    return null;
  }

  set header( value ) {
    if( value !== null ) {
      this.setAttribute( 'header', value );
    } else {
      this.removeAttribute( 'header' );
    }
  }

  get ratio() {
    if( this.hasAttribute( 'ratio' ) ) {
      return this.getAttribute( 'ratio' );
    }

    return null;
  }

  set ratio( value ) {
    if( value !== null ) {
      this.setAttribute( 'ratio', value );
    } else {
      this.removeAttribute( 'ratio' );
    }
  }
  
  get source() {
    if( this.hasAttribute( 'source' ) ) {
      return this.getAttribute( 'source' );
    }

    return null;
  }

  set source( value ) {
    if( value !== null ) {
      this.setAttribute( 'source', value );
    } else {
      this.removeAttribute( 'source' );
    }
  }  
}

window.customElements.define( 'lf-asset-card', LaunchForgeAssetCard );
