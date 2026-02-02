// Tool Store - manages active drawing tool and settings
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ToolType } from '../types';

interface ToolState {
    // State
    activeTool: ToolType;
    strokeColor: string;
    strokeWidth: number;

    // Color palette
    colorPalette: string[];

    // Actions
    setTool: (tool: ToolType) => void;
    setColor: (color: string) => void;
    setWidth: (width: number) => void;
    addColorToPalette: (color: string) => void;
}

const DEFAULT_COLORS = [
    '#000000', // Black
    '#FFFFFF', // White
    '#EF4444', // Red
    '#F97316', // Orange
    '#EAB308', // Yellow
    '#22C55E', // Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6B7280', // Gray
];

export const useToolStore = create<ToolState>()(
    persist(
        (set, get) => ({
            // Initial state
            activeTool: 'pen',
            strokeColor: '#000000',
            strokeWidth: 3,
            colorPalette: DEFAULT_COLORS,

            setTool: (tool) => set({ activeTool: tool }),

            setColor: (color) => set({ strokeColor: color }),

            setWidth: (width) => {
                // Clamp between 1 and 20
                const clamped = Math.max(1, Math.min(20, width));
                set({ strokeWidth: clamped });
            },

            addColorToPalette: (color) => {
                const { colorPalette } = get();
                if (!colorPalette.includes(color)) {
                    // Keep last 10 colors, add new one at the end
                    const newPalette = [...colorPalette.slice(-9), color];
                    set({ colorPalette: newPalette });
                }
            },
        }),
        {
            name: 'aura-board-tools',
        }
    )
);
