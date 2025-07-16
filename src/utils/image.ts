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
  density?: number;
  scaleFactor?: number;
}

/**
 * Convert SVG to PNG using Sharp with high-quality settings
 */
export async function convertSVGToPNG(
  svgContent: string, 
  outputPath: string, 
  options: ConvertOptions = {}
): Promise<void> {
  // Set defaults for high quality output
  const defaults = {
    density: 96,
    scaleFactor: 1.5,
    quality: 85
  };
  
  const settings = { ...defaults, ...options };
  
  try {
    // Create Sharp instance with timeout and conservative settings
    const sharpInstance = sharp(Buffer.from(svgContent), {
      density: settings.density,
      limitInputPixels: false
    }).timeout({ seconds: 30 })
    .png({
      quality: settings.quality,
      compressionLevel: 6,
      adaptiveFiltering: false,
      force: true
    });
    
    // Calculate scaled dimensions if provided
    let targetWidth = settings.width;
    let targetHeight = settings.height;
    
    if (settings.scaleFactor && settings.scaleFactor !== 1) {
      if (targetWidth) targetWidth = Math.round(targetWidth * settings.scaleFactor);
      if (targetHeight) targetHeight = Math.round(targetHeight * settings.scaleFactor);
    }
    
    // Set dimensions if provided
    if (targetWidth || targetHeight) {
      sharpInstance.resize(targetWidth, targetHeight, {
        kernel: sharp.kernel.lanczos2,
        withoutEnlargement: false
      });
    }
    
    await sharpInstance.toFile(outputPath);
  } catch (error) {
    throw new Error(`PNG conversion failed: ${error instanceof Error ? error.message : String(error)}`);
  }
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