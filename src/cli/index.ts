/**
 * CLI interface for graphinate
 */

import { Command } from 'commander';
import chalk from 'chalk';

export class CLI {
  private program: Command;

  constructor() {
    this.program = new Command();
    this.setupCommands();
  }

  private setupCommands(): void {
    this.program
      .name('graphinate')
      .description('Generate SVG and PNG images from markdown for venn diagrams, flowcharts and charts')
      .version('0.1.0');

    this.program
      .argument('<input>', 'Input markdown file')
      .argument('<output>', 'Output image file (.svg or .png)')
      .option('--theme <theme>', 'Theme to apply', 'default')
      .option('--type <type>', 'Chart type (venn, flowchart)', 'venn')
      .action(async (input: string, output: string, options: any) => {
        await this.handleGenerate(input, output, options);
      });

    // Add theme listing command
    this.program
      .command('themes')
      .description('List available themes')
      .action(async () => {
        await this.handleListThemes();
      });

    // Add theme preview command
    this.program
      .command('preview')
      .description('Generate preview examples for all themes')
      .option('--output-dir <dir>', 'Output directory for previews', './previews')
      .action(async (options: any) => {
        await this.handleGeneratePreviews(options.outputDir);
      });
  }

  private async handleGenerate(
    input: string, 
    output: string, 
    options: { theme: string; type: string }
  ): Promise<void> {
    try {
      console.log(chalk.blue('🔄 Generating chart...'));
      
      // Import dependencies
      const { MarkdownParser } = await import('../parsers/markdown');
      const { validateInputFile, validateOutputPath, validateFileExtension } = await import('../utils/file');
      
      // Validate inputs
      await validateInputFile(input);
      validateFileExtension(input, ['.md', '.markdown']);
      
      await validateOutputPath(output);
      validateFileExtension(output, ['.svg', '.png']);
      
      // Parse markdown file
      const parser = new MarkdownParser();
      const chartSpec = await parser.parseFile(input);
      
      // Override theme from command line if provided and validate
      if (options.theme !== 'default') {
        const validThemes = ['default', 'rp', 'robotpony'];
        if (!validThemes.includes(options.theme)) {
          const suggestion = this.getThemeSuggestion(options.theme, validThemes);
          const suggestionText = suggestion ? ` Did you mean '${suggestion}'?` : '';
          throw new Error(`❌ Invalid theme '${options.theme}'.${suggestionText} Valid themes: ${validThemes.join(', ')}`);
        }
        chartSpec.theme = options.theme;
      }
      
      console.log(`📊 Chart type: ${chartSpec.type}`);
      console.log(`📝 Title: ${chartSpec.title || 'Untitled'}`);
      console.log(`🎨 Theme: ${chartSpec.theme || 'default'}`);
      
      // Render chart
      const { ChartRendererFactory } = await import('../renderers/factory');
      const { saveImage } = await import('../utils/image');
      
      console.log(chalk.blue('🎨 Rendering chart...'));
      const svgContent = await ChartRendererFactory.renderChart(chartSpec);
      
      // Save to file
      await saveImage(svgContent, output);
      
      console.log(chalk.green(`✅ Chart saved to: ${output}`));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Handle listing available themes
   */
  private async handleListThemes(): Promise<void> {
    try {
      const { getAvailableThemes, getTheme } = await import('../themes');
      const themes = getAvailableThemes();
      
      console.log(chalk.blue('🎨 Available Themes:\n'));
      
      for (const themeName of themes) {
        const theme = getTheme(themeName);
        console.log(chalk.green(`${themeName}:`));
        console.log(`  ${theme.description}`);
        console.log(`  Colors: ${theme.colors.primary}, ${theme.colors.secondary}, ${theme.colors.accent}`);
        console.log('');
      }
      
      console.log(chalk.yellow('Usage: graphinate input.md output.svg --theme=<theme-name>'));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Error listing themes:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Generate preview examples for all themes
   */
  private async handleGeneratePreviews(outputDir: string): Promise<void> {
    try {
      console.log(chalk.blue('🔄 Generating theme previews...'));
      
      // Import dependencies
      const { getAvailableThemes } = await import('../themes');
      const { ChartRendererFactory } = await import('../renderers/factory');
      const { saveImage } = await import('../utils/image');
      const fs = await import('fs/promises');
      
      // Create output directory
      await fs.mkdir(outputDir, { recursive: true });
      
      const themes = getAvailableThemes();
      
      // Sample chart specs for each type
      const sampleSpecs = {
        venn: {
          type: 'venn' as const,
          title: 'Sample Venn Diagram',
          data: {
            sets: [
              { name: 'Design', size: 100, color: undefined },
              { name: 'Code', size: 100, color: undefined }
            ],
            intersections: [{ sets: ['Design', 'Code'], size: 30, label: 'Magic' }],
            background: '#d4c5a9'
          }
        },
        plot: {
          type: 'plot' as const,
          title: 'Sample Plot',
          data: {
            x_axis: 'Time',
            y_axis: 'Value',
            x_range: [0, 10],
            y_range: [0, 10],
            line: {
              style: 'dotted',
              points: [[1, 2], [3, 4], [6, 7], [9, 8]]
            },
            captions: [
              { text: 'Start', x: 1, y: 2 },
              { text: 'End', x: 9, y: 8 }
            ],
            background: '#d4c5a9'
          }
        },
        flowchart: {
          type: 'flowchart' as const,
          title: 'Sample Flowchart',
          data: {
            nodes: [
              { id: 'start', type: 'circle', text: 'START', color: '#9fb665' },
              { id: 'process', type: 'rectangle', text: 'Process', color: '#c8986b' },
              { id: 'end', type: 'circle', text: 'END', color: '#2c3e50' }
            ],
            connections: [
              { from: 'start', to: 'process' },
              { from: 'process', to: 'end' }
            ],
            background: '#d4c5a9'
          }
        }
      };
      
      // Generate previews for each theme and chart type
      for (const theme of themes) {
        console.log(`  📊 Generating ${theme} theme previews...`);
        
        for (const [chartType, spec] of Object.entries(sampleSpecs)) {
          const chartSpec = { ...spec, theme };
          const svgContent = await ChartRendererFactory.renderChart(chartSpec);
          const outputPath = `${outputDir}/${theme}-${chartType}.svg`;
          
          await saveImage(svgContent, outputPath);
          console.log(`    ✅ ${outputPath}`);
        }
      }
      
      console.log(chalk.green(`\n✅ Theme previews generated in: ${outputDir}/`));
      console.log(chalk.yellow('Open the SVG files to see how each theme looks!'));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Error generating previews:'), error.message);
      process.exit(1);
    }
  }

  public async run(): Promise<void> {
    await this.program.parseAsync();
  }

  /**
   * Get suggestion for potentially misspelled theme
   */
  private getThemeSuggestion(theme: string, validThemes: string[]): string | null {
    const lowerTheme = theme.toLowerCase();
    
    // Check for close matches
    for (const validTheme of validThemes) {
      if (this.levenshteinDistance(lowerTheme, validTheme.toLowerCase()) <= 2) {
        return validTheme;
      }
    }
    
    return null;
  }

  /**
   * Calculate Levenshtein distance for fuzzy matching
   */
  private levenshteinDistance(str1: string, str2: string): number {
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
}