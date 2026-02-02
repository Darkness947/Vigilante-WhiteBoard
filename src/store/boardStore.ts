// Board Store - manages strokes, shapes, and history
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Point } from '../geometry';
import type { Stroke, Shape, HistoryState } from '../types';
import { generateId } from '../types';

interface BoardState {
    // State
    strokes: Stroke[];
    shapes: Shape[];
    currentStroke: Point[];
    history: HistoryState[];
    historyIndex: number;

    // Actions
    startStroke: (point: Point, color: string, width: number) => void;
    addPoint: (point: Point) => void;
    endStroke: () => Stroke | null;
    addShape: (shape: Shape) => void;
    replaceStrokeWithShape: (strokeId: string, shape: Omit<Shape, 'id' | 'originalStrokeId' | 'timestamp'>) => void;
    removeStroke: (strokeId: string) => void;
    removeShape: (shapeId: string) => void;
    undo: () => void;
    redo: () => void;
    clear: () => void;

    // Page management
    loadPageContent: (strokes: Stroke[], shapes: Shape[]) => void;
    getCurrentContent: () => { strokes: Stroke[]; shapes: Shape[] };

    // Internal
    _activeStrokeColor: string;
    _activeStrokeWidth: number;
}

const MAX_HISTORY = 50;

export const useBoardStore = create<BoardState>()(
    persist(
        (set, get) => ({
            // Initial state
            strokes: [],
            shapes: [],
            currentStroke: [],
            history: [],
            historyIndex: -1,
            _activeStrokeColor: '#000000',
            _activeStrokeWidth: 3,

            startStroke: (point, color, width) => {
                set({
                    currentStroke: [point],
                    _activeStrokeColor: color,
                    _activeStrokeWidth: width,
                });
            },

            addPoint: (point) => {
                const { currentStroke } = get();
                if (currentStroke.length === 0) return;

                // Only add point if it's different from the last point
                const lastPoint = currentStroke[currentStroke.length - 1];
                if (lastPoint.x === point.x && lastPoint.y === point.y) return;

                set({ currentStroke: [...currentStroke, point] });
            },

            endStroke: () => {
                const { currentStroke, strokes, shapes, history, historyIndex, _activeStrokeColor, _activeStrokeWidth } = get();

                if (currentStroke.length < 2) {
                    set({ currentStroke: [] });
                    return null;
                }

                const newStroke: Stroke = {
                    id: generateId(),
                    points: currentStroke,
                    color: _activeStrokeColor,
                    width: _activeStrokeWidth,
                    timestamp: Date.now(),
                };

                const newStrokes = [...strokes, newStroke];

                // Save to history
                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push({
                    strokes: newStrokes,
                    shapes,
                    timestamp: Date.now(),
                });

                // Limit history size
                if (newHistory.length > MAX_HISTORY) {
                    newHistory.shift();
                }

                set({
                    strokes: newStrokes,
                    currentStroke: [],
                    history: newHistory,
                    historyIndex: newHistory.length - 1,
                });

                return newStroke;
            },

            addShape: (shape) => {
                const { strokes, shapes, history, historyIndex } = get();

                const newShapes = [...shapes, shape];

                // Save to history
                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push({
                    strokes,
                    shapes: newShapes,
                    timestamp: Date.now(),
                });

                if (newHistory.length > MAX_HISTORY) {
                    newHistory.shift();
                }

                set({
                    shapes: newShapes,
                    history: newHistory,
                    historyIndex: newHistory.length - 1,
                });
            },

            replaceStrokeWithShape: (strokeId, shapeData) => {
                const { strokes, shapes, history, historyIndex } = get();

                const newStrokes = strokes.filter(s => s.id !== strokeId);
                const newShape: Shape = {
                    ...shapeData,
                    id: generateId(),
                    originalStrokeId: strokeId,
                    timestamp: Date.now(),
                };
                const newShapes = [...shapes, newShape];

                // Save to history
                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push({
                    strokes: newStrokes,
                    shapes: newShapes,
                    timestamp: Date.now(),
                });

                if (newHistory.length > MAX_HISTORY) {
                    newHistory.shift();
                }

                set({
                    strokes: newStrokes,
                    shapes: newShapes,
                    history: newHistory,
                    historyIndex: newHistory.length - 1,
                });
            },

            removeStroke: (strokeId) => {
                const { strokes, shapes, history, historyIndex } = get();

                const newStrokes = strokes.filter(s => s.id !== strokeId);

                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push({
                    strokes: newStrokes,
                    shapes,
                    timestamp: Date.now(),
                });

                if (newHistory.length > MAX_HISTORY) {
                    newHistory.shift();
                }

                set({
                    strokes: newStrokes,
                    history: newHistory,
                    historyIndex: newHistory.length - 1,
                });
            },

            removeShape: (shapeId) => {
                const { strokes, shapes, history, historyIndex } = get();

                const newShapes = shapes.filter(s => s.id !== shapeId);

                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push({
                    strokes,
                    shapes: newShapes,
                    timestamp: Date.now(),
                });

                if (newHistory.length > MAX_HISTORY) {
                    newHistory.shift();
                }

                set({
                    shapes: newShapes,
                    history: newHistory,
                    historyIndex: newHistory.length - 1,
                });
            },

            undo: () => {
                const { history, historyIndex } = get();

                if (historyIndex <= 0) {
                    // Go to initial empty state
                    set({
                        strokes: [],
                        shapes: [],
                        historyIndex: -1,
                    });
                    return;
                }

                const previousState = history[historyIndex - 1];
                set({
                    strokes: previousState.strokes,
                    shapes: previousState.shapes,
                    historyIndex: historyIndex - 1,
                });
            },

            redo: () => {
                const { history, historyIndex } = get();

                if (historyIndex >= history.length - 1) return;

                const nextState = history[historyIndex + 1];
                set({
                    strokes: nextState.strokes,
                    shapes: nextState.shapes,
                    historyIndex: historyIndex + 1,
                });
            },

            clear: () => {
                const { history, historyIndex } = get();

                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push({
                    strokes: [],
                    shapes: [],
                    timestamp: Date.now(),
                });

                if (newHistory.length > MAX_HISTORY) {
                    newHistory.shift();
                }

                set({
                    strokes: [],
                    shapes: [],
                    currentStroke: [],
                    history: newHistory,
                    historyIndex: newHistory.length - 1,
                });
            },

            loadPageContent: (strokes, shapes) => {
                set({
                    strokes,
                    shapes,
                    currentStroke: [],
                    history: [],
                    historyIndex: -1,
                });
            },

            getCurrentContent: () => {
                const { strokes, shapes } = get();
                return { strokes, shapes };
            },
        }),
        {
            name: 'aura-board-data',
            partialize: (state) => ({
                strokes: state.strokes,
                shapes: state.shapes,
            }),
        }
    )
);
