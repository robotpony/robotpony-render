/**
 * Accessibility and readability utilities for text rendering
 */

export interface ContrastResult {
  ratio: number;
  level: 'AAA' | 'AA' | 'A' | 'FAIL';
  passes: boolean;
}

export interface AccessibilityOptions {
  highContrast?: boolean;
  largeText?: boolean;
  reducedMotion?: boolean;
  screenReaderOptimized?: boolean;
}

/**
 * Calculate color contrast ratio between foreground and background
 */
export function calculateContrastRatio(foreground: string, background: string): ContrastResult {
  const fgLuminance = getLuminance(foreground);
  const bgLuminance = getLuminance(background);
  
  const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                (Math.min(fgLuminance, bgLuminance) + 0.05);
  
  let level: 'AAA' | 'AA' | 'A' | 'FAIL';
  let passes = false;
  
  if (ratio >= 7) {
    level = 'AAA';
    passes = true;
  } else if (ratio >= 4.5) {
    level = 'AA';
    passes = true;
  } else if (ratio >= 3) {
    level = 'A';
    passes = false; // A is not sufficient for web content
  } else {
    level = 'FAIL';
    passes = false;
  }
  
  return { ratio, level, passes };
}

/**
 * Get relative luminance of a color
 */
function getLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Find accessible text color for given background
 */
export function getAccessibleTextColor(backgroundColor: string, preferDark: boolean = true): string {
  const darkContrast = calculateContrastRatio('#000000', backgroundColor);
  const lightContrast = calculateContrastRatio('#ffffff', backgroundColor);
  
  if (preferDark && darkContrast.passes) {
    return '#000000';
  } else if (lightContrast.passes) {
    return '#ffffff';
  } else if (darkContrast.ratio > lightContrast.ratio) {
    return '#000000';
  } else {
    return '#ffffff';
  }
}

/**
 * Adjust colors for high contrast mode
 */
export function applyHighContrastMode(foreground: string, background: string): {
  foreground: string;
  background: string;
} {
  const contrast = calculateContrastRatio(foreground, background);
  
  if (contrast.passes) {
    return { foreground, background };
  }
  
  // Force high contrast colors
  const bgLuminance = getLuminance(background);
  
  if (bgLuminance > 0.5) {
    // Light background, use dark text
    return { foreground: '#000000', background: '#ffffff' };
  } else {
    // Dark background, use light text
    return { foreground: '#ffffff', background: '#000000' };
  }
}

/**
 * Generate screen reader friendly attributes
 */
export function getScreenReaderAttributes(text: string, role?: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  
  // Add role if specified
  if (role) {
    attributes.role = role;
  }
  
  // Add aria-label for complex text
  if (text.length > 50 || /[^a-zA-Z0-9\s]/.test(text)) {
    attributes['aria-label'] = simplifyTextForScreenReader(text);
  }
  
  // Mark decorative elements
  if (isDecorativeText(text)) {
    attributes['aria-hidden'] = 'true';
  }
  
  // Add description for acronyms/abbreviations
  const acronyms = detectAcronyms(text);
  if (acronyms.length > 0) {
    attributes['aria-describedby'] = `acronym-descriptions-${Date.now()}`;
  }
  
  return attributes;
}

/**
 * Simplify text for screen readers
 */
