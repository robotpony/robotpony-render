/**
 * Enhanced text rendering utilities with effects and positioning
 */

import { TextStyle, TextShadow, TextOutline, calculateTextBounds } from '../themes/typography';

export interface TextElement {
  text: string;
  x: number;
  y: number;
  style: TextStyle;
  id?: string;
  class?: string;
}

export interface TextBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Render enhanced text with effects
 */
export function renderEnhancedText(element: TextElement): string {
  const { text, x, y, style, id, class: className } = element;
  let svg = '';
  
  // Generate background if specified
  if (style.backgroundColor) {
    const bounds = calculateTextBounds(text, style, x, y);
    const padding = style.backgroundPadding || 4;
    const radius = style.backgroundRadius || 0;
    
    svg += `<rect x="${bounds.x - padding}" y="${bounds.y - padding}" 
                  width="${bounds.width + padding * 2}" height="${bounds.height + padding * 2}"
                  fill="${style.backgroundColor}" rx="${radius}" ry="${radius}" opacity="0.9"/>`;
  }
  
  // Generate text outline if specified
  if (style.textOutline) {
    svg += renderTextOutline(text, x, y, style, style.textOutline, id, className);
  }
  
  // Generate main text
  const attributes = buildTextAttributes(style, id, className);
  const filters = buildTextFilters(style, id);
  
  svg += `<text x="${x}" y="${y}" ${attributes} ${filters}>${escapeXml(text)}</text>`;
  
  return svg;
}

/**
 * Render text with outline effect
 */
function renderTextOutline(text: string, x: number, y: number, style: TextStyle, outline: TextOutline, id?: string, className?: string): string {
  const outlineStyle = {
    ...style,
    fill: outline.color,
    stroke: outline.color,
    strokeWidth: outline.width,
    opacity: outline.opacity || 1
  };
  
  const attributes = buildTextAttributes(outlineStyle, id ? `${id}-outline` : undefined, className);
  return `<text x="${x}" y="${y}" ${attributes}>${escapeXml(text)}</text>`;
}

/**
 * Build SVG text attributes from style
 */
function buildTextAttributes(style: TextStyle, id?: string, className?: string): string {
  const attrs: string[] = [];
  
  if (id) attrs.push(`id="${id}"`);
  if (className) attrs.push(`class="${className}"`);
  if (style.fontFamily) attrs.push(`font-family="${style.fontFamily}"`);
  if (style.fontSize) attrs.push(`font-size="${style.fontSize}px"`);
  if (style.fontWeight) attrs.push(`font-weight="${style.fontWeight}"`);
  if (style.fontStyle) attrs.push(`font-style="${style.fontStyle}"`);
  if (style.textAnchor) attrs.push(`text-anchor="${style.textAnchor}"`);
  if (style.fill) attrs.push(`fill="${style.fill}"`);
  if (style.stroke) attrs.push(`stroke="${style.stroke}"`);
  if (style.strokeWidth) attrs.push(`stroke-width="${style.strokeWidth}"`);
  if (style.letterSpacing) attrs.push(`letter-spacing="${style.letterSpacing}px"`);
  
  return attrs.join(' ');
}

/**
 * Build filter attributes for text effects
 */
function buildTextFilters(style: TextStyle, id?: string): string {
  const filters: string[] = [];
  
  if (style.textShadow && style.textShadow.length > 0 && id) {
    filters.push(`filter="url(#text-shadow-${id})"`);
  }
  
  if (style.textOutline && id) {
    filters.push(`filter="url(#text-outline-${id})"`);
  }
  
  return filters.join(' ');
}

/**
 * Generate SVG filter definitions for text effects
 */
export function generateTextFilters(elements: TextElement[]): string {
  let defs = '';
  
  elements.forEach(element => {
    if (element.id && element.style.textShadow) {
      defs += generateShadowFilter(element.id, element.style.textShadow);
    }
    
    if (element.id && element.style.textOutline) {
      defs += generateOutlineFilter(element.id, element.style.textOutline);
    }
  });
  
  return defs;
}

/**
 * Generate shadow filter definition
 */
