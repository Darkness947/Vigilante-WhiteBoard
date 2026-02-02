// Circle Detector - Detects circles from strokes
import type { StrokeFeatures } from '../FeatureExtractor';
import type { CircleParams } from '../../../types';

export interface CircleDetectionResult {
    detected: boolean;
    confidence: number;
    params?: CircleParams;
}

/**
 * Detect if a stroke is a circle
 */
export function detectCircle(features: StrokeFeatures): CircleDetectionResult {
    // Circles should be:
    // 1. Closed (start near end)
    // 2. Have uniform radius from center
    // 3. Aspect ratio close to 1
    // 4. No sharp corners

    // Check if closed
    const closedScore = features.isClosed ? 1 : Math.max(0, 1 - features.closureRatio * 3);

    // Check circularity (uniform distance from center)
    const circularityScore = features.circularity;

    // Check aspect ratio (should be close to 1 for circles)
    const aspectDiff = Math.abs(1 - features.aspectRatio);
    const aspectScore = Math.max(0, 1 - aspectDiff * 2);

    // No sharp corners in circles
    const noCornerScore = features.cornerCount === 0 ? 1 : Math.max(0, 1 - features.cornerCount * 0.3);

    // Minimum size
    const minSize = Math.min(features.boundingBox.width, features.boundingBox.height);
    const sizeScore = minSize > 15 ? 1 : minSize / 15;

    // Calculate overall confidence
    const confidence =
        closedScore * 0.25 +
        circularityScore * 0.35 +
        aspectScore * 0.2 +
        noCornerScore * 0.15 +
        sizeScore * 0.05;

    const detected = confidence > 0.65 && features.isClosed && features.circularity > 0.6;

    if (detected) {
        return {
            detected: true,
            confidence,
            params: {
                center: features.centroid,
                radius: features.meanRadius,
            },
        };
    }

    return { detected: false, confidence };
}

/**
 * Optimize circle parameters
 */
export function optimizeCircle(center: { x: number; y: number }, radius: number): CircleParams {
    // Round to nice numbers for cleaner rendering
    return {
        center: {
            x: Math.round(center.x),
            y: Math.round(center.y),
        },
        radius: Math.round(radius),
    };
}
