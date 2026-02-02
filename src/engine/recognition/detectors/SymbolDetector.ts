// Symbol Detector - Detects checkmarks and X marks
import type { Point } from '../../../geometry';
import { toDegrees, boundingBox } from '../../../geometry';
import type { StrokeFeatures } from '../FeatureExtractor';
import type { SymbolParams } from '../../../types';

export interface SymbolDetectionResult {
    detected: boolean;
    confidence: number;
    symbolType?: 'checkmark' | 'xmark';
    params?: SymbolParams;
}

/**
 * Detect if a stroke is a checkmark (✓) or X mark (✕)
 */
export function detectSymbol(
    features: StrokeFeatures,
    points: Point[]
): SymbolDetectionResult {
    // Try both detectors
    const checkResult = detectCheckmark(features, points);
    const xResult = detectXMark(features, points);

    // Return the one with higher confidence
    if (checkResult.detected && (!xResult.detected || checkResult.confidence > xResult.confidence)) {
        return checkResult;
    }

    if (xResult.detected) {
        return xResult;
    }

    return { detected: false, confidence: 0 };
}

/**
 * Detect checkmark (✓)
 */
function detectCheckmark(features: StrokeFeatures, points: Point[]): SymbolDetectionResult {
    // Checkmark characteristics:
    // 1. Not closed
    // 2. Has 1 corner (the bottom of the V)
    // 3. Short segment going down-left, longer segment going up-right
    // 4. Small size relative to typical strokes

    if (features.isClosed) {
        return { detected: false, confidence: 0 };
    }

    // Should have 1 main corner
    if (features.cornerCount < 1 || features.cornerCount > 2) {
        return { detected: false, confidence: 0 };
    }

    // Check aspect ratio (checkmarks are roughly square or wider)
    const aspectOk = features.aspectRatio > 0.5 && features.aspectRatio < 3;
    if (!aspectOk) {
        return { detected: false, confidence: 0 };
    }

    // Size should be reasonable (not too large)
    const size = Math.max(features.boundingBox.width, features.boundingBox.height);
    if (size > 100) {
        return { detected: false, confidence: 0 };
    }

    // Check the angle pattern
    // First segment should go down-right or down-left
    // Second segment should go up-right
    const hasCheckShape = checkCheckmarkShape(points);

    const confidence = hasCheckShape ? 0.75 + (features.cornerCount === 1 ? 0.15 : 0) : 0.4;
    const detected = confidence > 0.6 && hasCheckShape;

    if (detected) {
        const bbox = boundingBox(points);
        return {
            detected: true,
            confidence,
            symbolType: 'checkmark',
            params: {
                center: features.centroid,
                size: Math.max(bbox.width, bbox.height),
            },
        };
    }

    return { detected: false, confidence };
}

/**
 * Check if points form a checkmark shape
 */
function checkCheckmarkShape(points: Point[]): boolean {
    if (points.length < 5) return false;

    // Find the lowest point (the corner of the check)
    let lowestIdx = 0;
    let lowestY = points[0].y;

    for (let i = 1; i < points.length; i++) {
        if (points[i].y > lowestY) {
            lowestY = points[i].y;
            lowestIdx = i;
        }
    }

    // The lowest point should be roughly in the middle third
    const relativePos = lowestIdx / points.length;
    if (relativePos < 0.2 || relativePos > 0.8) return false;

    // Check that start is above the lowest and end is above or at same level
    const start = points[0];
    const end = points[points.length - 1];

    return start.y < lowestY && end.y < lowestY;
}

/**
 * Detect X mark (✕)
 */
function detectXMark(features: StrokeFeatures, points: Point[]): SymbolDetectionResult {
    // X mark characteristics:
    // 1. Not closed
    // 2. Has 1 corner (the crossing point)
    // 3. Two diagonal lines crossing near center
    // 4. Roughly square aspect ratio

    if (features.isClosed) {
        return { detected: false, confidence: 0 };
    }

    // Should have 1 main corner (the cross point)
    if (features.cornerCount < 1 || features.cornerCount > 3) {
        return { detected: false, confidence: 0 };
    }

    // Aspect ratio should be close to 1
    const aspectScore = 1 - Math.abs(1 - features.aspectRatio);
    if (aspectScore < 0.5) {
        return { detected: false, confidence: 0 };
    }

    // Size should be reasonable
    const size = Math.max(features.boundingBox.width, features.boundingBox.height);
    if (size > 100) {
        return { detected: false, confidence: 0 };
    }

    // Check the crossing pattern
    const hasCross = checkCrossPattern(points, features);

    const confidence = hasCross ? 0.7 + aspectScore * 0.2 : 0.4;
    const detected = confidence > 0.6 && hasCross;

    if (detected) {
        const bbox = boundingBox(points);
        return {
            detected: true,
            confidence,
            symbolType: 'xmark',
            params: {
                center: features.centroid,
                size: Math.max(bbox.width, bbox.height),
            },
        };
    }

    return { detected: false, confidence };
}

/**
 * Check if points form a crossing pattern
 */
function checkCrossPattern(points: Point[], features: StrokeFeatures): boolean {
    if (points.length < 5) return false;

    // Look for a sharp angle change near the middle
    const middleStart = Math.floor(points.length * 0.3);
    const middleEnd = Math.floor(points.length * 0.7);

    for (const idx of features.cornerIndices) {
        if (idx >= middleStart && idx <= middleEnd) {
            return true;
        }
    }

    // Also check if there's significant angle change in the middle
    const angleChanges = features.angleChanges;
    if (angleChanges.length > 0) {
        const midAngleIdx = Math.floor(angleChanges.length / 2);
        const midAngle = angleChanges[midAngleIdx] || 0;
        return Math.abs(toDegrees(midAngle)) > 60;
    }

    return false;
}

/**
 * Optimize symbol parameters
 */
export function optimizeSymbol(center: Point, size: number): SymbolParams {
    return {
        center: { x: Math.round(center.x), y: Math.round(center.y) },
        size: Math.round(size),
    };
}
