/**
 * Simple text rendering utilities for SVG generation
 */

export interface SimpleTextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  textAnchor?: 'start' | 'middle' | 'end';
  fill?: string;
  class?: string;
}

/**
 * Render simple text element for SVG
 */
export function renderText(
  text: string,
  x: number,
  y: number,
  style: SimpleTextStyle = {}
): string {
  const attributes: string[] = [];
  
  attributes.push(`x="${x}"`);
  attributes.push(`y="${y}"`);
  
  if (style.class) attributes.push(`class="${style.class}"`);
  if (style.fontFamily) attributes.push(`font-family="${style.fontFamily}"`);
  if (style.fontSize) attributes.push(`font-size="${style.fontSize}px"`);
  if (style.fontWeight) attributes.push(`font-weight="${style.fontWeight}"`);
  if (style.textAnchor) attributes.push(`text-anchor="${style.textAnchor}"`);
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