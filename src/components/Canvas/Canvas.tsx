// Drawing Canvas Component
// Main canvas for freehand drawing with smooth strokes

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useBoardStore, useToolStore, useSettingsStore } from '../../store';
import { renderAll, smoothStroke } from '../../engine/drawing';
import { recognizeShape } from '../../engine/recognition';
import type { Point } from '../../geometry';
import { distance } from '../../geometry';
import type { Stroke, Shape } from '../../types';
import styles from './Canvas.module.css';

interface CanvasProps {
    className?: string;
}

// Hit detection threshold in pixels
const HIT_THRESHOLD = 10;

/**
 * Check if a point is near a stroke
 */
function isPointNearStroke(point: Point, stroke: Stroke, threshold: number): boolean {
    for (const strokePoint of stroke.points) {
        if (distance(point, strokePoint) <= threshold + stroke.width / 2) {
            return true;
        }
    }
    return false;
}

/**
 * Check if a point is near a shape
 */
function isPointNearShape(point: Point, shape: Shape, threshold: number): boolean {
    const params = shape.params;

    // Check based on shape type
    if (shape.type === 'line' && 'start' in params && 'end' in params) {
        return pointToLineDistance(point, params.start, params.end) <= threshold + shape.width / 2;
    }

    if (shape.type === 'circle' && 'center' in params && 'radius' in params) {
        const distToCenter = distance(point, params.center);
        return Math.abs(distToCenter - params.radius) <= threshold + shape.width / 2;
    }

    if ((shape.type === 'rectangle' || shape.type === 'square') && 'x' in params) {
        const rect = params as { x: number; y: number; width: number; height: number };
        return isPointNearRectangle(point, rect, threshold + shape.width / 2);
    }

    if (shape.type === 'triangle' && 'p1' in params) {
        const tri = params as { p1: Point; p2: Point; p3: Point };
        return (
            pointToLineDistance(point, tri.p1, tri.p2) <= threshold ||
            pointToLineDistance(point, tri.p2, tri.p3) <= threshold ||
            pointToLineDistance(point, tri.p3, tri.p1) <= threshold
        );
    }

    if (shape.type === 'arrow' && 'start' in params && 'end' in params) {
        return pointToLineDistance(point, params.start, params.end) <= threshold + shape.width / 2;
    }

    // For symbols, check bounding box
    if ('center' in params && 'size' in params) {
        const sym = params as { center: Point; size: number };
        return distance(point, sym.center) <= sym.size / 2 + threshold;
    }

    return false;
}

/**
 * Distance from point to line segment
 */
function pointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
        param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
        xx = lineStart.x;
        yy = lineStart.y;
    } else if (param > 1) {
        xx = lineEnd.x;
        yy = lineEnd.y;
    } else {
        xx = lineStart.x + param * C;
        yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if point is near rectangle edges
 */
function isPointNearRectangle(
    point: Point,
    rect: { x: number; y: number; width: number; height: number },
    threshold: number
): boolean {
    const corners = [
        { x: rect.x, y: rect.y },
        { x: rect.x + rect.width, y: rect.y },
        { x: rect.x + rect.width, y: rect.y + rect.height },
        { x: rect.x, y: rect.y + rect.height },
    ];

    for (let i = 0; i < 4; i++) {
        const next = (i + 1) % 4;
        if (pointToLineDistance(point, corners[i], corners[next]) <= threshold) {
            return true;
        }
    }
    return false;
}

export const Canvas: React.FC<CanvasProps> = ({ className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const isDrawingRef = useRef(false);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Store hooks
    const { strokes, shapes, currentStroke, startStroke, addPoint, endStroke, replaceStrokeWithShape, removeStroke, removeShape } = useBoardStore();
    const { activeTool, strokeColor, strokeWidth } = useToolStore();
    const { theme, autoCorrect, confidenceThreshold } = useSettingsStore();

    // Determine background color based on theme
    const backgroundColor = theme === 'dark' ? '#1a1a2e' : '#ffffff';

    // Handle canvas resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDimensions({ width: rect.width, height: rect.height });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Main render loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas resolution for high DPI displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;
        ctx.scale(dpr, dpr);

        // Apply smoothing to current stroke for display
        const smoothedCurrentStroke = currentStroke.length > 2
            ? smoothStroke(currentStroke, { resolution: 4 })
            : currentStroke;

        renderAll(
            ctx,
            dimensions.width,
            dimensions.height,
            strokes,
            shapes,
            smoothedCurrentStroke,
            strokeColor,
            strokeWidth,
            backgroundColor
        );

        // Draw selection highlight if any
        if (selectedId) {
            const selectedStroke = strokes.find(s => s.id === selectedId);
            const selectedShape = shapes.find(s => s.id === selectedId);

            if (selectedStroke || selectedShape) {
                ctx.save();
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);

                if (selectedStroke) {
                    // Draw bounding box around stroke
                    const points = selectedStroke.points;
                    const minX = Math.min(...points.map(p => p.x)) - 5;
                    const minY = Math.min(...points.map(p => p.y)) - 5;
                    const maxX = Math.max(...points.map(p => p.x)) + 5;
                    const maxY = Math.max(...points.map(p => p.y)) + 5;
                    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
                }

                ctx.restore();
            }
        }
    }, [strokes, shapes, currentStroke, dimensions, strokeColor, strokeWidth, backgroundColor, selectedId]);

    // Get pointer position from event
    const getPointerPosition = useCallback((e: React.PointerEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            pressure: e.pressure || 0.5,
            timestamp: Date.now(),
        };
    }, []);

    // Find stroke or shape at point
    const findElementAtPoint = useCallback((point: Point): { type: 'stroke' | 'shape'; id: string } | null => {
        // Check shapes first (they're rendered on top)
        for (let i = shapes.length - 1; i >= 0; i--) {
            if (isPointNearShape(point, shapes[i], HIT_THRESHOLD)) {
                return { type: 'shape', id: shapes[i].id };
            }
        }

        // Check strokes
        for (let i = strokes.length - 1; i >= 0; i--) {
            if (isPointNearStroke(point, strokes[i], HIT_THRESHOLD)) {
                return { type: 'stroke', id: strokes[i].id };
            }
        }

        return null;
    }, [strokes, shapes]);

    // Erase element at point
    const eraseAtPoint = useCallback((point: Point) => {
        const element = findElementAtPoint(point);
        if (element) {
            if (element.type === 'stroke') {
                removeStroke(element.id);
            } else {
                removeShape(element.id);
            }
        }
    }, [findElementAtPoint, removeStroke, removeShape]);

    // Pointer event handlers
    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        const point = getPointerPosition(e);

        if (activeTool === 'pen') {
            isDrawingRef.current = true;
            startStroke(point, strokeColor, strokeWidth);
        } else if (activeTool === 'eraser') {
            isDrawingRef.current = true;
            eraseAtPoint(point);
        } else if (activeTool === 'select') {
            const element = findElementAtPoint(point);
            setSelectedId(element?.id || null);
        }
    }, [activeTool, getPointerPosition, startStroke, strokeColor, strokeWidth, eraseAtPoint, findElementAtPoint]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isDrawingRef.current) return;

        e.preventDefault();

        // Throttle using RAF
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
            const point = getPointerPosition(e);

            if (activeTool === 'pen') {
                addPoint(point);
            } else if (activeTool === 'eraser') {
                eraseAtPoint(point);
            }
        });
    }, [activeTool, getPointerPosition, addPoint, eraseAtPoint]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        if (!isDrawingRef.current && activeTool !== 'select') return;

        e.preventDefault();
        e.currentTarget.releasePointerCapture(e.pointerId);

        isDrawingRef.current = false;

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        if (activeTool === 'pen') {
            // Finalize the stroke
            const completedStroke = endStroke();

            if (completedStroke && autoCorrect) {
                // Try to recognize the stroke as a shape
                const result = recognizeShape(completedStroke.points, {
                    minConfidence: confidenceThreshold,
                });

                if (result.recognized && result.shape) {
                    // Replace the stroke with the recognized shape
                    replaceStrokeWithShape(completedStroke.id, {
                        type: result.shape.type,
                        params: result.shape.params,
                        color: strokeColor,
                        width: strokeWidth,
                        confidence: result.confidence,
                    });
                    console.log(`Shape recognized: ${result.shapeType} (${(result.confidence * 100).toFixed(1)}% confidence)`);
                }
            }
        }
    }, [activeTool, endStroke, autoCorrect, confidenceThreshold, replaceStrokeWithShape, strokeColor, strokeWidth]);

    const handlePointerLeave = useCallback((e: React.PointerEvent) => {
        if (isDrawingRef.current) {
            handlePointerUp(e);
        }
    }, [handlePointerUp]);

    // Prevent context menu on long press
    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
    }, []);

    // Handle keyboard events for selection
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedId && (e.key === 'Delete' || e.key === 'Backspace')) {
                const stroke = strokes.find(s => s.id === selectedId);
                const shape = shapes.find(s => s.id === selectedId);

                if (stroke) {
                    removeStroke(selectedId);
                } else if (shape) {
                    removeShape(selectedId);
                }
                setSelectedId(null);
            }

            if (e.key === 'Escape') {
                setSelectedId(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, strokes, shapes, removeStroke, removeShape]);

    // Cursor style based on tool
    const cursorStyle = activeTool === 'eraser'
        ? 'crosshair'
        : activeTool === 'select'
            ? 'pointer'
            : 'crosshair';

    return (
        <div
            ref={containerRef}
            className={`${styles.container} ${className || ''}`}
        >
            <canvas
                ref={canvasRef}
                className={styles.canvas}
                style={{ width: dimensions.width, height: dimensions.height, cursor: cursorStyle }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerLeave}
                onPointerCancel={handlePointerUp}
                onContextMenu={handleContextMenu}
            />
        </div>
    );
};

export default Canvas;

