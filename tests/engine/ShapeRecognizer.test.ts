// Shape Recognition Tests
import { describe, it, expect } from 'vitest';
import { recognizeShape } from '../../src/engine/recognition';
import { extractFeatures } from '../../src/engine/recognition/FeatureExtractor';
import type { Point } from '../../src/geometry';

describe('FeatureExtractor', () => {
    describe('extractFeatures', () => {
        it('should handle single point', () => {
            const points: Point[] = [{ x: 50, y: 50 }];
            const features = extractFeatures(points);
            expect(features.pointCount).toBe(1);
            expect(features.pathLength).toBe(0);
        });

        it('should calculate path length correctly', () => {
            const points: Point[] = [
                { x: 0, y: 0 },
                { x: 3, y: 4 }, // distance = 5
                { x: 6, y: 0 }, // distance = 5
            ];
            const features = extractFeatures(points);
            expect(features.pathLength).toBe(10);
        });

        it('should calculate bounding box', () => {
            const points: Point[] = [
                { x: 10, y: 20 },
                { x: 50, y: 80 },
                { x: 30, y: 50 },
            ];
            const features = extractFeatures(points);
            expect(features.boundingBox.x).toBe(10);
            expect(features.boundingBox.y).toBe(20);
            expect(features.boundingBox.width).toBe(40);
            expect(features.boundingBox.height).toBe(60);
        });

        it('should detect closed path', () => {
            const closedPoints: Point[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 },
                { x: 1, y: 1 },
            ];
            const features = extractFeatures(closedPoints);
            expect(features.isClosed).toBe(true);
        });

        it('should detect open path', () => {
            const openPoints: Point[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
            ];
            const features = extractFeatures(openPoints);
            expect(features.isClosed).toBe(false);
        });
    });
});

describe('ShapeRecognizer', () => {
    describe('recognizeShape', () => {
        it('should not recognize too few points', () => {
            const points: Point[] = [
                { x: 0, y: 0 },
                { x: 10, y: 10 },
            ];
            const result = recognizeShape(points);
            expect(result.recognized).toBe(false);
        });

        it('should recognize a straight line', () => {
            // Create a straight horizontal line
            const points: Point[] = [];
            for (let i = 0; i <= 100; i += 2) {
                points.push({ x: i, y: 50 + (Math.random() - 0.5) * 2 }); // Slight noise
            }
            const result = recognizeShape(points);
            expect(result.recognized).toBe(true);
            expect(result.shapeType).toBe('line');
            expect(result.confidence).toBeGreaterThan(0.7);
        });

        it('should recognize a circle', () => {
            // Create a circle
            const points: Point[] = [];
            const centerX = 100, centerY = 100, radius = 50;
            for (let angle = 0; angle <= Math.PI * 2; angle += Math.PI / 20) {
                points.push({
                    x: centerX + radius * Math.cos(angle) + (Math.random() - 0.5) * 3,
                    y: centerY + radius * Math.sin(angle) + (Math.random() - 0.5) * 3,
                });
            }
            const result = recognizeShape(points);
            expect(result.recognized).toBe(true);
            expect(result.shapeType).toBe('circle');
        });

        it('should return all candidates sorted by confidence', () => {
            const points: Point[] = [];
            for (let i = 0; i <= 50; i++) {
                points.push({ x: i * 2, y: 50 });
            }
            const result = recognizeShape(points);
            expect(result.allCandidates.length).toBeGreaterThan(0);

            // Verify sorted by confidence
            for (let i = 1; i < result.allCandidates.length; i++) {
                expect(result.allCandidates[i - 1].confidence).toBeGreaterThanOrEqual(
                    result.allCandidates[i].confidence
                );
            }
        });

        it('should respect minimum confidence threshold', () => {
            const points: Point[] = [];
            for (let i = 0; i <= 20; i++) {
                points.push({ x: i * 2, y: i % 2 === 0 ? 50 : 60 }); // Noisy zigzag
            }
            const result = recognizeShape(points, { minConfidence: 0.99 });
            expect(result.recognized).toBe(false);
        });
    });
});
