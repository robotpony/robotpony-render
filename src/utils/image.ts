/**
 * Image conversion utilities
 */

import sharp from 'sharp';
import * as fs from 'fs/promises';
import { getFileExtension } from './file';

export interface ConvertOptions {
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Convert SVG to PNG using Sharp
 */
export async function convertSVGToPNG(
  svgContent: string, 
  outputPath: string, 
  options: ConvertOptions = {}
): Promise<void> {
  const sharpInstance = sharp(Buffer.from(svgContent))
    .png();
  
  // Set dimensions if provided
  if (options.width || options.height) {
    sharpInstance.resize(options.width, options.height);
  }
  
  // Set quality if provided
  if (options.quality) {
    sharpInstance.png({ quality: options.quality });
  }
  
  await sharpInstance.toFile(outputPath);
}

/**
 * Save content based on file extension
 */
export async function saveImage(
  svgContent: string, 
  outputPath: string, 
  options: ConvertOptions = {}
): Promise<void> {
  const extension = getFileExtension(outputPath);
  
  switch (extension) {
    case '.svg':
      await fs.writeFile(outputPath, svgContent, 'utf-8');
      break;
    
    case '.png':
      await convertSVGToPNG(svgContent, outputPath, options);
      break;
    
    default:
      throw new Error(`Unsupported output format: ${extension}`);
  }
}