function generateShadowFilter(id: string, shadows: TextShadow[]): string {
  const shadowElements = shadows.map((shadow, i) => 
    `<feDropShadow dx="${shadow.offsetX}" dy="${shadow.offsetY}" 
                   stdDeviation="${shadow.blur}" flood-color="${shadow.color}" 
                   flood-opacity="${shadow.opacity || 1}" result="shadow${i}"/>`
  ).join('');
  
  return `
    <filter id="text-shadow-${id}" x="-50%" y="-50%" width="200%" height="200%">
      ${shadowElements}
    </filter>
  `;
}

/**
 * Generate outline filter definition
 */
function generateOutlineFilter(id: string, outline: TextOutline): string {
  return `
    <filter id="text-outline-${id}" x="-50%" y="-50%" width="200%" height="200%">
      <feMorphology operator="dilate" radius="${outline.width}"/>
      <feFlood flood-color="${outline.color}" flood-opacity="${outline.opacity || 1}"/>
      <feComposite in="SourceGraphic"/>
    </filter>
  `;
}

/**
 * Detect and handle text collisions
 */
export function resolveTextCollisions(elements: TextElement[]): TextElement[] {
  const resolved: TextElement[] = [];
  
  for (const element of elements) {
    let position = { x: element.x, y: element.y };
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const bounds = calculateTextBounds(element.text, element.style, position.x, position.y);
      const hasCollision = resolved.some(resolvedElement => {
        const resolvedBounds = calculateTextBounds(
          resolvedElement.text, 
          resolvedElement.style, 
          resolvedElement.x, 
          resolvedElement.y
        );
        return boundsOverlap(bounds, resolvedBounds);
      });
      
      if (!hasCollision) {
        break;
      }
      
      // Try different positions
      const angle = (attempts * Math.PI * 2) / 8; // 8 positions around the original
      const distance = 20 + attempts * 10;
      position = {
        x: element.x + Math.cos(angle) * distance,
        y: element.y + Math.sin(angle) * distance
      };
      
      attempts++;
    }
    
    resolved.push({
      ...element,
      x: position.x,
      y: position.y
    });
  }
  
  return resolved;
}

/**
 * Check if two bounding boxes overlap
 */
function boundsOverlap(a: TextBounds, b: TextBounds): boolean {
  return !(a.x + a.width < b.x || 
           b.x + b.width < a.x || 
           a.y + a.height < b.y || 
           b.y + b.height < a.y);
}

/**
 * Break long text into multiple lines
 */
export function breakText(text: string, maxWidth: number, style: TextStyle): string[] {
  if (!maxWidth || maxWidth <= 0) return [text];
  
  const charWidth = (style.fontSize || 14) * 0.6; // Approximate character width
  const maxCharsPerLine = Math.floor(maxWidth / charWidth);
  
  if (text.length <= maxCharsPerLine) {
    return [text];
  }
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Word is too long, break it
        lines.push(word.substring(0, maxCharsPerLine));
        currentLine = word.substring(maxCharsPerLine);
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

/**
 * Render multi-line text
 */
export function renderMultilineText(element: TextElement, maxWidth?: number): string {
  const lines = maxWidth ? 
    breakText(element.text, maxWidth, element.style) : 
    element.text.split('\n');
  
  if (lines.length === 1) {
    return renderEnhancedText(element);
  }
  
  const lineHeight = element.style.fontSize ? element.style.fontSize * (element.style.lineHeight || 1.2) : 16.8;
  const totalHeight = lines.length * lineHeight;
  const startY = element.y - (totalHeight / 2) + (lineHeight / 2);
  
  let svg = '';
  lines.forEach((line, index) => {
    const lineElement: TextElement = {
      ...element,
      text: line,
      y: startY + (index * lineHeight),
      id: element.id ? `${element.id}-line-${index}` : undefined
    };
    svg += renderEnhancedText(lineElement);
  });
  
  return svg;
}

/**
 * Generate web font CSS imports
 */
export function generateWebFontCSS(fontUrls: string[]): string {
  return fontUrls.map(url => `@import url('${url}');`).join('\n');
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

/**
 * Calculate accessible text color based on background
 */
export function getAccessibleTextColor(backgroundColor: string): string {
  // Simple luminance calculation
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
}