function simplifyTextForScreenReader(text: string): string {
  return text
    .replace(/[^\w\s]/g, ' ') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Check if text is decorative (not meaningful for screen readers)
 */
function isDecorativeText(text: string): boolean {
  const decorativePatterns = [
    /^[•\-=_*]+$/, // Bullets, dashes, decorative lines
    /^[0-9\-/\\|]+$/, // Pure numbers/symbols
    /^\s*$/ // Whitespace only
  ];
  
  return decorativePatterns.some(pattern => pattern.test(text));
}

/**
 * Detect acronyms in text
 */
function detectAcronyms(text: string): string[] {
  const acronymPattern = /\b[A-Z]{2,}\b/g;
  return text.match(acronymPattern) || [];
}

/**
 * Validate text readability
 */
export function validateTextReadability(text: string, fontSize: number): {
  score: number;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;
  
  // Check font size
  if (fontSize < 12) {
    issues.push('Font size too small');
    recommendations.push('Increase font size to at least 12px');
    score -= 20;
  }
  
  // Check text length
  if (text.length > 60) {
    issues.push('Text too long for single line');
    recommendations.push('Consider breaking into multiple lines');
    score -= 10;
  }
  
  // Check for all caps
  if (text === text.toUpperCase() && text.length > 10) {
    issues.push('Excessive use of capital letters');
    recommendations.push('Use mixed case for better readability');
    score -= 15;
  }
  
  // Check for special characters
  const specialCharCount = (text.match(/[^\w\s]/g) || []).length;
  if (specialCharCount / text.length > 0.3) {
    issues.push('Too many special characters');
    recommendations.push('Simplify text formatting');
    score -= 10;
  }
  
  return { score: Math.max(0, score), issues, recommendations };
}

/**
 * Apply accessibility enhancements to text style
 */
export function enhanceTextAccessibility(
  style: any, 
  options: AccessibilityOptions = {}
): any {
  const enhanced = { ...style };
  
  if (options.highContrast) {
    const colors = applyHighContrastMode(style.fill || '#000000', style.backgroundColor || '#ffffff');
    enhanced.fill = colors.foreground;
    if (enhanced.backgroundColor) {
      enhanced.backgroundColor = colors.background;
    }
  }
  
  if (options.largeText) {
    enhanced.fontSize = Math.max(enhanced.fontSize || 14, 16);
    enhanced.lineHeight = Math.max(enhanced.lineHeight || 1.2, 1.5);
  }
  
  if (options.reducedMotion) {
    // Remove animation-related properties
    delete enhanced.textShadow;
    enhanced.opacity = 1; // Ensure full opacity
  }
  
  if (options.screenReaderOptimized) {
    // Ensure sufficient contrast
    const contrast = calculateContrastRatio(
      enhanced.fill || '#000000',
      enhanced.backgroundColor || '#ffffff'
    );
    
    if (!contrast.passes) {
      enhanced.fill = getAccessibleTextColor(enhanced.backgroundColor || '#ffffff');
    }
  }
  
  return enhanced;
}

/**
 * Generate accessibility report for text elements
 */
export function generateAccessibilityReport(elements: Array<{
  text: string;
  style: any;
}>): {
  overall: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  issues: Array<{
    element: number;
    type: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
  }>;
  summary: {
    totalElements: number;
    accessibleElements: number;
    contrastIssues: number;
    sizeIssues: number;
  };
} {
  const issues: any[] = [];
  let accessibleElements = 0;
  let contrastIssues = 0;
  let sizeIssues = 0;
  
  elements.forEach((element, index) => {
    const { text, style } = element;
    let elementAccessible = true;
    
    // Check contrast
    if (style.fill && style.backgroundColor) {
      const contrast = calculateContrastRatio(style.fill, style.backgroundColor);
      if (!contrast.passes) {
        issues.push({
          element: index,
          type: 'contrast',
          severity: 'high' as const,
          description: `Insufficient color contrast (${contrast.ratio.toFixed(1)}:1)`,
          recommendation: `Increase contrast to at least 4.5:1 for AA compliance`
        });
        contrastIssues++;
        elementAccessible = false;
      }
    }
    
    // Check font size
    if (style.fontSize && style.fontSize < 12) {
      issues.push({
        element: index,
        type: 'size',
        severity: 'medium' as const,
        description: `Font size too small (${style.fontSize}px)`,
        recommendation: `Increase font size to at least 12px`
      });
      sizeIssues++;
      elementAccessible = false;
    }
    
    // Check readability
    const readability = validateTextReadability(text, style.fontSize || 14);
    if (readability.score < 70) {
      issues.push({
        element: index,
        type: 'readability',
        severity: 'medium' as const,
        description: `Poor readability score (${readability.score}/100)`,
        recommendation: readability.recommendations.join(', ')
      });
      elementAccessible = false;
    }
    
    if (elementAccessible) {
      accessibleElements++;
    }
  });
  
  const accessibilityRatio = accessibleElements / elements.length;
  let overall: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  
  if (accessibilityRatio >= 0.9) {
    overall = 'excellent';
  } else if (accessibilityRatio >= 0.7) {
    overall = 'good';
  } else if (accessibilityRatio >= 0.5) {
    overall = 'needs-improvement';
  } else {
    overall = 'poor';
  }
  
  return {
    overall,
    issues,
    summary: {
      totalElements: elements.length,
      accessibleElements,
      contrastIssues,
      sizeIssues
    }
  };
}