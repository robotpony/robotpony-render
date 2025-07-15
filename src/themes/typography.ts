/**
 * Typography system for enhanced text rendering
 */

export interface FontDefinition {
  family: string;
  fallbacks: string[];
  webFontUrl?: string;
  weights: number[];
  styles: ('normal' | 'italic')[];
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  fontStyle?: string;
  lineHeight?: number;
  letterSpacing?: number;
  textAnchor?: 'start' | 'middle' | 'end';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  textShadow?: TextShadow[];
  textOutline?: TextOutline;
  backgroundColor?: string;
  backgroundPadding?: number;
  backgroundRadius?: number;
}

export interface TextShadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
  opacity?: number;
}

export interface TextOutline {
  width: number;
  color: string;
  opacity?: number;
}

export interface TypographyScale {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  body: TextStyle;
  caption: TextStyle;
  label: TextStyle;
  emphasis: TextStyle;
}

// Comic-appropriate font definitions
export const comicFonts: Record<string, FontDefinition> = {
  'comic-title': {
    family: 'Blambot Casual',
    fallbacks: ['Comic Sans MS', 'Marker Felt', 'Chalkduster', 'cursive'],
    webFontUrl: 'https://fonts.googleapis.com/css2?family=Creepster&family=Griffy:wght@400&display=swap',
    weights: [400, 700],
    styles: ['normal']
  },
  'comic-body': {
    family: 'Griffy',
    fallbacks: ['Comic Sans MS', 'Chalkboard', 'fantasy'],
    webFontUrl: 'https://fonts.googleapis.com/css2?family=Griffy:wght@400&display=swap',
    weights: [400],
    styles: ['normal']
  },
  'comic-mono': {
    family: 'Courier Prime',
    fallbacks: ['Courier New', 'Monaco', 'Consolas', 'monospace'],
    webFontUrl: 'https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap',
    weights: [400, 700],
    styles: ['normal', 'italic']
  },
  'vintage-serif': {
    family: 'Playfair Display',
    fallbacks: ['Times New Roman', 'serif'],
    webFontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap',
    weights: [400, 700, 900],
    styles: ['normal']
  },
  'pixelated': {
    family: 'Courier New',
    fallbacks: ['Monaco', 'Consolas', 'Lucida Console', 'monospace'],
    weights: [400, 700],
    styles: ['normal']
  }
};

// Create font family strings with fallbacks
export function buildFontFamily(fontKey: string): string {
  const font = comicFonts[fontKey];
  if (!font) return 'Arial, sans-serif';
  
  const families = [font.family, ...font.fallbacks];
  return families.map(f => f.includes(' ') ? `"${f}"` : f).join(', ');
}

// Typography scales for different themes
export const robotponyTypography: TypographyScale = {
  h1: {
    fontFamily: buildFontFamily('pixelated'),
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: 1,
    textAnchor: 'middle',
    fill: '#2F2F2F',
    textShadow: [
      { offsetX: 2, offsetY: 2, blur: 0, color: '#ffffff', opacity: 0.8 },
      { offsetX: 3, offsetY: 3, blur: 2, color: '#000000', opacity: 0.3 }
    ],
    textOutline: {
      width: 1,
      color: '#2c3e50',
      opacity: 0.7
    }
  },
  h2: {
    fontFamily: buildFontFamily('pixelated'),
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: 1,
    textAnchor: 'middle',
    fill: '#2F2F2F',
    textShadow: [
      { offsetX: 1, offsetY: 1, blur: 0, color: '#ffffff', opacity: 0.8 }
    ]
  },
  h3: {
    fontFamily: buildFontFamily('pixelated'),
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.4,
    letterSpacing: 1,
    textAnchor: 'middle',
    fill: '#2F2F2F'
  },
  body: {
    fontFamily: buildFontFamily('pixelated'),
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1.5,
    letterSpacing: 1,
    textAnchor: 'start',
    fill: '#2F2F2F'
  },
  caption: {
    fontFamily: buildFontFamily('comic-mono'),
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: 1,
    textAnchor: 'middle',
    fill: '#ffffff',
    backgroundColor: '#2c3e50',
    backgroundPadding: 4,
    backgroundRadius: 4,
    textShadow: [
      { offsetX: 1, offsetY: 1, blur: 0, color: '#000000', opacity: 0.3 }
    ]
  },
  label: {
    fontFamily: buildFontFamily('pixelated'),
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: 1,
    textAnchor: 'middle',
    fill: '#ffffff',
    textShadow: [
      { offsetX: 1, offsetY: 1, blur: 0, color: '#000000', opacity: 0.8 }
    ],
    textOutline: {
      width: 1,
      color: '#2c3e50',
      opacity: 0.9
    }
  },
  emphasis: {
    fontFamily: buildFontFamily('comic-title'),
    fontSize: 20,
    fontWeight: 900,
    lineHeight: 1.1,
    letterSpacing: 3,
    textAnchor: 'middle',
    fill: '#d4c5a9',
    textShadow: [
      { offsetX: 3, offsetY: 3, blur: 0, color: '#2c3e50', opacity: 1 },
      { offsetX: 2, offsetY: 2, blur: 4, color: '#000000', opacity: 0.5 }
    ],
    textOutline: {
      width: 3,
      color: '#2c3e50',
      opacity: 1
    }
  }
};

