/**
 * Mathematical utility functions for reuse across the project
 */

// Linear interpolation helper
export function lerp(start, end, t) 
{
  return start + (end - start) * t;
}

// Constrain a value between min and max
export function boundValue(value, min, max)
{
  return Math.min(Math.max(value, min), max);
}