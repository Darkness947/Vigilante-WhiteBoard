// Feature Extractor - Extracts geometric features from strokes for shape recognition
import type { Point } from '../../geometry';
import {
    distance,
    pathLength,
    boundingBox,
    centroid,
    angleChanges,
    calculateCurvatures,
    variance,
    isClosedPath,
    findCorners,
    vectorFromPoints,
    vectorAngle,
    toDegrees,
} from '../../geometry';

/**
 * Extracted features from a stroke for shape recognition
 */
export interface StrokeFeatures {
    // Basic metrics
    pointCount: number;
    pathLength: number;
    boundingBox: { x: number; y: number; width: number; height: number };
    aspectRatio: number;
    centroid: Point;

    // Start/end analysis
    startPoint: Point;
    endPoint: Point;
    startEndDistance: number;
    closureRatio: number;
    isClosed: boolean;

    // Curvature analysis
    curvatures: number[];
    curvatureMean: number;
    curvatureVariance: number;

    // Angle analysis
    angleChanges: number[];
    totalAngleChange: number;
    dominantAngle: number;

    // Corner detection
    cornerCount: number;
    cornerIndices: number[];
    cornerAngles: number[];

    // Circularity
    circularity: number;
    radiusVariance: number;
    meanRadius: number;

    // Direction
    startAngle: number;
    endAngle: number;
}

/**
 * Extract all geometric features from a stroke
 */
export function extractFeatures(points: Point[]): StrokeFeatures {
    if (points.length < 2) {
        return getEmptyFeatures(points);
    }

    const startPoint = points[0];
    const endPoint = points[points.length - 1];
    const pLength = pathLength(points);
    const bbox = boundingBox(points);
    const center = centroid(points);
    const angles = angleChanges(points);
    const curves = calculateCurvatures(points);
    const corners = findCorners(points, Math.PI / 4); // 45 degree threshold
    const startEndDist = distance(startPoint, endPoint);

    // Calculate aspect ratio (avoid division by zero)
    const aspectRatio = bbox.height > 0 ? bbox.width / bbox.height : 1;

    // Calculate closure ratio
    const closureRatio = pLength > 0 ? startEndDist / pLength : 1;
    const isClosed = isClosedPath(points, 0.15);

    // Calculate curvature statistics
    const curvatureMean = curves.length > 0
        ? curves.reduce((sum, c) => sum + c, 0) / curves.length
        : 0;
    const curvatureVariance = variance(curves);

    // Calculate total angle change
    const totalAngleChange = angles.reduce((sum, a) => sum + Math.abs(a), 0);

    // Find dominant angle from histogram
    const dominantAngle = findDominantAngle(angles);

    // Calculate circularity (how close to a circle)
    const { circularity, radiusVariance, meanRadius } = calculateCircularity(points, center);

    // Calculate start and end angles
    const startAngle = getAngleAtPoint(points, 0);
    const endAngle = getAngleAtPoint(points, points.length - 1);

    // Get corner angles
    const cornerAngles = corners.map(idx => {
        if (idx > 0 && idx < points.length - 1) {
            const v1 = vectorFromPoints(points[idx - 1], points[idx]);
            const v2 = vectorFromPoints(points[idx], points[idx + 1]);
            return toDegrees(Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x));
        }
        return 0;
    });

    return {
        pointCount: points.length,
        pathLength: pLength,
        boundingBox: bbox,
        aspectRatio,
        centroid: center,
        startPoint,
        endPoint,
        startEndDistance: startEndDist,
        closureRatio,
        isClosed,
        curvatures: curves,
        curvatureMean,
        curvatureVariance,
        angleChanges: angles,
        totalAngleChange,
        dominantAngle,
        cornerCount: corners.length,
        cornerIndices: corners,
        cornerAngles,
        circularity,
        radiusVariance,
        meanRadius,
        startAngle,
        endAngle,
    };
}

/**
 * Calculate circularity metrics
 */
function calculateCircularity(
    points: Point[],
    center: Point
): { circularity: number; radiusVariance: number; meanRadius: number } {
    if (points.length < 3) {
        return { circularity: 0, radiusVariance: 0, meanRadius: 0 };
    }

    // Calculate distances from center to each point
    const radii = points.map(p => distance(p, center));
    const meanRadius = radii.reduce((sum, r) => sum + r, 0) / radii.length;
    const radiusVariance = variance(radii);

    // Circularity: 1 = perfect circle, 0 = not circular
    // Based on how uniform the radii are
    const normalizedVariance = meanRadius > 0 ? radiusVariance / (meanRadius * meanRadius) : 1;
    const circularity = Math.max(0, 1 - normalizedVariance);

    return { circularity, radiusVariance, meanRadius };
}

/**
 * Find the dominant angle from angle changes
 */
function findDominantAngle(angles: number[]): number {
    if (angles.length === 0) return 0;

    // Create histogram of angles (8 bins of 45 degrees each)
    const bins = new Array(8).fill(0);

    for (const angle of angles) {
        const degrees = toDegrees(Math.abs(angle));
        const bin = Math.floor(degrees / 45) % 8;
        bins[bin]++;
    }

    // Find the bin with most angles
    let maxBin = 0;
    let maxCount = bins[0];
    for (let i = 1; i < bins.length; i++) {
        if (bins[i] > maxCount) {
            maxCount = bins[i];
            maxBin = i;
        }
    }

    return maxBin * 45 + 22.5; // Return center of bin in degrees
}

/**
 * Get the angle of the stroke at a specific point
 */
function getAngleAtPoint(points: Point[], index: number): number {
    if (points.length < 2) return 0;

    let p1: Point, p2: Point;

    if (index === 0) {
        p1 = points[0];
        p2 = points[Math.min(1, points.length - 1)];
    } else if (index >= points.length - 1) {
        p1 = points[Math.max(0, points.length - 2)];
        p2 = points[points.length - 1];
    } else {
        p1 = points[index - 1];
        p2 = points[index + 1];
    }

    const v = vectorFromPoints(p1, p2);
    return toDegrees(vectorAngle(v));
}

/**
 * Get empty features for invalid input
 */
function getEmptyFeatures(points: Point[]): StrokeFeatures {
    const point = points[0] || { x: 0, y: 0 };
    return {
        pointCount: points.length,
        pathLength: 0,
        boundingBox: { x: point.x, y: point.y, width: 0, height: 0 },
        aspectRatio: 1,
        centroid: point,
        startPoint: point,
        endPoint: point,
        startEndDistance: 0,
        closureRatio: 0,
        isClosed: false,
        curvatures: [],
        curvatureMean: 0,
        curvatureVariance: 0,
        angleChanges: [],
        totalAngleChange: 0,
        dominantAngle: 0,
        cornerCount: 0,
        cornerIndices: [],
        cornerAngles: [],
        circularity: 0,
        radiusVariance: 0,
        meanRadius: 0,
        startAngle: 0,
        endAngle: 0,
    };
}
