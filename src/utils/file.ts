/**
 * File utilities with validation and error handling
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export class FileError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'FileError';
  }
}

/**
 * Validate that input file exists and is readable
 */
export async function validateInputFile(filePath: string): Promise<void> {
  try {
    const stat = await fs.stat(filePath);
    
    if (!stat.isFile()) {
      throw new FileError(`Path is not a file: ${filePath}`, 'NOT_FILE');
    }
    
    // Check if file is readable by attempting to access it
    await fs.access(filePath, fs.constants.R_OK);
    
  } catch (error: any) {
    if (error instanceof FileError) {
      throw error;
    }
    
    if (error.code === 'ENOENT') {
      throw new FileError(`File not found: ${filePath}`, 'NOT_FOUND');
    }
    
    if (error.code === 'EACCES') {
      throw new FileError(`Permission denied: ${filePath}`, 'PERMISSION_DENIED');
    }
    
    throw new FileError(`Cannot access file: ${filePath} (${error.message})`, 'ACCESS_ERROR');
  }
}

/**
 * Validate output path and ensure directory exists
 */
export async function validateOutputPath(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error: any) {
    throw new FileError(`Cannot create output directory: ${dir} (${error.message})`, 'MKDIR_ERROR');
  }
  
  // Check if we can write to the directory
  try {
    await fs.access(dir, fs.constants.W_OK);
  } catch (error: any) {
    if (error.code === 'EACCES') {
      throw new FileError(`No write permission for directory: ${dir}`, 'WRITE_PERMISSION_DENIED');
    }
    throw new FileError(`Cannot write to directory: ${dir} (${error.message})`, 'WRITE_ERROR');
  }
}

/**
 * Get file extension from path
 */
export function getFileExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase();
}

/**
 * Validate file extension is supported
 */
export function validateFileExtension(filePath: string, allowedExtensions: string[]): void {
  const ext = getFileExtension(filePath);
  
  if (!allowedExtensions.includes(ext)) {
    throw new FileError(
      `Unsupported file extension: ${ext}. Allowed: ${allowedExtensions.join(', ')}`,
      'UNSUPPORTED_EXTENSION'
    );
  }
}