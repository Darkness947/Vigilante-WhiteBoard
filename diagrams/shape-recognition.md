# Shape Recognition Flow Diagram

## Overview

Rule-based shape recognition using geometric analysis. No ML/AI required.

## Recognition Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  SHAPE RECOGNITION ENGINE                                │
└─────────────────────────────────────────────────────────────────────────┘

INPUT: Completed Stroke
┌──────────────────────────────────────────────────────────────────────────┐
│   stroke = { points: Point[], startTime, endTime, color, width }         │
└──────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
STAGE 1: FEATURE EXTRACTION
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   ┌────────────────────────────────────────────────────────────────┐    │
│   │  GEOMETRIC FEATURES                                             │    │
│   │                                                                 │    │
│   │  pointCount         = number of sample points                   │    │
│   │  boundingBox        = { x, y, width, height }                   │    │
│   │  aspectRatio        = width / height                            │    │
│   │  pathLength         = total distance along stroke               │    │
│   │  startEndDistance   = distance(firstPoint, lastPoint)           │    │
│   │  closureRatio       = startEndDistance / pathLength             │    │
│   │                                                                 │    │
│   │  CURVATURE FEATURES                                             │    │
│   │                                                                 │    │
│   │  angles[]           = angle change at each point                │    │
│   │  curvatureVariance  = variance of curvature along path          │    │
│   │  totalAngleChange   = sum of absolute angle changes             │    │
│   │  dominantAngles[]   = peaks in angle histogram                  │    │
│   │                                                                 │    │
│   │  STROKE QUALITIES                                               │    │
│   │                                                                 │    │
│   │  velocity           = average drawing speed                     │    │
│   │  cornerCount        = number of sharp angle changes (>30°)      │    │
│   │  cornerPositions[]  = relative positions of corners             │    │
│   │                                                                 │    │
│   └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
STAGE 2: SHAPE CLASSIFICATION
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   Run all detectors in parallel, collect confidence scores:             │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  LINE DETECTOR                                                   │   │
│   │  ─────────────                                                   │   │
│   │  Rules:                                                          │   │
│   │  • Low curvature variance (< threshold)                         │   │
│   │  • Path length ≈ start-to-end distance                          │   │
│   │  • cornerCount == 0                                             │   │
│   │                                                                  │   │
│   │  Output: confidence, suggestedLine(start, end)                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  CIRCLE DETECTOR                                                 │   │
│   │  ───────────────                                                 │   │
│   │  Rules:                                                          │   │
│   │  • closureRatio < 0.15 (closed shape)                           │   │
│   │  • Consistent curvature (low variance)                          │   │
│   │  • All points ~equidistant from center                          │   │
│   │  • aspectRatio ≈ 1.0 (±0.3)                                     │   │
│   │                                                                  │   │
│   │  Output: confidence, suggestedCircle(center, radius)            │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  RECTANGLE DETECTOR                                              │   │
│   │  ──────────────────                                              │   │
│   │  Rules:                                                          │   │
│   │  • closureRatio < 0.15 (closed shape)                           │   │
│   │  • cornerCount == 4                                             │   │
│   │  • Corners at ~90° angles                                       │   │
│   │  • Corners roughly evenly spaced                                │   │
│   │                                                                  │   │
│   │  Output: confidence, suggestedRect(x, y, w, h)                  │   │
│   │  Special: If aspectRatio ≈ 1.0 → Square                         │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  TRIANGLE DETECTOR                                               │   │
│   │  ─────────────────                                               │   │
│   │  Rules:                                                          │   │
│   │  • closureRatio < 0.15 (closed shape)                           │   │
│   │  • cornerCount == 3                                             │   │
│   │  • Sum of internal angles ≈ 180°                                │   │
│   │                                                                  │   │
│   │  Output: confidence, suggestedTriangle(p1, p2, p3)              │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  ARROW DETECTOR                                                  │   │
│   │  ──────────────                                                  │   │
│   │  Rules:                                                          │   │
│   │  • Has a main line segment                                      │   │
│   │  • Has branching at one end (2 short lines, <45° angle each)   │   │
│   │  • Branch lines shorter than main line                          │   │
│   │                                                                  │   │
│   │  Output: confidence, suggestedArrow(start, end, headSize)       │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  SYMBOL DETECTORS (✓ ✕)                                         │   │
│   │  ─────────────────────                                           │   │
│   │  CHECKMARK: 2 connected lines, ~45° and ~135° angles            │   │
│   │  X-MARK: 2 lines crossing near center, ~90° between them        │   │
│   │                                                                  │   │
│   │  Output: confidence, symbolType                                 │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
STAGE 3: CONFIDENCE EVALUATION
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   detections = [                                                         │
│     { type: 'circle', confidence: 0.85, shape: {...} },                 │
│     { type: 'rectangle', confidence: 0.23, shape: {...} },              │
│     ...                                                                  │
│   ]                                                                      │
│                                                                          │
│   bestMatch = max(detections, by: confidence)                           │
│                                                                          │
│   IF bestMatch.confidence >= userThreshold:                             │
│       → Proceed to correction                                           │
│   ELSE:                                                                  │
│       → Keep original stroke (no correction)                            │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
STAGE 4: SHAPE GENERATION & ANIMATION
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   1. Generate perfect vector shape from detection parameters            │
│   2. Calculate morph animation keyframes                                │
│   3. Animate stroke → shape transition (300ms ease-out)                 │
│   4. Replace stroke with shape in state                                 │
│   5. Save to history (for undo)                                         │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## Detection Thresholds

| Parameter | Default | Range | Notes |
|-----------|---------|-------|-------|
| Confidence Threshold | 0.75 | 0.5-0.95 | User adjustable |
| Closure Threshold | 0.15 | - | % of path length |
| Right Angle Tolerance | 15° | - | For rectangle corners |
| Curvature Variance (Line) | 0.05 | - | Lower = straighter |
