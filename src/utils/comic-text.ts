/**
 * Comic-style text features including speech bubbles, emphasis, and special effects
 */

import { TextStyle } from '../themes/typography';
import { TextElement, renderEnhancedText } from './text-renderer';

export interface SpeechBubble {
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  tailX?: number;
  tailY?: number;
  style?: 'speech' | 'thought' | 'shout' | 'whisper';
  textStyle?: TextStyle;
}

export interface ComicEmphasis {
  text: string;
  x: number;
  y: number;
  style: 'bold' | 'italic' | 'caps' | 'outline' | 'glow' | 'shadow';
  intensity?: number; // 1-10
  textStyle?: TextStyle;
}

/**
 * Render speech bubble with tail
 */
export function renderSpeechBubble(bubble: SpeechBubble): string {
  const {
    text,
    x,
    y,
    width = 120,
    height = 60,
    tailX = x + width / 2,
    tailY = y + height + 20,
    style = 'speech',
    textStyle
  } = bubble;

  let svg = '';
  
  // Generate bubble background
  const bubbleId = `bubble-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  switch (style) {
    case 'speech':
      svg += renderSpeechBubbleShape(x, y, width, height, tailX, tailY, bubbleId);
      break;
    case 'thought':
      svg += renderThoughtBubbleShape(x, y, width, height, tailX, tailY);
      break;
    case 'shout':
      svg += renderShoutBubbleShape(x, y, width, height, tailX, tailY, bubbleId);
      break;
    case 'whisper':
      svg += renderWhisperBubbleShape(x, y, width, height, tailX, tailY, bubbleId);
      break;
  }
  
  // Add text inside bubble
  const textElement: TextElement = {
    text: text.toUpperCase(), // Comic convention
    x: x + width / 2,
    y: y + height / 2,
    style: {
      fontFamily: '"Comic Sans MS", "Marker Felt", cursive',
      fontSize: Math.min(14, width / 8),
      fontWeight: 'bold',
      textAnchor: 'middle',
      fill: '#000000',
      letterSpacing: 1,
      ...textStyle
    },
    id: `${bubbleId}-text`,
    class: 'comic-bubble-text'
  };
  
  svg += renderEnhancedText(textElement);
  
  return svg;
}

/**
 * Render standard speech bubble shape
 */
function renderSpeechBubbleShape(x: number, y: number, width: number, height: number, tailX: number, tailY: number, id: string): string {
  const rx = 15;
  const ry = 15;
  
  // Main bubble
  let path = `M ${x + rx} ${y} `;
  path += `L ${x + width - rx} ${y} `;
  path += `Q ${x + width} ${y} ${x + width} ${y + ry} `;
  path += `L ${x + width} ${y + height - ry} `;
  path += `Q ${x + width} ${y + height} ${x + width - rx} ${y + height} `;
  
  // Tail connection point
  const tailConnectX = Math.max(x + rx, Math.min(x + width - rx, tailX));
  path += `L ${tailConnectX + 10} ${y + height} `;
  path += `L ${tailX} ${tailY} `;
  path += `L ${tailConnectX - 10} ${y + height} `;
  
  path += `L ${x + rx} ${y + height} `;
  path += `Q ${x} ${y + height} ${x} ${y + height - ry} `;
  path += `L ${x} ${y + ry} `;
  path += `Q ${x} ${y} ${x + rx} ${y} Z`;
  
  return `
    <path id="${id}" d="${path}" 
          fill="#ffffff" stroke="#000000" stroke-width="2" 
          filter="url(#comic-bubble-shadow)"/>
  `;
}

/**
 * Render thought bubble shape (cloud-like)
 */
function renderThoughtBubbleShape(x: number, y: number, width: number, height: number, tailX: number, tailY: number): string {
  let svg = '';
  
  // Main cloud shape using multiple circles
  const circles = [
    { cx: x + width * 0.2, cy: y + height * 0.3, r: height * 0.25 },
    { cx: x + width * 0.5, cy: y + height * 0.2, r: height * 0.3 },
    { cx: x + width * 0.8, cy: y + height * 0.3, r: height * 0.25 },
    { cx: x + width * 0.3, cy: y + height * 0.7, r: height * 0.3 },
    { cx: x + width * 0.7, cy: y + height * 0.7, r: height * 0.25 },
    { cx: x + width * 0.5, cy: y + height * 0.5, r: height * 0.2 }
  ];
  
  circles.forEach((circle) => {
    svg += `<circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" 
                    fill="#ffffff" stroke="#000000" stroke-width="1" 
                    opacity="0.9"/>`;
  });
  
  // Thought bubble tail (small circles leading to point)
  const steps = 3;
  for (let i = 0; i < steps; i++) {
    const factor = (i + 1) / steps;
    const bubbleX = x + width / 2 + (tailX - x - width / 2) * factor;
    const bubbleY = y + height + (tailY - y - height) * factor;
    const radius = 8 - i * 2;
    
    svg += `<circle cx="${bubbleX}" cy="${bubbleY}" r="${radius}" 
                    fill="#ffffff" stroke="#000000" stroke-width="1"/>`;
  }
  
  return svg;
}

/**
 * Render shout bubble shape (jagged/explosive)
 */
function renderShoutBubbleShape(x: number, y: number, width: number, height: number, tailX: number, tailY: number, id: string): string {
  const spikes = 12;
  const spikeHeight = 8;
  
  let path = '';
  
  // Create jagged perimeter
  for (let i = 0; i <= spikes; i++) {
    const angle = (i / spikes) * Math.PI * 2;
    const isSpike = i % 2 === 0;
    const radius = isSpike ? 
      Math.min(width, height) / 2 + spikeHeight : 
      Math.min(width, height) / 2;
    
    const pointX = x + width / 2 + Math.cos(angle) * radius;
    const pointY = y + height / 2 + Math.sin(angle) * radius;
    
    if (i === 0) {
      path += `M ${pointX} ${pointY} `;
    } else {
      path += `L ${pointX} ${pointY} `;
    }
  }
  
  path += 'Z';
  
  // Add tail
  const tailPath = `M ${x + width / 2} ${y + height / 2} L ${tailX} ${tailY}`;
  
  return `
    <path id="${id}" d="${path}" 
          fill="#ffffff" stroke="#000000" stroke-width="3" 
          filter="url(#comic-shout-shadow)"/>
    <path d="${tailPath}" stroke="#000000" stroke-width="3" fill="none"/>
  `;
}

/**
 * Render whisper bubble shape (dashed/soft)
 */
function renderWhisperBubbleShape(x: number, y: number, width: number, height: number, tailX: number, tailY: number, id: string): string {
  return renderSpeechBubbleShape(x, y, width, height, tailX, tailY, id).replace(
    'stroke-width="2"',
    'stroke-width="1" stroke-dasharray="5,3" opacity="0.8"'
  );
}

/**
 * Apply comic emphasis to text
 */
export function renderComicEmphasis(emphasis: ComicEmphasis): string {
  const { text, x, y, style, intensity = 5, textStyle } = emphasis;
  
  const enhancedStyle: TextStyle = {
    fontFamily: '"Impact", "Arial Black", sans-serif',
    fontSize: 16,
    fontWeight: 'bold',
    textAnchor: 'middle',
    fill: '#000000',
    ...textStyle
  };
  
  switch (style) {
    case 'bold':
      enhancedStyle.fontWeight = 900;
      enhancedStyle.fontSize = (enhancedStyle.fontSize || 16) * (1 + intensity / 10);
      break;
      
    case 'italic':
      enhancedStyle.fontStyle = 'italic';
      enhancedStyle.letterSpacing = 2;
      break;
      
    case 'caps':
      enhancedStyle.letterSpacing = 3;
      enhancedStyle.fontSize = (enhancedStyle.fontSize || 16) * 0.9;
      break;
      
    case 'outline':
      enhancedStyle.textOutline = {
        width: intensity / 2,
        color: '#000000',
        opacity: 0.8
      };
      enhancedStyle.fill = '#ffffff';
      break;
      
    case 'glow':
      enhancedStyle.textShadow = [
        { offsetX: 0, offsetY: 0, blur: intensity, color: '#ffff00', opacity: 0.8 },
        { offsetX: 0, offsetY: 0, blur: intensity * 2, color: '#ffff00', opacity: 0.4 }
      ];
      break;
      
    case 'shadow':
      enhancedStyle.textShadow = [
        { offsetX: intensity, offsetY: intensity, blur: 0, color: '#000000', opacity: 0.5 }
      ];
      break;
  }
  
  const textElement: TextElement = {
    text: style === 'caps' ? text.toUpperCase() : text,
    x,
    y,
    style: enhancedStyle,
    class: `comic-emphasis comic-${style}`
  };
  
  return renderEnhancedText(textElement);
}

/**
 * Generate onomatopoeia-style text effect (POW, BAM, etc.)
 */
export function renderOnomatopoeia(text: string, x: number, y: number, intensity: number = 8): string {
  const style: TextStyle = {
    fontFamily: '"Impact", "Arial Black", sans-serif',
    fontSize: 24 + intensity * 4,
    fontWeight: 900,
    textAnchor: 'middle',
    fill: '#ff0000',
    letterSpacing: 4,
    textOutline: {
      width: 3,
      color: '#000000',
      opacity: 1
    },
    textShadow: [
      { offsetX: 4, offsetY: 4, blur: 0, color: '#000000', opacity: 0.7 },
      { offsetX: 0, offsetY: 0, blur: 10, color: '#ffff00', opacity: 0.6 }
    ]
  };
  
  const textElement: TextElement = {
    text: text.toUpperCase(),
    x,
    y,
    style,
    class: 'onomatopoeia'
  };
  
  // Add burst background
  const burstSvg = renderBurstBackground(x, y, intensity * 10, '#ffff00');
  
  return burstSvg + renderEnhancedText(textElement);
}

/**
 * Generate burst/explosion background shape
 */
function renderBurstBackground(x: number, y: number, size: number, color: string): string {
  const spikes = 16;
  let path = '';
  
  for (let i = 0; i <= spikes; i++) {
    const angle = (i / spikes) * Math.PI * 2;
    const isLong = i % 2 === 0;
    const radius = isLong ? size : size * 0.6;
    
    const pointX = x + Math.cos(angle) * radius;
    const pointY = y + Math.sin(angle) * radius;
    
    if (i === 0) {
      path += `M ${pointX} ${pointY} `;
    } else {
      path += `L ${pointX} ${pointY} `;
    }
  }
  
  path += 'Z';
  
  return `
    <path d="${path}" fill="${color}" opacity="0.3" 
          stroke="#000000" stroke-width="2"/>
  `;
}

/**
 * Generate comic text filters and effects
 */
export function generateComicTextFilters(): string {
  return `
    <filter id="comic-bubble-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="3" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
    
    <filter id="comic-shout-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="4" dy="4" stdDeviation="3" flood-color="rgba(0,0,0,0.5)"/>
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="rgba(255,255,0,0.4)"/>
    </filter>
    
    <filter id="comic-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `;
}

/**
 * Detect comic-style text patterns and apply automatic formatting
 */
export function autoFormatComicText(text: string): { text: string; suggestions: string[] } {
  const suggestions: string[] = [];
  const formattedText = text;
  
  // Detect shouting (multiple exclamation marks)
  if (/[!]{2,}/.test(text)) {
    suggestions.push('Consider using shout bubble style for emphasized text');
  }
  
  // Detect whispering (text in parentheses)
  if (/\([^)]+\)/.test(text)) {
    suggestions.push('Consider using whisper bubble style for parenthetical text');
  }
  
  // Detect onomatopoeia patterns
  const onomatopoeiaPattern = /\b(POW|BAM|BOOM|CRASH|BANG|ZAP|WHACK|THUD|SLAM)\b/gi;
  if (onomatopoeiaPattern.test(text)) {
    suggestions.push('Onomatopoeia detected - consider using special effect styling');
  }
  
  // Auto-format all caps for emphasis
  if (text === text.toUpperCase() && text.length > 3) {
    suggestions.push('All caps detected - consider using emphasis styling');
  }
  
  return { text: formattedText, suggestions };
}