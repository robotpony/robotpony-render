/**
 * Theme definitions for graphinate
 */

export interface Theme {
  name: string;
  description: string;
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
  styles: {
    chartTitle: 'font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; text-anchor: middle;',
    setLabel: 'font-family: Arial, sans-serif; font-size: 14px; text-anchor: middle; fill: #333;',
    vennCircle: 'fill: rgba(31, 119, 180, 0.3); stroke: rgba(31, 119, 180, 0.8); stroke-width: 2;',
    intersectionLabel: 'font-family: Arial, sans-serif; font-size: 12px; text-anchor: middle; fill: #333;',
    intersectionBadge: 'fill: #666; stroke: #666; stroke-width: 1; rx: 4; ry: 4;',
    connectorLine: 'stroke: #666; stroke-width: 1; fill: none;',
    axisLine: 'stroke: #333; stroke-width: 2; fill: none;',
    axisLabel: 'font-family: Arial, sans-serif; font-size: 14px; fill: #333;',
    plotLine: 'stroke: #333; stroke-width: 2; fill: none;',
    captionBox: 'fill: #666; stroke: #666; stroke-width: 1; rx: 4; ry: 4;',
    captionText: 'font-family: Arial, sans-serif; font-size: 11px; font-weight: bold; text-anchor: middle; fill: white;',
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
  styles: {
    chartTitle: 'font-family: "Courier New", Monaco, Consolas, monospace; font-size: 18px; font-weight: bold; text-anchor: middle; fill: #333; letter-spacing: 1px;',
    setLabel: 'font-family: "Courier New", Monaco, Consolas, monospace; font-size: 16px; font-weight: bold; text-anchor: middle; fill: white; letter-spacing: 2px;',
    vennCircle: 'stroke-width: 2; opacity: 0.8;',
    intersectionLabel: 'font-family: "Courier New", Monaco, Consolas, monospace; font-size: 12px; font-weight: bold; text-anchor: middle; fill: white; letter-spacing: 1px;',
    intersectionBadge: 'fill: #2c3e50; stroke: #2c3e50; stroke-width: 2; rx: 8; ry: 8;',
    connectorLine: 'stroke: #2c3e50; stroke-width: 2; fill: none;',
    axisLine: 'stroke: #333; stroke-width: 2; fill: none;',
    axisLabel: 'font-family: "Courier New", Monaco, Consolas, monospace; font-size: 14px; font-weight: bold; fill: #333; letter-spacing: 1px;',
    plotLine: 'stroke: #333; stroke-width: 2; fill: none;',
    captionBox: 'fill: #2c3e50; stroke: #2c3e50; stroke-width: 1; rx: 4; ry: 4;',
    captionText: 'font-family: "Courier New", Monaco, Consolas, monospace; font-size: 11px; font-weight: bold; text-anchor: middle; fill: white; letter-spacing: 1px;',
    captionConnector: 'stroke: #333; stroke-width: 1; fill: none;'
  },
  colors: {
    primary: '#9fb665', // olive
    secondary: '#c8986b', // orange  
    accent: '#7ba23f', // darker olive
    background: '#d4c5a9', // beige
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