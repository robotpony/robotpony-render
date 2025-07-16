/**
 * Text rendering utilities for SVG generation with pixelated effects
 */

export interface SimpleTextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  textAnchor?: 'start' | 'middle' | 'end';
  fill?: string;
  class?: string;
  pixelated?: boolean;
  letterSpacing?: number;
  shadow?: boolean;
  outline?: boolean;
}

/**
 * Render text element for SVG with optional pixelated effects
 */
export function renderText(
  text: string,
  x: number,
  y: number,
  style: SimpleTextStyle = {}
): string {
  if (style.pixelated) {
    return renderPixelatedText(text, x, y, style);
  }
  
  const attributes: string[] = [];
  
  attributes.push(`x="${x}"`);
  attributes.push(`y="${y}"`);
  
  if (style.class) attributes.push(`class="${style.class}"`);
  if (style.fontFamily) attributes.push(`font-family="${style.fontFamily}"`);
  if (style.fontSize) attributes.push(`font-size="${style.fontSize}px"`);
  if (style.fontWeight) attributes.push(`font-weight="${style.fontWeight}"`);
  if (style.textAnchor) attributes.push(`text-anchor="${style.textAnchor}"`);
  if (style.letterSpacing) attributes.push(`letter-spacing="${style.letterSpacing}px"`);
  if (style.fill) attributes.push(`fill="${style.fill}"`);
  
  return `<text ${attributes.join(' ')}>${escapeXml(text)}</text>`;
}

/**
 * Render multi-line text with proper line spacing
 */
export function renderMultilineText(
  text: string,
  x: number,
  y: number,
  style: SimpleTextStyle = {},
  lineHeight: number = 18
): string {
  const lines = text.split('\n');
  
  if (lines.length === 1) {
    return renderText(text, x, y, style);
  }
  
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  let svg = `<g${style.class ? ` class="${style.class}"` : ''}>`;
  
  lines.forEach((line, index) => {
    const lineY = startY + (index * lineHeight);
    svg += renderText(line, x, lineY, { ...style, class: undefined });
  });
  
  svg += '</g>';
  return svg;
}

/**
 * Render pixelated text with retro aesthetic
 */
export function renderPixelatedText(
  text: string,
  x: number,
  y: number,
  style: SimpleTextStyle = {}
): string {
  const fontSize = style.fontSize || 14;
  const fontFamily = style.fontFamily || 'Courier New, monospace';
  const fontWeight = style.fontWeight || 700;
  const letterSpacing = style.letterSpacing || 2;
  const fill = style.fill || '#000000';
  const textAnchor = style.textAnchor || 'middle';
  
  let result = '<g class="pixelated-text">';
  
  // Shadow layer for depth
  if (style.shadow !== false) {
    result += `<text x="${x + 1}" y="${y + 1}" 
      font-family="${fontFamily}" 
      font-size="${fontSize}px" 
      font-weight="${fontWeight}"
      letter-spacing="${letterSpacing}px"
      text-anchor="${textAnchor}"
      fill="#000000" 
      opacity="0.6"
      style="image-rendering: pixelated; shape-rendering: crispEdges;">${escapeXml(text)}</text>`;
  }
  
  // Main text
  result += `<text x="${x}" y="${y}" 
    font-family="${fontFamily}" 
    font-size="${fontSize}px" 
    font-weight="${fontWeight}"
    letter-spacing="${letterSpacing}px"
    text-anchor="${textAnchor}"
    fill="${fill}"
    style="image-rendering: pixelated; shape-rendering: crispEdges;">${escapeXml(text)}</text>`;
  
  // Highlight layer for vintage effect
  if (style.outline !== false) {
    result += `<text x="${x - 1}" y="${y - 1}" 
      font-family="${fontFamily}" 
      font-size="${fontSize}px" 
      font-weight="${fontWeight}"
      letter-spacing="${letterSpacing}px"
      text-anchor="${textAnchor}"
      fill="#ffffff" 
      opacity="0.4"
      style="image-rendering: pixelated; shape-rendering: crispEdges;">${escapeXml(text)}</text>`;
  }
  
  result += '</g>';
  return result;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}