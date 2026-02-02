// Canvas Renderer - handles drawing strokes and shapes to canvas
import type { Point } from '../../geometry';
import type { Stroke, Shape, LineParams, CircleParams, RectangleParams, TriangleParams, ArrowParams, SymbolParams } from '../../types';

export interface RenderConfig {
    lineCapStyle: CanvasLineCap;
    lineJoinStyle: CanvasLineJoin;
    antiAlias: boolean;
}

const DEFAULT_RENDER_CONFIG: RenderConfig = {
    lineCapStyle: 'round',
    lineJoinStyle: 'round',
    antiAlias: true,
};

/**
 * Render a single stroke path
 */
export function renderStroke(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    color: string,
    width: number,
    config: Partial<RenderConfig> = {}
): void {
    if (points.length < 2) return;

    const cfg = { ...DEFAULT_RENDER_CONFIG, ...config };

    ctx.save();
    ctx.lineCap = cfg.lineCapStyle;
    ctx.lineJoin = cfg.lineJoinStyle;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    // Use quadratic curves for smoother rendering
    if (points.length === 2) {
        ctx.lineTo(points[1].x, points[1].y);
    } else {
        for (let i = 1; i < points.length - 1; i++) {
            const xMid = (points[i].x + points[i + 1].x) / 2;
            const yMid = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xMid, yMid);
        }
        // Connect to the last point
        const last = points[points.length - 1];
        const secondLast = points[points.length - 2];
        ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
    }

    ctx.stroke();
    ctx.restore();
}

/**
 * Render a recognized shape
 */
export function renderShape(
    ctx: CanvasRenderingContext2D,
    shape: Shape,
    config: Partial<RenderConfig> = {}
): void {
    const cfg = { ...DEFAULT_RENDER_CONFIG, ...config };

    ctx.save();
    ctx.lineCap = cfg.lineCapStyle;
    ctx.lineJoin = cfg.lineJoinStyle;
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.width;

    switch (shape.type) {
        case 'line':
            renderLine(ctx, shape.params as LineParams);
            break;
        case 'circle':
            renderCircle(ctx, shape.params as CircleParams);
            break;
        case 'rectangle':
        case 'square':
            renderRectangle(ctx, shape.params as RectangleParams);
            break;
        case 'triangle':
            renderTriangle(ctx, shape.params as TriangleParams);
            break;
        case 'arrow':
            renderArrow(ctx, shape.params as ArrowParams);
            break;
        case 'checkmark':
            renderCheckmark(ctx, shape.params as SymbolParams);
            break;
        case 'xmark':
            renderXMark(ctx, shape.params as SymbolParams);
            break;
    }

    ctx.restore();
}

function renderLine(ctx: CanvasRenderingContext2D, params: LineParams): void {
    ctx.beginPath();
    ctx.moveTo(params.start.x, params.start.y);
    ctx.lineTo(params.end.x, params.end.y);
    ctx.stroke();
}

function renderCircle(ctx: CanvasRenderingContext2D, params: CircleParams): void {
    ctx.beginPath();
    ctx.arc(params.center.x, params.center.y, params.radius, 0, Math.PI * 2);
    ctx.stroke();
}

function renderRectangle(ctx: CanvasRenderingContext2D, params: RectangleParams): void {
    ctx.beginPath();

    if (params.rotation) {
        const cx = params.x + params.width / 2;
        const cy = params.y + params.height / 2;
        ctx.translate(cx, cy);
        ctx.rotate(params.rotation);
        ctx.rect(-params.width / 2, -params.height / 2, params.width, params.height);
        ctx.rotate(-params.rotation);
        ctx.translate(-cx, -cy);
    } else {
        ctx.rect(params.x, params.y, params.width, params.height);
    }

    ctx.stroke();
}

function renderTriangle(ctx: CanvasRenderingContext2D, params: TriangleParams): void {
    ctx.beginPath();
    ctx.moveTo(params.p1.x, params.p1.y);
    ctx.lineTo(params.p2.x, params.p2.y);
    ctx.lineTo(params.p3.x, params.p3.y);
    ctx.closePath();
    ctx.stroke();
}

function renderArrow(ctx: CanvasRenderingContext2D, params: ArrowParams): void {
    const { start, end, headSize } = params;

    // Draw main line
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    // Calculate arrow head
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const headAngle = Math.PI / 6; // 30 degrees

    // Left side of arrow head
    const leftX = end.x - headSize * Math.cos(angle - headAngle);
    const leftY = end.y - headSize * Math.sin(angle - headAngle);

    // Right side of arrow head
    const rightX = end.x - headSize * Math.cos(angle + headAngle);
    const rightY = end.y - headSize * Math.sin(angle + headAngle);

    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(leftX, leftY);
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(rightX, rightY);
    ctx.stroke();
}

function renderCheckmark(ctx: CanvasRenderingContext2D, params: SymbolParams): void {
    const { center, size } = params;
    const halfSize = size / 2;

    ctx.beginPath();
    ctx.moveTo(center.x - halfSize * 0.8, center.y);
    ctx.lineTo(center.x - halfSize * 0.2, center.y + halfSize * 0.6);
    ctx.lineTo(center.x + halfSize, center.y - halfSize * 0.6);
    ctx.stroke();
}

function renderXMark(ctx: CanvasRenderingContext2D, params: SymbolParams): void {
    const { center, size } = params;
    const halfSize = size / 2;

    ctx.beginPath();
    ctx.moveTo(center.x - halfSize, center.y - halfSize);
    ctx.lineTo(center.x + halfSize, center.y + halfSize);
    ctx.moveTo(center.x + halfSize, center.y - halfSize);
    ctx.lineTo(center.x - halfSize, center.y + halfSize);
    ctx.stroke();
}

/**
 * Clear the entire canvas
 */
export function clearCanvas(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    backgroundColor?: string
): void {
    if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
    } else {
        ctx.clearRect(0, 0, width, height);
    }
}

/**
 * Full render pass - clears and redraws everything
 */
export function renderAll(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    strokes: Stroke[],
    shapes: Shape[],
    currentStroke: Point[],
    currentColor: string,
    currentWidth: number,
    backgroundColor?: string
): void {
    // Clear canvas
    clearCanvas(ctx, width, height, backgroundColor);

    // Render all completed strokes
    for (const stroke of strokes) {
        renderStroke(ctx, stroke.points, stroke.color, stroke.width);
    }

    // Render all recognized shapes
    for (const shape of shapes) {
        renderShape(ctx, shape);
    }

    // Render current in-progress stroke
    if (currentStroke.length > 1) {
        renderStroke(ctx, currentStroke, currentColor, currentWidth);
    }
}