export const defaultTypography: TypographyScale = {
  h1: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 20,
    fontWeight: 'bold',
    textAnchor: 'middle',
    fill: '#333333'
  },
  h2: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 18,
    fontWeight: 'bold',
    textAnchor: 'middle',
    fill: '#333333'
  },
  h3: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 16,
    fontWeight: 'bold',
    textAnchor: 'middle',
    fill: '#333333'
  },
  body: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 14,
    fontWeight: 'normal',
    textAnchor: 'start',
    fill: '#333333'
  },
  caption: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 11,
    fontWeight: 'bold',
    textAnchor: 'middle',
    fill: '#ffffff',
    backgroundColor: '#666666',
    backgroundPadding: 4,
    backgroundRadius: 4
  },
  label: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 14,
    fontWeight: 'normal',
    textAnchor: 'middle',
    fill: '#333333'
  },
  emphasis: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 16,
    fontWeight: 'bold',
    textAnchor: 'middle',
    fill: '#333333'
  }
};

/**
 * Convert TextStyle to SVG style string
 */
export function textStyleToSVG(style: TextStyle): string {
  const styles: string[] = [];
  
  if (style.fontFamily) styles.push(`font-family: ${style.fontFamily}`);
  if (style.fontSize) styles.push(`font-size: ${style.fontSize}px`);
  if (style.fontWeight) styles.push(`font-weight: ${style.fontWeight}`);
  if (style.fontStyle) styles.push(`font-style: ${style.fontStyle}`);
  if (style.letterSpacing) styles.push(`letter-spacing: ${style.letterSpacing}px`);
  if (style.textAnchor) styles.push(`text-anchor: ${style.textAnchor}`);
  if (style.fill) styles.push(`fill: ${style.fill}`);
  if (style.stroke) styles.push(`stroke: ${style.stroke}`);
  if (style.strokeWidth) styles.push(`stroke-width: ${style.strokeWidth}`);
  
  return styles.join('; ');
}

/**
 * Generate SVG defs for text effects
 */
export function generateTextEffectDefs(typography: TypographyScale): string {
  let defs = '';
  
  // Generate filters for text shadows and outlines
  Object.entries(typography).forEach(([key, style]) => {
    if (style.textShadow && style.textShadow.length > 0) {
      defs += `
        <filter id="text-shadow-${key}" x="-50%" y="-50%" width="200%" height="200%">
          ${style.textShadow.map((shadow: TextShadow, i: number) => `
            <feDropShadow dx="${shadow.offsetX}" dy="${shadow.offsetY}" 
                         stdDeviation="${shadow.blur}" flood-color="${shadow.color}" 
                         flood-opacity="${shadow.opacity || 1}" result="shadow${i}"/>
          `).join('')}
        </filter>
      `;
    }
    
    if (style.textOutline) {
      defs += `
        <filter id="text-outline-${key}" x="-50%" y="-50%" width="200%" height="200%">
          <feMorphology operator="dilate" radius="${style.textOutline.width}"/>
          <feFlood flood-color="${style.textOutline.color}" flood-opacity="${style.textOutline.opacity || 1}"/>
          <feComposite in="SourceGraphic"/>
        </filter>
      `;
    }
  });
  
  return defs;
}

/**
 * Calculate responsive font size based on canvas size and content
 */
export function getResponsiveFontSize(baseSize: number, canvasWidth: number, contentLength: number): number {
  const scaleFactor = Math.min(canvasWidth / 800, 1.5); // Base on 800px width
  const lengthFactor = Math.max(0.7, 1 - (contentLength / 50) * 0.3); // Scale down for long content
  return Math.round(baseSize * scaleFactor * lengthFactor);
}

/**
 * Calculate text bounding box for collision detection
 */
export function calculateTextBounds(text: string, style: TextStyle, x: number, y: number): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  // Approximate text metrics (in real implementation, would use canvas measureText)
  const charWidth = style.fontSize ? style.fontSize * 0.6 : 8.4;
  const lineHeight = style.fontSize ? style.fontSize * (style.lineHeight || 1.2) : 16.8;
  
  const lines = text.split('\n');
  const maxLineLength = Math.max(...lines.map(line => line.length));
  const width = maxLineLength * charWidth;
  const height = lines.length * lineHeight;
  
  // Adjust for text anchor
  let adjustedX = x;
  if (style.textAnchor === 'middle') {
    adjustedX = x - width / 2;
  } else if (style.textAnchor === 'end') {
    adjustedX = x - width;
  }
  
  return {
    x: adjustedX,
    y: y - height / 2,
    width,
    height
  };
}