# Vigilante WhiteBoard

<p align="center">
  <img src="public/favicon.png" alt="Vigilante WhiteBoard Logo" width="120" />
</p>

<p align="center">
  <strong>A pure front-end intelligent whiteboard with automatic shape recognition</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#documentation">Documentation</a>
</p>

---

## Overview

Vigilante WhiteBoard is a modern, lightweight whiteboard application that runs entirely in your browser. Draw naturally with your mouse, touch, or stylus, and watch as your rough sketches are automatically recognized and converted into clean geometric shapes.

**No backend. No AI APIs. No data leaves your device.**

---

## Features

### 🎨 Drawing Engine
- Smooth freehand drawing with Catmull-Rom spline interpolation
- Pressure-sensitive stylus support
- 10-color palette with adjustable stroke width (1-20px)
- 60fps rendering performance

### 🔷 Shape Recognition
Automatically recognizes and corrects:
- **Lines** - Straight lines with angle snapping
- **Circles** - Perfect circles from rough ovals
- **Rectangles & Squares** - Clean corners and edges
- **Triangles** - Three-sided shapes
- **Arrows** - Lines with arrowheads
- **Checkmarks & X-marks** - Common symbols

### 🛠️ Tools
| Tool | Shortcut | Description |
|------|----------|-------------|
| Pen | `P` | Freehand drawing |
| Eraser | `E` | Remove strokes/shapes |
| Select | `V` | Select and delete elements |

### ⌨️ Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `D` | Toggle dark mode |
| `A` | Toggle auto-correct |
| `Delete` | Delete selected |

### 📄 Multi-Page Support
- Create unlimited whiteboard pages
- Switch between pages instantly
- Each page maintains independent content

### 🌍 Localization
- **English** (LTR)
- **Arabic** (RTL) with full layout mirroring

### 🌓 Theming
- Light and dark modes
- Respects system preference
- Persisted to localStorage

---

## Demo

> https://vigilante-whiteboard-dev.netlify.app

---

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Vigilante-WhiteBoard.git

# Navigate to project directory
cd Vigilante-WhiteBoard

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

---

## Usage

1. **Draw** - Select the Pen tool and draw on the canvas
2. **Auto-correct** - Enable the AI button to automatically convert sketches to shapes
3. **Erase** - Use the Eraser tool to remove elements
4. **Select** - Click elements to select, then press Delete to remove
5. **Pages** - Click the Pages button to manage multiple whiteboards
6. **Theme** - Toggle between light and dark modes

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Zustand | State Management |
| Framer Motion | Animations |
| Vitest | Testing |

---

## Project Structure

```
├── src/
│   ├── components/      # React components
│   │   ├── Canvas/      # Drawing canvas
│   │   ├── Toolbar/     # Main toolbar
│   │   └── PageNavigator/
│   ├── engine/          # Core logic
│   │   ├── drawing/     # Rendering
│   │   └── recognition/ # Shape detection
│   ├── store/           # Zustand stores
│   ├── geometry/        # Math utilities
│   ├── hooks/           # Custom hooks
│   ├── i18n/            # Translations
│   └── types/           # TypeScript types
├── docs/                # Documentation
├── diagrams/            # Architecture diagrams
├── reports/             # Phase reports
└── tests/               # Test suites
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Requirements](docs/requirements.md) | Functional & non-functional requirements |
| [Features](docs/features.md) | Detailed feature documentation |
| [Final Report](docs/final-report.md) | Project completion report |

### Architecture Diagrams

| Diagram | Description |
|---------|-------------|
| [Architecture](diagrams/architecture.md) | System architecture overview |
| [Drawing Pipeline](diagrams/drawing-pipeline.md) | Stroke processing flow |
| [Shape Recognition](diagrams/shape-recognition.md) | Recognition algorithm |
| [State Management](diagrams/state-management.md) | Zustand store design |

### Phase Reports

| Phase | Status |
|-------|--------|
| [Phase 1: Planning](reports/phase-1-report.md) | ✅ Complete |
| [Phase 2: Drawing Engine](reports/phase-2-report.md) | ✅ Complete |
| [Phase 3: Shape Recognition](reports/phase-3-report.md) | ✅ Complete |
| [Phase 4: UI/Motion/UX](reports/phase-4-report.md) | ✅ Complete |
| [Phase 5: Localization](reports/phase-5-report.md) | ✅ Complete |

---

## Performance

| Metric | Value |
|--------|-------|
| Bundle Size | 112 KB (gzipped) |
| Tests | 49 passing |
| Drawing FPS | 60+ |
| Build Time | ~2 seconds |

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Latest 2 |
| Firefox | Latest 2 |
| Safari | Latest 2 |
| Edge | Latest 2 |
| iOS Safari | Latest |
| Android Chrome | Latest |

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<p align="center">
  Made with ❤️ by Hussain Alhumaidi
</p>
