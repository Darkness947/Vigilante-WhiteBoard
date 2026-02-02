# Drawing Pipeline Diagram

## Overview

The drawing pipeline handles user input from pointer events through to rendered strokes on the canvas.

## Pipeline Stages

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DRAWING PIPELINE                                  │
└─────────────────────────────────────────────────────────────────────────┘

STAGE 1: INPUT CAPTURE
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   ┌─────────────┐      ┌─────────────┐      ┌─────────────────────────┐ │
│   │   Touch     │      │   Mouse     │      │   Pointer Events API    │ │
│   │   Events    │ ───▶ │   Events    │ ───▶ │   (Unified Handler)     │ │
│   │             │      │             │      │                         │ │
│   └─────────────┘      └─────────────┘      └─────────────────────────┘ │
│                                                      │                   │
└──────────────────────────────────────────────────────┼───────────────────┘
                                                       │
                                                       ▼
STAGE 2: POINT COLLECTION
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                     Point Collector                              │   │
│   │                                                                  │   │
│   │   • Captures (x, y, pressure, timestamp) for each point         │   │
│   │   • Filters duplicate/invalid points                            │   │
│   │   • Maintains current stroke buffer                             │   │
│   │                                                                  │   │
│   │   Raw Points: [{x, y, p, t}, {x, y, p, t}, ...]                 │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                      │                   │
└──────────────────────────────────────────────────────┼───────────────────┘
                                                       │
                                                       ▼
STAGE 3: STROKE SMOOTHING
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    Catmull-Rom Spline Smoother                   │   │
│   │                                                                  │   │
│   │   Input:  [P0, P1, P2, P3, ...]  (raw points)                   │   │
│   │                                                                  │   │
│   │   Algorithm:                                                     │   │
│   │   For each segment (P[i-1], P[i], P[i+1], P[i+2]):              │   │
│   │     Generate interpolated points using Catmull-Rom formula      │   │
│   │                                                                  │   │
│   │   Output: [S0, S1, S2, S3, ...]  (smooth points)                │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                      │                   │
└──────────────────────────────────────────────────────┼───────────────────┘
                                                       │
                                                       ▼
STAGE 4: POINT INTERPOLATION
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    Point Density Optimizer                       │   │
│   │                                                                  │   │
│   │   • Ensures consistent point density along stroke               │   │
│   │   • Removes redundant points in straight sections               │   │
│   │   • Adds points in high-curvature areas                         │   │
│   │   • Adaptive based on stroke velocity                           │   │
│   │                                                                  │   │
│   │   Target: ~2-4 pixel distance between points                    │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                      │                   │
└──────────────────────────────────────────────────────┼───────────────────┘
                                                       │
                                                       ▼
STAGE 5: RENDER LOOP
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │               requestAnimationFrame Loop                         │   │
│   │                                                                  │   │
│   │   60fps Target (or device refresh rate)                         │   │
│   │                                                                  │   │
│   │   Each Frame:                                                    │   │
│   │   1. Check for new points in buffer                             │   │
│   │   2. Clear canvas (or use dirty rect optimization)              │   │
│   │   3. Render all completed strokes                               │   │
│   │   4. Render current in-progress stroke                          │   │
│   │   5. Render any recognized shapes                               │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                      │                   │
└──────────────────────────────────────────────────────┼───────────────────┘
                                                       │
                                                       ▼
STAGE 6: CANVAS OUTPUT
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    HTML5 Canvas 2D Context                       │   │
│   │                                                                  │   │
│   │   • beginPath() / moveTo() / lineTo() / stroke()                │   │
│   │   • Variable line width (pressure sensitivity)                  │   │
│   │   • Round line caps and joins                                   │   │
│   │   • Configurable stroke color                                   │   │
│   │   • Shape primitives (arc, rect, etc.)                          │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## Performance Considerations

| Optimization | Description |
|--------------|-------------|
| Dirty Rect | Only redraw changed regions |
| Point Culling | Skip off-screen points |
| Batch Rendering | Group draw calls |
| Double Buffering | Prevent flicker |
| RAF Throttling | Skip frames on slow devices |
