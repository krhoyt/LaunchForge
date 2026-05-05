export default class LaunchForgeResultCard extends HTMLElement {
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

        div {
          display: flex;
          flex-direction: column;
          gap: 8px;
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

        p {
          margin: 0;
          padding: 0;
          -moz-osx-font-smoothing: grayscale;            
          -webkit-font-smoothing: antialiased;          
        }

        p[part=label] {
          font-size: 28px;
          font-weight: 600;
          line-height: 32px;
        }

        p[part=footer] {
          color: grey;
        }

        ::slotted( svg ) {
          color: purple;
          height: 32px;
          width: 24px;          
        }
      </style>
      <slot></slot>
      <div>      
        <h3 part="header"></h3>
        <p part="label"></p>
        <p part="footer"></p>
      </div>
    `;

    // Root
    this.attachShadow( {mode: 'open'} );
    this.shadowRoot.appendChild( template.content.cloneNode( true ) );

    // Elements
    this.$footer = this.shadowRoot.querySelector( 'p[part=footer]' );    
    this.$header = this.shadowRoot.querySelector( 'h3' );
    this.$label = this.shadowRoot.querySelector( 'p[part=label]' );    
  }
  
  // When attributes change
  _render() {
    this.$header.innerText = this.header === null ? '' : this.header;        
    this.$label.innerText = this.label === null ? '' : this.label;            
    this.$footer.innerText = this.footer === null ? '' : this.footer;
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
    this._upgrade( 'footer' );      
    this._upgrade( 'header' );
    this._upgrade( 'label' );        
    this._render();
  }

  // Watched attributes
  static get observedAttributes() {
    return [
      'footer',
      'header',
      'label'
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
  get footer() {
    if( this.hasAttribute( 'footer' ) ) {
      return this.getAttribute( 'footer' );
    }

    return null;
  }

  set footer( value ) {
    if( value !== null ) {
      this.setAttribute( 'footer', value );
    } else {
      this.removeAttribute( 'footer' );
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
  
  get label() {
    if( this.hasAttribute( 'label' ) ) {
      return this.getAttribute( 'label' );
    }

    return null;
  }

  set label( value ) {
    if( value !== null ) {
      this.setAttribute( 'label', value );
    } else {
      this.removeAttribute( 'label' );
    }
  }  
}

window.customElements.define( 'lf-result-card', LaunchForgeResultCard );
