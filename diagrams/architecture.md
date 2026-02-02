# Software Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        VIGILANTE WHITEBOARD                              │
│                        (Pure Front-End Application)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                      PRESENTATION LAYER                             │ │
│  │                                                                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │ │
│  │  │   Toolbar    │  │   Settings   │  │    Canvas Component      │  │ │
│  │  │  Component   │  │    Panel     │  │   (Main Drawing Area)    │  │ │
│  │  │              │  │              │  │                          │  │ │
│  │  │  • Tools     │  │  • Theme     │  │  • Touch/Mouse Events    │  │ │
│  │  │  • Colors    │  │  • Language  │  │  • Stroke Rendering      │  │ │
│  │  │  • Actions   │  │  • Settings  │  │  • Shape Display         │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │ │
│  │                                                                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                  │                                       │
│                                  ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                      APPLICATION LAYER                              │ │
│  │                                                                     │ │
│  │  ┌──────────────────┐  ┌───────────────────┐  ┌─────────────────┐  │ │
│  │  │  Drawing Engine  │  │  Recognition      │  │   Animation     │  │ │
│  │  │                  │  │  Engine           │  │   Controller    │  │ │
│  │  │  • Smoothing     │  │                   │  │                 │  │ │
│  │  │  • Interpolation │  │  • Feature        │  │  • Morphing     │  │ │
│  │  │  • Render Loop   │  │    Extraction     │  │  • Transitions  │  │ │
│  │  │                  │  │  • Shape Matching │  │  • Micro-states │  │ │
│  │  └──────────────────┘  │  • Confidence     │  │                 │  │ │
│  │                        └───────────────────┘  └─────────────────┘  │ │
│  │                                                                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                  │                                       │
│                                  ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                         CORE LAYER                                  │ │
│  │                                                                     │ │
│  │  ┌────────────────┐  ┌───────────────┐  ┌────────────────────────┐ │ │
│  │  │   Geometry     │  │    State      │  │    Persistence         │ │ │
│  │  │   Utilities    │  │    Store      │  │    Manager             │ │ │
│  │  │                │  │   (Zustand)   │  │                        │ │ │
│  │  │  • Points      │  │               │  │  • Auto-save           │ │ │
│  │  │  • Vectors     │  │  • Board      │  │  • Restore             │ │ │
│  │  │  • Shapes      │  │  • Settings   │  │  • localStorage        │ │ │
│  │  │  • Algorithms  │  │  • Tools      │  │                        │ │ │
│  │  └────────────────┘  └───────────────┘  └────────────────────────┘ │ │
│  │                                                                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Technology Mapping

| Layer | Technologies |
|-------|-------------|
| Presentation | React 18, CSS Modules, Framer Motion |
| Application | TypeScript, Custom Engines |
| Core | Zustand, localStorage, Pure Math |

## Data Flow

```
User Input → Presentation → Application → Core → Storage
              (Canvas)     (Engines)    (Store)  (localStorage)
                 ↑                         │
                 └─────────────────────────┘
                     (State Updates)
```
