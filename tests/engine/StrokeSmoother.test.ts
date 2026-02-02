// Stroke Smoother Tests
import { describe, it, expect } from 'vitest';
import { smoothStroke, movingAverageSmooth } from '../../src/engine/drawing/StrokeSmoother';
import type { Point } from '../../src/geometry';

describe('StrokeSmoother', () => {
    describe('smoothStroke', () => {
        it('should return same points for less than 2 points', () => {
            const points: Point[] = [{ x: 0, y: 0 }];
            const result = smoothStroke(points);
            expect(result).toEqual(points);
        });

        it('should interpolate between 2 points', () => {
            const points: Point[] = [
                { x: 0, y: 0 },
                { x: 10, y: 10 },
            ];
            const result = smoothStroke(points);
            expect(result.length).toBeGreaterThan(2);
        });

        it('should produce more points than input for multiple points', () => {
            const points: Point[] = [
                { x: 0, y: 0 },
                { x: 10, y: 10 },
                { x: 20, y: 5 },
                { x: 30, y: 15 },
            ];
            const result = smoothStroke(points);
            expect(result.length).toBeGreaterThan(points.length);
        });

        it('should respect resolution config', () => {
            const points: Point[] = [
                { x: 0, y: 0 },
                { x: 10, y: 10 },
                { x: 20, y: 5 },
            ];
            const result4 = smoothStroke(points, { resolution: 4 });
            const result8 = smoothStroke(points, { resolution: 8 });
            expect(result8.length).toBeGreaterThan(result4.length);
        });

        it('should preserve start and end points approximately', () => {
            const points: Point[] = [
                { x: 0, y: 0 },
                { x: 50, y: 50 },
                { x: 100, y: 100 },
            ];
            const result = smoothStroke(points);

            // First point should be near start
            expect(result[0].x).toBeCloseTo(0, 1);
            expect(result[0].y).toBeCloseTo(0, 1);

            // Last point should be near end
            const last = result[result.length - 1];
            expect(last.x).toBeCloseTo(100, 1);
            expect(last.y).toBeCloseTo(100, 1);
        });
    });

    describe('movingAverageSmooth', () => {
        it('should return same points for small input', () => {
            const points: Point[] = [{ x: 0, y: 0 }];
            const result = movingAverageSmooth(points);
            expect(result).toEqual(points);
        });

        it('should smooth points with moving average', () => {
            const points: Point[] = [
                { x: 0, y: 0 },
                { x: 10, y: 10 },
                { x: 5, y: 5 },
                { x: 15, y: 15 },
                { x: 10, y: 10 },
            ];
            const result = movingAverageSmooth(points, 3);
            expect(result.length).toBe(points.length);

            // Middle point should be averaged
            expect(result[2].x).toBeCloseTo((10 + 5 + 15) / 3, 5);
            expect(result[2].y).toBeCloseTo((10 + 5 + 15) / 3, 5);
        });

        it('should preserve point count', () => {
            const points: Point[] = Array(10).fill(null).map((_, i) => ({ x: i, y: i }));
            const result = movingAverageSmooth(points);
            expect(result.length).toBe(points.length);
        });
    });
});
