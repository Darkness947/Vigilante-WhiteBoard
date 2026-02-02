// Line Detector - Detects straight lines from strokes
import type { StrokeFeatures } from '../FeatureExtractor';
import type { LineParams } from '../../../types';
import type { Point } from '../../../geometry';

export interface DetectionResult {
    detected: boolean;
    confidence: number;
    params?: LineParams;
}

/**
 * Detect if a stroke is a straight line
 */
export function detectLine(features: StrokeFeatures): DetectionResult {
    // Lines should have low curvature variance and path length close to start-end distance

    // Calculate how straight the line is
    const straightness = features.pathLength > 0
        ? features.startEndDistance / features.pathLength
        : 0;

    // Check curvature (lines should have very low curvature variance)
    const curvatureScore = Math.max(0, 1 - features.curvatureVariance * 10);

    // Check that it's not closed
    const notClosedScore = features.isClosed ? 0 : 1;

    // Lines should have no corners
    const noCornerScore = features.cornerCount === 0 ? 1 : Math.max(0, 1 - features.cornerCount * 0.5);

    // Minimum path length (to avoid noise)
    const minLength = features.pathLength > 20 ? 1 : features.pathLength / 20;

    // Calculate overall confidence
    const confidence =
        straightness * 0.4 +
        curvatureScore * 0.25 +
        notClosedScore * 0.15 +
        noCornerScore * 0.15 +
        minLength * 0.05;

    const detected = confidence > 0.7 && straightness > 0.9;

    if (detected) {
        return {
            detected: true,
            confidence,
            params: {
                start: features.startPoint,
                end: features.endPoint,
            },
        };
    }

    return { detected: false, confidence };
}

/**
 * Generate optimized line parameters from detected line
 * Snaps to common angles (0, 45, 90, 135, 180, etc.) if close
 */
export function optimizeLine(
    start: Point,
    end: Point,
    snapAngle = 15
): LineParams {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const length = Math.sqrt(dx * dx + dy * dy);

    // Snap to common angles
    const commonAngles = [0, 45, 90, 135, 180, -45, -90, -135, -180];
    let snappedAngle = angle;

    for (const common of commonAngles) {
        if (Math.abs(angle - common) < snapAngle) {
            snappedAngle = common;
            break;
        }
    }

    // Calculate new end point if angle was snapped
    if (snappedAngle !== angle) {
        const radians = snappedAngle * (Math.PI / 180);
        return {
            start,
            end: {
                x: start.x + length * Math.cos(radians),
                y: start.y + length * Math.sin(radians),
            },
        };
    }

    return { start, end };
}
