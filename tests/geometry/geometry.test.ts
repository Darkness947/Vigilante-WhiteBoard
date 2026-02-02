// Geometry Utils Tests
import { describe, it, expect } from 'vitest';
import {
    distance,
    distanceSquared,
    midpoint,
    lerp,
    vectorFromPoints,
    magnitude,
    normalize,
    dot,
    cross,
    angleBetween,
    toDegrees,
    toRadians,
    pathLength,
    boundingBox,
    centroid,
    isClosedPath,
    findCorners,
    variance,
} from '../../src/geometry';

describe('Point Operations', () => {
    describe('distance', () => {
        it('should calculate distance between two points', () => {
            expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
        });

        it('should return 0 for same point', () => {
            expect(distance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
        });

        it('should handle negative coordinates', () => {
            expect(distance({ x: -3, y: -4 }, { x: 0, y: 0 })).toBe(5);
        });
    });

    describe('distanceSquared', () => {
        it('should calculate squared distance', () => {
            expect(distanceSquared({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(25);
        });
    });

    describe('midpoint', () => {
        it('should calculate midpoint', () => {
            const mid = midpoint({ x: 0, y: 0 }, { x: 10, y: 10 });
            expect(mid.x).toBe(5);
            expect(mid.y).toBe(5);
        });
    });

    describe('lerp', () => {
        it('should interpolate at t=0', () => {
            const result = lerp({ x: 0, y: 0 }, { x: 10, y: 10 }, 0);
            expect(result.x).toBe(0);
            expect(result.y).toBe(0);
        });

        it('should interpolate at t=1', () => {
            const result = lerp({ x: 0, y: 0 }, { x: 10, y: 10 }, 1);
            expect(result.x).toBe(10);
            expect(result.y).toBe(10);
        });

        it('should interpolate at t=0.5', () => {
            const result = lerp({ x: 0, y: 0 }, { x: 10, y: 10 }, 0.5);
            expect(result.x).toBe(5);
            expect(result.y).toBe(5);
        });
    });
});

describe('Vector Operations', () => {
    describe('vectorFromPoints', () => {
        it('should create vector from two points', () => {
            const v = vectorFromPoints({ x: 1, y: 2 }, { x: 4, y: 6 });
            expect(v.x).toBe(3);
            expect(v.y).toBe(4);
        });
    });

    describe('magnitude', () => {
        it('should calculate vector length', () => {
            expect(magnitude({ x: 3, y: 4 })).toBe(5);
        });

        it('should return 0 for zero vector', () => {
            expect(magnitude({ x: 0, y: 0 })).toBe(0);
        });
    });

    describe('normalize', () => {
        it('should normalize vector to unit length', () => {
            const n = normalize({ x: 3, y: 4 });
            expect(magnitude(n)).toBeCloseTo(1, 10);
        });

        it('should handle zero vector', () => {
            const n = normalize({ x: 0, y: 0 });
            expect(n.x).toBe(0);
            expect(n.y).toBe(0);
        });
    });

    describe('dot', () => {
        it('should calculate dot product', () => {
            expect(dot({ x: 1, y: 2 }, { x: 3, y: 4 })).toBe(11);
        });

        it('should return 0 for perpendicular vectors', () => {
            expect(dot({ x: 1, y: 0 }, { x: 0, y: 1 })).toBe(0);
        });
    });

    describe('cross', () => {
        it('should calculate cross product z-component', () => {
            expect(cross({ x: 1, y: 0 }, { x: 0, y: 1 })).toBe(1);
        });
    });

    describe('angleBetween', () => {
        it('should calculate angle between perpendicular vectors', () => {
            const angle = angleBetween({ x: 1, y: 0 }, { x: 0, y: 1 });
            expect(toDegrees(angle)).toBeCloseTo(90, 5);
        });

        it('should return 0 for same direction vectors', () => {
            const angle = angleBetween({ x: 1, y: 0 }, { x: 2, y: 0 });
            expect(angle).toBeCloseTo(0, 10);
        });
    });
});

describe('Angle Conversions', () => {
    it('should convert radians to degrees', () => {
        expect(toDegrees(Math.PI)).toBeCloseTo(180, 5);
    });

    it('should convert degrees to radians', () => {
        expect(toRadians(180)).toBeCloseTo(Math.PI, 5);
    });
});

describe('Path Operations', () => {
    describe('pathLength', () => {
        it('should calculate total path length', () => {
            const points = [
                { x: 0, y: 0 },
                { x: 3, y: 4 },
                { x: 6, y: 0 },
            ];
            expect(pathLength(points)).toBe(10); // 5 + 5
        });

        it('should return 0 for single point', () => {
            expect(pathLength([{ x: 0, y: 0 }])).toBe(0);
        });

        it('should return 0 for empty array', () => {
            expect(pathLength([])).toBe(0);
        });
    });

    describe('boundingBox', () => {
        it('should calculate bounding box', () => {
            const points = [
                { x: 1, y: 2 },
                { x: 5, y: 8 },
                { x: 3, y: 4 },
            ];
            const box = boundingBox(points);
            expect(box.x).toBe(1);
            expect(box.y).toBe(2);
            expect(box.width).toBe(4);
            expect(box.height).toBe(6);
        });

        it('should handle empty array', () => {
            const box = boundingBox([]);
            expect(box.width).toBe(0);
            expect(box.height).toBe(0);
        });
    });

    describe('centroid', () => {
        it('should calculate center of points', () => {
            const points = [
                { x: 0, y: 0 },
                { x: 2, y: 0 },
                { x: 2, y: 2 },
                { x: 0, y: 2 },
            ];
            const c = centroid(points);
            expect(c.x).toBe(1);
            expect(c.y).toBe(1);
        });
    });

    describe('isClosedPath', () => {
        it('should detect closed path', () => {
            const points = [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 10, y: 10 },
                { x: 0, y: 10 },
                { x: 0.5, y: 0.5 }, // Close to start
            ];
            expect(isClosedPath(points)).toBe(true);
        });

        it('should detect open path', () => {
            const points = [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 10, y: 10 },
            ];
            expect(isClosedPath(points)).toBe(false);
        });
    });

    describe('findCorners', () => {
        it('should find sharp corners', () => {
            const points = [
                { x: 0, y: 0 },
                { x: 5, y: 0 },
                { x: 5, y: 5 }, // 90 degree corner
                { x: 10, y: 5 },
            ];
            const corners = findCorners(points);
            expect(corners.length).toBeGreaterThan(0);
        });
    });

    describe('variance', () => {
        it('should calculate variance', () => {
            expect(variance([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(4, 5);
        });

        it('should return 0 for empty array', () => {
            expect(variance([])).toBe(0);
        });
    });
});
