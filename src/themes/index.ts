/**
 * Theme definitions for graphinate
 */

import { TypographyScale, robotponyTypography, defaultTypography, textStyleToSVG } from './typography';

export interface Theme {
  name: string;
  description: string;
  typography: TypographyScale;
  styles: {
    chartTitle: string;
    setLabel: string;
    vennCircle: string;
    intersectionLabel: string;
    intersectionBadge: string;
    connectorLine: string;
    axisLine: string;
    axisLabel: string;
    plotLine: string;
    captionBox: string;
    captionText: string;
    captionConnector: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export const defaultTheme: Theme = {
  name: 'default',
  description: 'Basic styling with standard colors',
  typography: defaultTypography,
  styles: {
    chartTitle: textStyleToSVG(defaultTypography.h1),
    setLabel: textStyleToSVG(defaultTypography.label),
    vennCircle: 'fill: rgba(31, 119, 180, 0.3); stroke: rgba(31, 119, 180, 0.8); stroke-width: 2;',
    intersectionLabel: textStyleToSVG(defaultTypography.caption),
    intersectionBadge: 'fill: #666; stroke: #666; stroke-width: 1; rx: 4; ry: 4;',
    connectorLine: 'stroke: #666; stroke-width: 1; fill: none;',
    axisLine: 'stroke: #333; stroke-width: 2; fill: none;',
    axisLabel: textStyleToSVG(defaultTypography.body),
    plotLine: 'stroke: #333; stroke-width: 2; fill: none;',
    captionBox: 'fill: #666; stroke: #666; stroke-width: 1; rx: 4; ry: 4;',
    captionText: textStyleToSVG(defaultTypography.caption),
    captionConnector: 'stroke: #333; stroke-width: 1; fill: none;'
  },
  colors: {
    primary: '#3498db',
    secondary: '#e74c3c',
    accent: '#2ecc71',
    background: '#ffffff',
    text: '#333333'
  }
};

export const rpTheme: Theme = {
  name: 'rp',
  description: 'Clean, professional styling for technical documentation',
  typography: defaultTypography,
  styles: {
    chartTitle: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 24px; font-weight: 300; text-anchor: middle; fill: #2c3e50;',
    setLabel: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 16px; text-anchor: middle; fill: #34495e; font-weight: 500;',
    vennCircle: 'stroke-width: 3;',
    intersectionLabel: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 14px; text-anchor: middle; fill: #2c3e50; font-weight: 600;',
    intersectionBadge: 'fill: #34495e; stroke: #34495e; stroke-width: 2; rx: 6; ry: 6;',
    connectorLine: 'stroke: #34495e; stroke-width: 2; fill: none;',
    axisLine: 'stroke: #2c3e50; stroke-width: 2; fill: none;',
    axisLabel: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 14px; fill: #2c3e50; font-weight: 500;',
    plotLine: 'stroke: #2c3e50; stroke-width: 3; fill: none;',
    captionBox: 'fill: #34495e; stroke: #34495e; stroke-width: 2; rx: 6; ry: 6;',
    captionText: 'font-family: "Helvetica Neue", Arial, sans-serif; font-size: 12px; font-weight: 600; text-anchor: middle; fill: white;',
    captionConnector: 'stroke: #2c3e50; stroke-width: 2; fill: none;'
  },
  colors: {
    primary: '#3498db',
    secondary: '#e74c3c',
    accent: '#2ecc71',
    background: '#ffffff',
    text: '#2c3e50'
  }
};

export const robotponyTheme: Theme = {
  name: 'robotpony',
  description: 'Comic-style theme perfect for Robotpony.ca aesthetic with vintage textures and bold typography',
  typography: robotponyTypography,
  styles: {
    chartTitle: textStyleToSVG(robotponyTypography.h1),
    setLabel: textStyleToSVG(robotponyTypography.label),
    vennCircle: 'stroke-width: 2; opacity: 0.8;',
    intersectionLabel: textStyleToSVG(robotponyTypography.caption),
    intersectionBadge: 'fill: #2c3e50; stroke: #2c3e50; stroke-width: 2; rx: 8; ry: 8;',
    connectorLine: 'stroke: #2c3e50; stroke-width: 2; fill: none;',
    axisLine: 'stroke: #333; stroke-width: 2; fill: none;',
    axisLabel: textStyleToSVG(robotponyTypography.body),
    plotLine: 'stroke: #333; stroke-width: 2; fill: none;',
    captionBox: 'fill: #2c3e50; stroke: #2c3e50; stroke-width: 1; rx: 4; ry: 4;',
    captionText: textStyleToSVG(robotponyTypography.caption),
    captionConnector: 'stroke: #333; stroke-width: 1; fill: none;'
  },
  colors: {
    primary: '#8B2635', // dark red/burgundy (from comic left circle)
    secondary: '#2C2C2C', // black (from comic right circle)
    accent: '#F4D03F', // yellow (from comic intersection)
    background: '#ffffff', // white background
    text: '#333333'
  }
};

/**
 * Get theme by name
 */
export function getTheme(themeName: string): Theme {
  switch (themeName) {
    case 'rp':
      return rpTheme;
    case 'robotpony':
      return robotponyTheme;
    case 'default':
    default:
      return defaultTheme;
  }
}

/**
 * Get available theme names
 */
export function getAvailableThemes(): string[] {
  return ['default', 'rp', 'robotpony'];
}

/**
 * Convert theme to CSS string
 */
export function themeToCSS(theme: Theme): string {
  return `
    .chart-title { ${theme.styles.chartTitle} }
    .set-label { ${theme.styles.setLabel} }
    .venn-circle { ${theme.styles.vennCircle} }
    .intersection-label { ${theme.styles.intersectionLabel} }
    .intersection-badge { ${theme.styles.intersectionBadge} }
    .connector-line { ${theme.styles.connectorLine} }
    .axis-line { ${theme.styles.axisLine} }
    .axis-label { ${theme.styles.axisLabel} }
    .plot-line { ${theme.styles.plotLine} }
    .caption-box { ${theme.styles.captionBox} }
    .caption-text { ${theme.styles.captionText} }
    .caption-connector { ${theme.styles.captionConnector} }
    
    /* Typography classes */
    .text-h1 { ${textStyleToSVG(theme.typography.h1)} }
    .text-h2 { ${textStyleToSVG(theme.typography.h2)} }
    .text-h3 { ${textStyleToSVG(theme.typography.h3)} }
    .text-body { ${textStyleToSVG(theme.typography.body)} }
    .text-caption { ${textStyleToSVG(theme.typography.caption)} }
    .text-label { ${textStyleToSVG(theme.typography.label)} }
    .text-emphasis { ${textStyleToSVG(theme.typography.emphasis)} }
    
    /* Dynamic color classes */
    .venn-circle.set-a { fill: rgba(${hexToRgb(theme.colors.primary)}, 0.4); stroke: ${theme.colors.primary}; }
    .venn-circle.set-b { fill: rgba(${hexToRgb(theme.colors.secondary)}, 0.4); stroke: ${theme.colors.secondary}; }
    .venn-circle.set-c { fill: rgba(${hexToRgb(theme.colors.accent)}, 0.4); stroke: ${theme.colors.accent}; }
  `;
}

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `${r}, ${g}, ${b}`;
}