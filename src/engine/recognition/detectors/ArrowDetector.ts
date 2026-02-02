// Arrow Detector - Detects arrows from strokes
import type { Point } from '../../../geometry';
import { distance, vectorFromPoints, vectorAngle, toDegrees } from '../../../geometry';
import type { StrokeFeatures } from '../FeatureExtractor';
import type { ArrowParams } from '../../../types';

export interface ArrowDetectionResult {
    detected: boolean;
    confidence: number;
    params?: ArrowParams;
}

/**
 * Detect if a stroke is an arrow
 */
export function detectArrow(
    features: StrokeFeatures,
    points: Point[]
): ArrowDetectionResult {
    // Arrows typically:
    // 1. Have a main line segment
    // 2. Have a "V" or ">" shape at one end (the head)
    // 3. Are not closed
    // 4. Have 1-2 sharp corners at the arrowhead

    // Must not be closed
    if (features.isClosed) {
        return { detected: false, confidence: 0 };
    }

    // Need some corners but not too many
    if (features.cornerCount < 1 || features.cornerCount > 4) {
        return { detected: false, confidence: 0 };
    }

    // Check for arrow head pattern at either end
    const endHeadResult = checkArrowHead(points, features);
    const startHeadResult = checkArrowHead([...points].reverse(), features);

    const bestResult = endHeadResult.confidence > startHeadResult.confidence
        ? endHeadResult
        : startHeadResult;

    // Calculate overall confidence
    const notClosedScore = features.isClosed ? 0 : 1;
    const headScore = bestResult.confidence;
    const hasBodyScore = features.pathLength > 30 ? 1 : features.pathLength / 30;

    const confidence =
        notClosedScore * 0.2 +
        headScore * 0.6 +
        hasBodyScore * 0.2;

    const detected = confidence > 0.6 && bestResult.hasHead;

    if (detected && bestResult.start && bestResult.end) {
        return {
            detected: true,
            confidence,
            params: {
                start: bestResult.start,
                end: bestResult.end,
                headSize: bestResult.headSize || 15,
            },
        };
    }

    return { detected: false, confidence };
}

interface ArrowHeadCheckResult {
    hasHead: boolean;
    confidence: number;
    start?: Point;
    end?: Point;
    headSize?: number;
}

/**
 * Check if points have an arrow head pattern at the end
 */
function checkArrowHead(points: Point[], _features: StrokeFeatures): ArrowHeadCheckResult {
    if (points.length < 5) {
        return { hasHead: false, confidence: 0 };
    }

    const endPoint = points[points.length - 1];
    const startPoint = points[0];

    // Look at the last portion of the stroke for the arrowhead
    const headCheckLength = Math.min(Math.floor(points.length * 0.3), 20);
    const headPoints = points.slice(-headCheckLength);

    if (headPoints.length < 3) {
        return { hasHead: false, confidence: 0 };
    }

    // Check if there's a "V" pattern at the end
    // Look for angle changes in the head region
    let sharpAngleCount = 0;

    for (let i = 1; i < headPoints.length - 1; i++) {
        const v1 = vectorFromPoints(headPoints[i - 1], headPoints[i]);
        const v2 = vectorFromPoints(headPoints[i], headPoints[i + 1]);

        const angle1 = toDegrees(vectorAngle(v1));
        const angle2 = toDegrees(vectorAngle(v2));
        const angleDiff = Math.abs(angle2 - angle1);

        if (angleDiff > 30 && angleDiff < 150) {
            sharpAngleCount++;
        }
    }

    const hasHead = sharpAngleCount >= 1;
    const confidence = Math.min(1, sharpAngleCount / 2);

    // Calculate head size based on corner distance
    const headSize = headCheckLength > 0
        ? distance(headPoints[0], endPoint) * 0.8
        : 15;

    return {
        hasHead,
        confidence,
        start: startPoint,
        end: endPoint,
        headSize: Math.max(10, Math.min(30, headSize)),
    };
}

/**
 * Optimize arrow parameters
 */
export function optimizeArrow(start: Point, end: Point, headSize: number): ArrowParams {
    return {
        start: { x: Math.round(start.x), y: Math.round(start.y) },
        end: { x: Math.round(end.x), y: Math.round(end.y) },
        headSize: Math.round(headSize),
    };
}
