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
      
      // Override theme from command line if provided
      if (options.theme !== 'default') {
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

  public async run(): Promise<void> {
    await this.program.parseAsync();
  }
}