/**
 * JSON schemas for validating chart specifications
 */

export const vennSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['venn'] },
    theme: { type: 'string', enum: ['default', 'rp', 'robotpony'] },
    title: { type: 'string' },
    background: { type: 'string' },
    sets: {
      type: 'array',
      minItems: 2,
      maxItems: 5,
      items: {
        oneOf: [
          { type: 'string' },
          {
            type: 'object',
            properties: {
              name: { type: 'string' },
              size: { type: 'number', minimum: 0 },
              color: { type: 'string' }
            },
            required: ['name'],
            additionalProperties: false
          }
        ]
      }
    },
    overlap: { type: 'string' },
    intersections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sets: {
            type: 'array',
            items: { type: 'string' },
            minItems: 2
          },
          size: { type: 'number', minimum: 0 },
          label: { type: 'string' },
          arrow: { type: 'boolean' }
        },
        required: ['sets'],
        additionalProperties: false
      }
    }
  },
  required: ['type', 'sets'],
  additionalProperties: false
};

export const plotSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['plot'] },
    theme: { type: 'string', enum: ['default', 'rp', 'robotpony'] },
    title: { type: 'string' },
    background: { type: 'string' },
    x_axis: { type: 'string' },
    y_axis: { type: 'string' },
    x_range: {
      type: 'array',
      items: { type: 'number' },
      minItems: 2,
      maxItems: 2
    },
    y_range: {
      type: 'array',
      items: { type: 'number' },
      minItems: 2,
      maxItems: 2
    },
    line: {
      type: 'object',
      properties: {
        style: { type: 'string', enum: ['solid', 'dotted', 'dashed', 'dash-dot'] },
        color: { type: 'string' },
        width: { type: 'number' },
        points: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'number' },
            minItems: 2,
            maxItems: 2
          },
          minItems: 2
        }
      },
      required: ['points'],
      additionalProperties: false
    },
    lines: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          style: { type: 'string', enum: ['solid', 'dotted', 'dashed', 'dash-dot'] },
          color: { type: 'string' },
          width: { type: 'number' },
          label: { type: 'string' },
          points: {
            type: 'array',
            items: {
              type: 'array',
              items: { type: 'number' },
              minItems: 2,
              maxItems: 2
            },
            minItems: 2
          }
        },
        required: ['points'],
        additionalProperties: false
      }
    },
    markers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['circle', 'square', 'triangle', 'diamond'] },
          size: { type: 'number' },
          color: { type: 'string' },
          x: { type: 'number' },
          y: { type: 'number' },
          label: { type: 'string' }
        },
        required: ['x', 'y'],
        additionalProperties: false
      }
    },
    grid: {
      type: 'object',
      properties: {
        show: { type: 'boolean' },
        color: { type: 'string' },
        style: { type: 'string', enum: ['solid', 'dotted', 'dashed'] }
      },
      additionalProperties: false
    },
    legend: {
      type: 'object',
      properties: {
        show: { type: 'boolean' },
        position: { type: 'string', enum: ['top-right', 'top-left', 'bottom-right', 'bottom-left'] }
      },
      additionalProperties: false
    },
    captions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          x: { type: 'number' },
          y: { type: 'number' }
        },
        required: ['text', 'x', 'y'],
        additionalProperties: false
      }
    }
  },
  required: ['type', 'x_axis', 'y_axis'],
  anyOf: [
    { required: ['line'] },
    { required: ['lines'] }
  ],
  additionalProperties: false
};

export const flowchartSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['flowchart'] },
    theme: { type: 'string', enum: ['default', 'rp', 'robotpony'] },
    title: { type: 'string' },
    background: { type: 'string' },
    caption: { type: 'string' },
    subtitle: { type: 'string' },
    nodes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: ['diamond', 'rectangle', 'circle', 'oval'] },
          text: { type: 'string' },
          color: { type: 'string' },
          x: { type: 'number' },
          y: { type: 'number' }
        },
        required: ['id', 'text'],
        additionalProperties: false
      }
    },
    connections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          from: { type: 'string' },
          to: { type: 'string' },
          label: { type: 'string' }
        },
        required: ['from', 'to'],
        additionalProperties: false
      }
    }
  },
  required: ['type', 'nodes'],
  additionalProperties: false
};

/**
 * Get schema for chart type
 */
export function getSchemaForType(chartType: string) {
  switch (chartType) {
    case 'venn':
      return vennSchema;
    case 'plot':
      return plotSchema;
    case 'flowchart':
      return flowchartSchema;
    default:
      throw new Error(`Unknown chart type: ${chartType}`);
  }
}

/**
 * Common validation patterns for error messages
 */
export const validationMessages = {
  invalidChartType: 'Chart type must be one of: venn, plot, flowchart',
  invalidTheme: 'Theme must be one of: default, rp, robotpony',
  missingRequiredField: (field: string) => `Required field '${field}' is missing`,
  invalidColorFormat: 'Color must be a hex code (e.g. #ff0000) or color name (e.g. red, blue, olive)',
  invalidCoordinates: 'Coordinates must be numbers in [x, y] format',
  insufficientSets: 'Venn diagrams require at least 2 sets',
  tooManySets: 'Venn diagrams support maximum 5 sets',
  insufficientPoints: 'Plot lines require at least 2 points',
  invalidRange: 'Ranges must be [min, max] where min < max',
  emptyNodes: 'Flowcharts require at least one node',
  invalidConnection: 'Connections must reference existing node IDs'
};

/**
 * Color suggestions for typos
 */
export const colorSuggestions: Record<string, string> = {
  'oliv': 'olive',
  'oragne': 'orange',
  'organge': 'orange',
  'orage': 'orange',
  'blu': 'blue',
  'bleu': 'blue',
  'gren': 'green',
  'grean': 'green',
  'purpl': 'purple',
  'purpel': 'purple',
  'yelow': 'yellow',
  'yello': 'yellow',
  'gray': 'grey',
  'blak': 'black',
  'balck': 'black',
  'whit': 'white',
  'beig': 'beige',
  'beige': 'beige'
};

/**
 * Get suggestion for potentially misspelled color
 */
export function getColorSuggestion(color: string): string | null {
  const lowerColor = color.toLowerCase();
  
  // Exact match
  if (colorSuggestions[lowerColor]) {
    return colorSuggestions[lowerColor];
  }
  
  // Fuzzy matching for common typos
  const validColors = ['olive', 'orange', 'beige', 'blue', 'red', 'green', 'purple', 'yellow', 'grey', 'gray', 'black', 'white'];
  
  for (const validColor of validColors) {
    if (levenshteinDistance(lowerColor, validColor) <= 2) {
      return validColor;
    }
  }
  
  return null;
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}