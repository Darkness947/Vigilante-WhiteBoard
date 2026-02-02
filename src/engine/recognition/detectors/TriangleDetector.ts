// Triangle Detector - Detects triangles from strokes
import type { Point } from '../../../geometry';
import type { StrokeFeatures } from '../FeatureExtractor';
import type { TriangleParams } from '../../../types';

export interface TriangleDetectionResult {
    detected: boolean;
    confidence: number;
    params?: TriangleParams;
}

/**
 * Detect if a stroke is a triangle
 */
export function detectTriangle(
    features: StrokeFeatures,
    points: Point[]
): TriangleDetectionResult {
    // Triangles should:
    // 1. Be closed
    // 2. Have exactly 3 corners
    // 3. Internal angles should sum to ~180 degrees
    // 4. Sides should be relatively straight

    // Check if closed
    const closedScore = features.isClosed ? 1 : 0;

    // Check corner count (should be exactly 3)
    let cornerScore: number;
    if (features.cornerCount === 3) {
        cornerScore = 1;
    } else if (features.cornerCount === 2 || features.cornerCount === 4) {
        cornerScore = 0.5;
    } else {
        cornerScore = 0;
    }

    // Check straightness between corners
    const straightnessScore = Math.max(0, 1 - features.curvatureVariance * 5);

    // Not too circular
    const notCircularScore = 1 - features.circularity;

    // Minimum size
    const minSize = Math.min(features.boundingBox.width, features.boundingBox.height);
    const sizeScore = minSize > 20 ? 1 : minSize / 20;

    // Calculate overall confidence
    const confidence =
        closedScore * 0.25 +
        cornerScore * 0.4 +
        straightnessScore * 0.15 +
        notCircularScore * 0.1 +
        sizeScore * 0.1;

    const detected = confidence > 0.6 && features.isClosed &&
        (features.cornerCount === 3 || (features.cornerCount === 2 && features.isClosed));

    if (detected) {
        // Find the 3 corner points
        const trianglePoints = extractTrianglePoints(features, points);

        return {
            detected: true,
            confidence,
            params: trianglePoints,
        };
    }

    return { detected: false, confidence };
}

/**
 * Extract the three corner points of the triangle
 */
function extractTrianglePoints(features: StrokeFeatures, points: Point[]): TriangleParams {
    if (features.cornerIndices.length >= 3) {
        // Use detected corners
        return {
            p1: points[features.cornerIndices[0]] || points[0],
            p2: points[features.cornerIndices[1]] || points[Math.floor(points.length / 3)],
            p3: points[features.cornerIndices[2]] || points[Math.floor(2 * points.length / 3)],
        };
    }

    // Fall back to bounding box triangle
    const { x, y, width, height } = features.boundingBox;

    // Detect triangle orientation based on where most points are
    // For now, default to pointing up
    return {
        p1: { x: x + width / 2, y }, // Top
        p2: { x, y: y + height }, // Bottom left
        p3: { x: x + width, y: y + height }, // Bottom right
    };
}

/**
 * Optimize triangle parameters 
 */
export function optimizeTriangle(p1: Point, p2: Point, p3: Point): TriangleParams {
    return {
        p1: { x: Math.round(p1.x), y: Math.round(p1.y) },
        p2: { x: Math.round(p2.x), y: Math.round(p2.y) },
        p3: { x: Math.round(p3.x), y: Math.round(p3.y) },
    };
}
