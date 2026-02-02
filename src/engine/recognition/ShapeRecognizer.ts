// Shape Recognizer - Main recognition engine that orchestrates shape detection
import type { Point } from '../../geometry';
import type { Shape, ShapeType } from '../../types';
import { generateId } from '../../types';
import { extractFeatures } from './FeatureExtractor';
import { detectLine, optimizeLine } from './detectors/LineDetector';
import { detectCircle, optimizeCircle } from './detectors/CircleDetector';
import { detectRectangle, optimizeRectangle } from './detectors/RectangleDetector';
import { detectTriangle, optimizeTriangle } from './detectors/TriangleDetector';
import { detectArrow, optimizeArrow } from './detectors/ArrowDetector';
import { detectSymbol, optimizeSymbol } from './detectors/SymbolDetector';

export interface RecognitionResult {
    recognized: boolean;
    shape: Shape | null;
    confidence: number;
    shapeType: ShapeType | null;
    allCandidates: ShapeCandidate[];
}

export interface ShapeCandidate {
    shapeType: ShapeType;
    confidence: number;
    shape: Shape;
}

export interface RecognitionConfig {
    minConfidence: number;
    enabledShapes: ShapeType[];
}

const DEFAULT_CONFIG: RecognitionConfig = {
    minConfidence: 0.65,
    enabledShapes: ['line', 'circle', 'rectangle', 'triangle', 'arrow', 'checkmark', 'xmark'],
};

/**
 * Main shape recognition function
 * Analyzes a stroke and returns the best matching shape
 */
export function recognizeShape(
    points: Point[],
    config: Partial<RecognitionConfig> = {}
): RecognitionResult {
    const cfg = { ...DEFAULT_CONFIG, ...config };

    // Need minimum points for recognition
    if (points.length < 5) {
        return {
            recognized: false,
            shape: null,
            confidence: 0,
            shapeType: null,
            allCandidates: [],
        };
    }

    // Extract features
    const features = extractFeatures(points);

    // Run all enabled detectors
    const candidates: ShapeCandidate[] = [];

    if (cfg.enabledShapes.includes('line')) {
        const result = detectLine(features);
        if (result.detected && result.params) {
            const optimized = optimizeLine(result.params.start, result.params.end);
            candidates.push({
                shapeType: 'line',
                confidence: result.confidence,
                shape: createShape('line', optimized, result.confidence),
            });
        }
    }

    if (cfg.enabledShapes.includes('circle')) {
        const result = detectCircle(features);
        if (result.detected && result.params) {
            const optimized = optimizeCircle(result.params.center, result.params.radius);
            candidates.push({
                shapeType: 'circle',
                confidence: result.confidence,
                shape: createShape('circle', optimized, result.confidence),
            });
        }
    }

    if (cfg.enabledShapes.includes('rectangle')) {
        const result = detectRectangle(features);
        if (result.detected && result.params) {
            const optimized = optimizeRectangle(
                result.params.x,
                result.params.y,
                result.params.width,
                result.params.height,
                result.isSquare
            );
            candidates.push({
                shapeType: 'rectangle',
                confidence: result.confidence,
                shape: createShape('rectangle', optimized, result.confidence),
            });
        }
    }

    if (cfg.enabledShapes.includes('triangle')) {
        const result = detectTriangle(features, points);
        if (result.detected && result.params) {
            const optimized = optimizeTriangle(
                result.params.p1,
                result.params.p2,
                result.params.p3
            );
            candidates.push({
                shapeType: 'triangle',
                confidence: result.confidence,
                shape: createShape('triangle', optimized, result.confidence),
            });
        }
    }

    if (cfg.enabledShapes.includes('arrow')) {
        const result = detectArrow(features, points);
        if (result.detected && result.params) {
            const optimized = optimizeArrow(
                result.params.start,
                result.params.end,
                result.params.headSize
            );
            candidates.push({
                shapeType: 'arrow',
                confidence: result.confidence,
                shape: createShape('arrow', optimized, result.confidence),
            });
        }
    }

    if (cfg.enabledShapes.includes('checkmark') || cfg.enabledShapes.includes('xmark')) {
        const result = detectSymbol(features, points);
        if (result.detected && result.params && result.symbolType) {
            if (cfg.enabledShapes.includes(result.symbolType)) {
                const optimized = optimizeSymbol(result.params.center, result.params.size);
                candidates.push({
                    shapeType: result.symbolType,
                    confidence: result.confidence,
                    shape: createShape(result.symbolType, optimized, result.confidence),
                });
            }
        }
    }

    // Sort by confidence
    candidates.sort((a, b) => b.confidence - a.confidence);

    // Return best match if above threshold
    if (candidates.length > 0 && candidates[0].confidence >= cfg.minConfidence) {
        return {
            recognized: true,
            shape: candidates[0].shape,
            confidence: candidates[0].confidence,
            shapeType: candidates[0].shapeType,
            allCandidates: candidates,
        };
    }

    return {
        recognized: false,
        shape: null,
        confidence: candidates.length > 0 ? candidates[0].confidence : 0,
        shapeType: null,
        allCandidates: candidates,
    };
}

/**
 * Create a Shape object from detection results
 */
function createShape(type: ShapeType, params: object, confidence: number): Shape {
    return {
        id: generateId(),
        type,
        params: params as Shape['params'],
        color: '#000000', // Will be overridden when adding to store
        width: 2,
        confidence,
    };
}

// Re-export for convenience
export { extractFeatures } from './FeatureExtractor';
export type { StrokeFeatures } from './FeatureExtractor';
