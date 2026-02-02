# State Management Diagram

## Overview

State is managed using Zustand with localStorage persistence.

## Store Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        STATE MANAGEMENT                                  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                          ZUSTAND STORES                                 │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                        boardStore                                  │ │
│  │                                                                    │ │
│  │  STATE                                                             │ │
│  │  ─────                                                             │ │
│  │  strokes: Stroke[]        → All freehand strokes                  │ │
│  │  shapes: Shape[]          → Recognized vector shapes              │ │
│  │  currentStroke: Point[]   → In-progress drawing                   │ │
│  │  history: HistoryState[]  → Undo stack                            │ │
│  │  historyIndex: number     → Current position in history           │ │
│  │                                                                    │ │
│  │  ACTIONS                                                           │ │
│  │  ───────                                                           │ │
│  │  addPoint(point)          → Add point to current stroke           │ │
│  │  endStroke()              → Complete stroke, trigger recognition  │ │
│  │  replaceWithShape(id, shape) → Replace stroke with vector shape  │ │
│  │  deleteItem(id)           → Remove stroke or shape                │ │
│  │  undo()                   → Revert to previous state              │ │
│  │  redo()                   → Re-apply undone state                 │ │
│  │  clear()                  → Clear entire board                    │ │
│  │                                                                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                       settingsStore                                │ │
│  │                                                                    │ │
│  │  STATE                                                             │ │
│  │  ─────                                                             │ │
│  │  theme: 'light' | 'dark'     → Current color theme               │ │
│  │  locale: 'en' | 'ar'         → Current language                  │ │
│  │  autoCorrect: boolean        → Auto shape correction enabled     │ │
│  │  confidenceThreshold: number → Min confidence for correction     │ │
│  │  reducedMotion: boolean      → Disable animations                │ │
│  │                                                                    │ │
│  │  ACTIONS                                                           │ │
│  │  ───────                                                           │ │
│  │  setTheme(theme)             → Switch theme                       │ │
│  │  setLocale(locale)           → Switch language                    │ │
│  │  toggleAutoCorrect()         → Toggle auto-correction             │ │
│  │  setConfidenceThreshold(n)   → Adjust sensitivity                 │ │
│  │  setReducedMotion(bool)      → Toggle animations                  │ │
│  │                                                                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                         toolStore                                  │ │
│  │                                                                    │ │
│  │  STATE                                                             │ │
│  │  ─────                                                             │ │
│  │  activeTool: 'pen' | 'eraser' | 'select'  → Current tool         │ │
│  │  strokeColor: string         → Current stroke color               │ │
│  │  strokeWidth: number         → Current stroke width (1-20)        │ │
│  │                                                                    │ │
│  │  ACTIONS                                                           │ │
│  │  ───────                                                           │ │
│  │  setTool(tool)               → Switch active tool                 │ │
│  │  setColor(color)             → Set stroke color                   │ │
│  │  setWidth(width)             → Set stroke width                   │ │
│  │                                                                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        PERSISTENCE LAYER                                 │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                      localStorage Sync                             │ │
│  │                                                                    │ │
│  │  Keys:                                                             │ │
│  │  ─────                                                             │ │
│  │  'aura-board-data'     → { strokes, shapes }                      │ │
│  │  'aura-board-settings' → { theme, locale, autoCorrect, ... }     │ │
│  │                                                                    │ │
│  │  Behavior:                                                         │ │
│  │  ─────────                                                         │ │
│  │  • Auto-save on every state change (debounced 500ms)             │ │
│  │  • Auto-restore on app load                                       │ │
│  │  • Graceful fallback if localStorage unavailable                 │ │
│  │                                                                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Types

```typescript
interface Point {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

interface Stroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
  timestamp: number;
}

interface Shape {
  id: string;
  type: 'line' | 'circle' | 'rectangle' | 'triangle' | 'arrow' | 'checkmark' | 'xmark';
  params: ShapeParams;  // Varies by type
  color: string;
  width: number;
  originalStrokeId: string;
}

interface HistoryState {
  strokes: Stroke[];
  shapes: Shape[];
  timestamp: number;
}
```

## State Flow

```
   User Action
       │
       ▼
 ┌───────────┐     ┌───────────┐     ┌───────────┐
 │   Store   │────▶│  Persist  │────▶│ localStorage
 │   Update  │     │  (debounce)│    │           │
 └───────────┘     └───────────┘     └───────────┘
       │
       ▼
 ┌───────────┐
 │   React   │
 │  Re-render│
 └───────────┘
```
