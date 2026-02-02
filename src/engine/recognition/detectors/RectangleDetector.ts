// Rectangle Detector - Detects rectangles and squares from strokes
import type { StrokeFeatures } from '../FeatureExtractor';
import type { RectangleParams } from '../../../types';

export interface RectangleDetectionResult {
    detected: boolean;
    confidence: number;
    isSquare: boolean;
    params?: RectangleParams;
}

/**
 * Detect if a stroke is a rectangle or square
 */
export function detectRectangle(features: StrokeFeatures): RectangleDetectionResult {
    // Rectangles should:
    // 1. Be closed
    // 2. Have exactly 4 corners
    // 3. Corners should be approximately 90 degrees
    // 4. Path should be relatively straight between corners

    // Check if closed
    const closedScore = features.isClosed ? 1 : 0;

    // Check corner count (should be exactly 4)
    let cornerScore: number;
    if (features.cornerCount === 4) {
        cornerScore = 1;
    } else if (features.cornerCount === 3 || features.cornerCount === 5) {
        cornerScore = 0.6;
    } else {
        cornerScore = Math.max(0, 1 - Math.abs(features.cornerCount - 4) * 0.3);
    }

    // Check if corners are approximately 90 degrees
    let rightAngleScore = 0;
    if (features.cornerAngles.length >= 3) {
        let rightAngleCount = 0;
        for (const angle of features.cornerAngles) {
            const normalizedAngle = Math.abs(angle) % 180;
            if (normalizedAngle > 70 && normalizedAngle < 110) {
                rightAngleCount++;
            }
        }
        rightAngleScore = rightAngleCount / features.cornerAngles.length;
    }

    // Check that path between corners is straight (low curvature variance)
    const straightnessScore = Math.max(0, 1 - features.curvatureVariance * 5);

    // Minimum size
    const minSize = Math.min(features.boundingBox.width, features.boundingBox.height);
    const sizeScore = minSize > 20 ? 1 : minSize / 20;

    // Calculate overall confidence
    const confidence =
        closedScore * 0.2 +
        cornerScore * 0.35 +
        rightAngleScore * 0.25 +
        straightnessScore * 0.15 +
        sizeScore * 0.05;

    const detected = confidence > 0.6 && features.isClosed && features.cornerCount >= 3 && features.cornerCount <= 5;

    // Check if it's a square (aspect ratio close to 1)
    const isSquare = Math.abs(1 - features.aspectRatio) < 0.2;

    if (detected) {
        return {
            detected: true,
            confidence,
            isSquare,
            params: {
                x: features.boundingBox.x,
                y: features.boundingBox.y,
                width: features.boundingBox.width,
                height: features.boundingBox.height,
            },
        };
    }

    return { detected: false, confidence, isSquare: false };
}

/**
 * Optimize rectangle parameters
 * Snaps to square if close to square ratio
 */
export function optimizeRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    forceSquare = false
): RectangleParams {
    let w = Math.round(width);
    let h = Math.round(height);

    // Snap to square if close
    if (forceSquare || Math.abs(1 - width / height) < 0.15) {
        const size = Math.round((width + height) / 2);
        w = size;
        h = size;
    }

    return {
        x: Math.round(x),
        y: Math.round(y),
        width: w,
        height: h,
    };
}
