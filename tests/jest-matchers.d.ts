/**
 * Type definitions for custom Jest matchers
 */

declare namespace jest {
  interface Matchers<R> {
    toContainSVGElement(element: string): R;
    toHaveValidSVGStructure(): R;
  }
}