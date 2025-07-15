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
          label: { type: 'string' }
        },
        required: ['sets'],
        additionalProperties: false
      }
    }
  },
  required: ['type'],
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
        style: { type: 'string', enum: ['solid', 'dotted', 'dashed'] },
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
  required: ['type', 'x_axis', 'y_axis', 'line'],
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