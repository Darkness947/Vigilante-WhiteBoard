// Geometry Types and Utilities for Aura Board
// Pure mathematical functions - no external dependencies

/**
 * Represents a 2D point with optional pressure and timestamp for drawing
 */
export interface Point {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

/**
 * Represents a 2D vector
 */
export interface Vector {
  x: number;
  y: number;
}

/**
 * Bounding box for shapes
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============ Point Operations ============

/**
 * Calculate Euclidean distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate squared distance (faster, no sqrt)
 */
export function distanceSquared(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return dx * dx + dy * dy;
}

/**
 * Calculate midpoint between two points
 */
export function midpoint(p1: Point, p2: Point): Point {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

/**
 * Linear interpolation between two points
 */
export function lerp(p1: Point, p2: Point, t: number): Point {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
  };
}

// ============ Vector Operations ============

/**
 * Create vector from two points
 */
export function vectorFromPoints(from: Point, to: Point): Vector {
  return {
    x: to.x - from.x,
    y: to.y - from.y,
  };
}

/**
 * Calculate vector magnitude (length)
 */
export function magnitude(v: Vector): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/**
 * Normalize vector to unit length
 */
export function normalize(v: Vector): Vector {
  const mag = magnitude(v);
  if (mag === 0) return { x: 0, y: 0 };
  return {
    x: v.x / mag,
    y: v.y / mag,
  };
}

/**
 * Calculate dot product of two vectors
 */
export function dot(v1: Vector, v2: Vector): number {
  return v1.x * v2.x + v1.y * v2.y;
}

/**
 * Calculate cross product (2D, returns scalar z-component)
 */
export function cross(v1: Vector, v2: Vector): number {
  return v1.x * v2.y - v1.y * v2.x;
}

/**
 * Calculate angle between two vectors in radians
 */
export function angleBetween(v1: Vector, v2: Vector): number {
  const dotProduct = dot(v1, v2);
  const mag1 = magnitude(v1);
  const mag2 = magnitude(v2);
  if (mag1 === 0 || mag2 === 0) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dotProduct / (mag1 * mag2)));
  return Math.acos(cosAngle);
}

/**
 * Calculate angle of vector from positive x-axis in radians
 */
export function vectorAngle(v: Vector): number {
  return Math.atan2(v.y, v.x);
}

// ============ Angle Operations ============

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Normalize angle to [0, 2π)
 */
export function normalizeAngle(angle: number): number {
  const twoPi = 2 * Math.PI;
  return ((angle % twoPi) + twoPi) % twoPi;
}

// ============ Path/Stroke Operations ============

/**
 * Calculate total length of a path defined by points
 */
export function pathLength(points: Point[]): number {
  if (points.length < 2) return 0;
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += distance(points[i - 1], points[i]);
  }
  return length;
}

/**
 * Calculate bounding box of points
 */
export function boundingBox(points: Point[]): BoundingBox {
  if (points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;

  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Calculate centroid (center of mass) of points
 */
export function centroid(points: Point[]): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  
  let sumX = 0;
  let sumY = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
  }
  
  return {
    x: sumX / points.length,
    y: sumY / points.length,
  };
}

/**
 * Calculate angle change at each point in a path
 * Returns array of angles in radians
 */
export function angleChanges(points: Point[]): number[] {
  if (points.length < 3) return [];
  
  const angles: number[] = [];
  
  for (let i = 1; i < points.length - 1; i++) {
    const v1 = vectorFromPoints(points[i - 1], points[i]);
    const v2 = vectorFromPoints(points[i], points[i + 1]);
    angles.push(angleBetween(v1, v2));
  }
  
  return angles;
}

/**
 * Calculate curvature at each point
 * Higher values = more curved
 */
export function calculateCurvatures(points: Point[]): number[] {
  if (points.length < 3) return [];
  
  const curvatures: number[] = [];
  
  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    
    // Using the formula: curvature = 2 * area / (|a| * |b| * |c|)
    // where a, b, c are the side lengths
    const a = distance(p0, p1);
    const b = distance(p1, p2);
    const c = distance(p0, p2);
    
    if (a * b * c === 0) {
      curvatures.push(0);
      continue;
    }
    
    const v1 = vectorFromPoints(p0, p1);
    const v2 = vectorFromPoints(p0, p2);
    const area = Math.abs(cross(v1, v2)) / 2;
    
    const curvature = (4 * area) / (a * b * c);
    curvatures.push(curvature);
  }
  
  return curvatures;
}

/**
 * Check if a path is closed (start point close to end point)
 * @param threshold - maximum distance ratio (relative to path length) to consider closed
 */
export function isClosedPath(points: Point[], threshold = 0.15): boolean {
  if (points.length < 3) return false;
  
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const startEndDist = distance(firstPoint, lastPoint);
  const totalLength = pathLength(points);
  
  if (totalLength === 0) return false;
  
  return (startEndDist / totalLength) < threshold;
}

/**
 * Find corner points (sharp angle changes)
 * @param threshold - minimum angle change in radians to consider a corner
 */
export function findCorners(points: Point[], threshold = Math.PI / 6): number[] {
  const angles = angleChanges(points);
  const cornerIndices: number[] = [];
  
  for (let i = 0; i < angles.length; i++) {
    if (angles[i] > threshold) {
      cornerIndices.push(i + 1); // +1 because angleChanges starts from index 1
    }
  }
  
  return cornerIndices;
}

/**
 * Calculate variance of an array of numbers
 */
export function variance(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map(v => (v - mean) ** 2);
  return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Simplify path using Ramer-Douglas-Peucker algorithm
 */
export function simplifyPath(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;
  
  // Find the point with the maximum distance from line between start and end
  let maxDist = 0;
  let maxIndex = 0;
  
  const start = points[0];
  const end = points[points.length - 1];
  
  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], start, end);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }
  
  // If max distance is greater than epsilon, recursively simplify
  if (maxDist > epsilon) {
    const left = simplifyPath(points.slice(0, maxIndex + 1), epsilon);
    const right = simplifyPath(points.slice(maxIndex), epsilon);
    return [...left.slice(0, -1), ...right];
  }
  
  return [start, end];
}

/**
 * Calculate perpendicular distance from point to line defined by two points
 */
export function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  
  const lineLengthSq = dx * dx + dy * dy;
  
  if (lineLengthSq === 0) {
    return distance(point, lineStart);
  }
  
  const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lineLengthSq;
  const tClamped = Math.max(0, Math.min(1, t));
  
  const closest: Point = {
    x: lineStart.x + tClamped * dx,
    y: lineStart.y + tClamped * dy,
  };
  
  return distance(point, closest);
}
