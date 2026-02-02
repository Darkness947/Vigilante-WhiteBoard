// Keyboard Shortcuts Hook
import { useEffect, useCallback } from 'react';
import { useToolStore, useBoardStore, useSettingsStore } from '../store';

export function useKeyboardShortcuts() {
    const { setTool } = useToolStore();
    const { undo, redo, clear } = useBoardStore();
    const { toggleTheme, toggleAutoCorrect } = useSettingsStore();

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Ignore if user is typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
        }

        const key = e.key.toLowerCase();
        const ctrlOrMeta = e.ctrlKey || e.metaKey;

        // Tool shortcuts (single keys)
        if (!ctrlOrMeta && !e.shiftKey && !e.altKey) {
            switch (key) {
                case 'p':
                    e.preventDefault();
                    setTool('pen');
                    break;
                case 'e':
                    e.preventDefault();
                    setTool('eraser');
                    break;
                case 'v':
                    e.preventDefault();
                    setTool('select');
                    break;
                case 'd':
                    e.preventDefault();
                    toggleTheme();
                    break;
                case 'a':
                    e.preventDefault();
                    toggleAutoCorrect();
                    break;
            }
        }

        // Ctrl/Cmd shortcuts
        if (ctrlOrMeta) {
            switch (key) {
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        redo();
                    } else {
                        undo();
                    }
                    break;
                case 'y':
                    e.preventDefault();
                    redo();
                    break;
                case 'delete':
                case 'backspace':
                    if (e.shiftKey) {
                        e.preventDefault();
                        clear();
                    }
                    break;
            }
        }

        // Escape to deselect or reset
        if (key === 'escape') {
            setTool('pen');
        }
    }, [setTool, undo, redo, clear, toggleTheme, toggleAutoCorrect]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

export default useKeyboardShortcuts;
