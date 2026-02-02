// Stroke Smoother using Catmull-Rom Spline Interpolation
import type { Point } from '../../geometry';
import { distance, lerp } from '../../geometry';

/**
 * Catmull-Rom spline interpolation between 4 control points
 * Returns a point on the curve at parameter t (0-1)
 */
function catmullRom(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
    const t2 = t * t;
    const t3 = t2 * t;

    return {
        x: 0.5 * (
            2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
        ),
        y: 0.5 * (
            2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
        ),
        pressure: p1.pressure !== undefined && p2.pressure !== undefined
            ? p1.pressure + (p2.pressure - p1.pressure) * t
            : undefined,
    };
}

/**
 * Configuration for stroke smoothing
 */
export interface SmoothingConfig {
    /** Number of interpolated points per segment (more = smoother but slower) */
    resolution: number;
    /** Minimum distance between original points to apply smoothing */
    minPointDistance: number;
    /** Apply Douglas-Peucker simplification before smoothing */
    simplifyFirst: boolean;
    /** Epsilon for Douglas-Peucker (only if simplifyFirst is true) */
    simplifyEpsilon: number;
}

const DEFAULT_CONFIG: SmoothingConfig = {
    resolution: 8,
    minPointDistance: 2,
    simplifyFirst: false,
    simplifyEpsilon: 1.5,
};

/**
 * Smooth a stroke using Catmull-Rom spline interpolation
 * @param points - Raw input points
 * @param config - Smoothing configuration
 * @returns Smoothed points array
 */
export function smoothStroke(
    points: Point[],
    config: Partial<SmoothingConfig> = {}
): Point[] {
    const cfg = { ...DEFAULT_CONFIG, ...config };

    // Need at least 2 points
    if (points.length < 2) return points;

    // For 2 points, just interpolate linearly
    if (points.length === 2) {
        return interpolateLinear(points[0], points[1], cfg.resolution);
    }

    // Filter out points that are too close together
    const filteredPoints = filterClosePoints(points, cfg.minPointDistance);

    if (filteredPoints.length < 2) return points;
    if (filteredPoints.length === 2) {
        return interpolateLinear(filteredPoints[0], filteredPoints[1], cfg.resolution);
    }

    const smoothed: Point[] = [];

    // Process each segment with Catmull-Rom interpolation
    for (let i = 0; i < filteredPoints.length - 1; i++) {
        // Get 4 control points (clamping at boundaries)
        const p0 = filteredPoints[Math.max(0, i - 1)];
        const p1 = filteredPoints[i];
        const p2 = filteredPoints[i + 1];
        const p3 = filteredPoints[Math.min(filteredPoints.length - 1, i + 2)];

        // Add points along the curve
        for (let j = 0; j < cfg.resolution; j++) {
            const t = j / cfg.resolution;
            smoothed.push(catmullRom(p0, p1, p2, p3, t));
        }
    }

    // Add the last point
    smoothed.push(filteredPoints[filteredPoints.length - 1]);

    return smoothed;
}

/**
 * Filter out points that are too close together
 */
function filterClosePoints(points: Point[], minDistance: number): Point[] {
    if (points.length === 0) return [];

    const result: Point[] = [points[0]];

    for (let i = 1; i < points.length; i++) {
        const lastPoint = result[result.length - 1];
        if (distance(lastPoint, points[i]) >= minDistance) {
            result.push(points[i]);
        }
    }

    // Always include the last point if it's not already there
    const lastOriginal = points[points.length - 1];
    const lastResult = result[result.length - 1];
    if (lastOriginal !== lastResult) {
        result.push(lastOriginal);
    }

    return result;
}

/**
 * Simple linear interpolation between two points
 */
function interpolateLinear(start: Point, end: Point, steps: number): Point[] {
    const result: Point[] = [];

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        result.push(lerp(start, end, t));
    }

    return result;
}

/**
 * Apply moving average smoothing (alternative to Catmull-Rom)
 * Useful for quick smoothing during drawing
 */
export function movingAverageSmooth(points: Point[], windowSize = 3): Point[] {
    if (points.length < windowSize) return points;

    const result: Point[] = [];
    const halfWindow = Math.floor(windowSize / 2);

    for (let i = 0; i < points.length; i++) {
        let sumX = 0;
        let sumY = 0;
        let count = 0;

        for (let j = Math.max(0, i - halfWindow); j <= Math.min(points.length - 1, i + halfWindow); j++) {
            sumX += points[j].x;
            sumY += points[j].y;
            count++;
        }

        result.push({
            x: sumX / count,
            y: sumY / count,
            pressure: points[i].pressure,
            timestamp: points[i].timestamp,
        });
    }

    return result;
}
