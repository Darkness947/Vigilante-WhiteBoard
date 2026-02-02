// Drawing Types for Aura Board
import type { Point } from '../geometry';

/**
 * Represents a freehand stroke
 */
export interface Stroke {
    id: string;
    points: Point[];
    color: string;
    width: number;
    timestamp: number;
}

/**
 * Shape types that can be recognized
 */
export type ShapeType =
    | 'line'
    | 'circle'
    | 'rectangle'
    | 'square'
    | 'triangle'
    | 'arrow'
    | 'checkmark'
    | 'xmark';

/**
 * Parameters for different shape types
 */
export interface LineParams {
    start: Point;
    end: Point;
}

export interface CircleParams {
    center: Point;
    radius: number;
}

export interface RectangleParams {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
}

export interface TriangleParams {
    p1: Point;
    p2: Point;
    p3: Point;
}

export interface ArrowParams {
    start: Point;
    end: Point;
    headSize: number;
}

export interface SymbolParams {
    center: Point;
    size: number;
}

export type ShapeParams =
    | LineParams
    | CircleParams
    | RectangleParams
    | TriangleParams
    | ArrowParams
    | SymbolParams;

/**
 * Represents a recognized vector shape
 */
export interface Shape {
    id: string;
    type: ShapeType;
    params: ShapeParams;
    color: string;
    width: number;
    confidence?: number;
    originalStrokeId?: string;
    timestamp?: number;
}

/**
 * History state for undo/redo
 */
export interface HistoryState {
    strokes: Stroke[];
    shapes: Shape[];
    timestamp: number;
}

/**
 * Drawing tool types
 */
export type ToolType = 'pen' | 'eraser' | 'select';

/**
 * Available themes
 */
export type ThemeType = 'light' | 'dark';

/**
 * Available locales
 */
export type LocaleType = 'en' | 'ar';

/**
 * Generate unique ID
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
