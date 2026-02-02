// Pages Store - manages multiple whiteboard pages
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../types';
import type { Stroke, Shape } from '../types';

export interface Page {
    id: string;
    name: string;
    strokes: Stroke[];
    shapes: Shape[];
    createdAt: number;
}

interface PagesState {
    // State
    pages: Page[];
    currentPageId: string;

    // Actions
    addPage: () => string;
    deletePage: (pageId: string) => void;
    switchPage: (pageId: string) => void;
    renamePage: (pageId: string, name: string) => void;
    getCurrentPage: () => Page;
    updateCurrentPage: (strokes: Stroke[], shapes: Shape[]) => void;
}

const createEmptyPage = (name: string = 'Page 1'): Page => ({
    id: generateId(),
    name,
    strokes: [],
    shapes: [],
    createdAt: Date.now(),
});

export const usePagesStore = create<PagesState>()(
    persist(
        (set, get) => {
            const initialPage = createEmptyPage();

            return {
                pages: [initialPage],
                currentPageId: initialPage.id,

                addPage: () => {
                    const { pages } = get();
                    const newPage = createEmptyPage(`Page ${pages.length + 1}`);

                    set({
                        pages: [...pages, newPage],
                        currentPageId: newPage.id,
                    });

                    return newPage.id;
                },

                deletePage: (pageId) => {
                    const { pages, currentPageId } = get();

                    // Don't delete if it's the only page
                    if (pages.length <= 1) return;

                    const newPages = pages.filter(p => p.id !== pageId);

                    // If deleting current page, switch to first available
                    let newCurrentId = currentPageId;
                    if (currentPageId === pageId) {
                        newCurrentId = newPages[0].id;
                    }

                    set({
                        pages: newPages,
                        currentPageId: newCurrentId,
                    });
                },

                switchPage: (pageId) => {
                    const { pages } = get();
                    const page = pages.find(p => p.id === pageId);

                    if (page) {
                        set({ currentPageId: pageId });
                    }
                },

                renamePage: (pageId, name) => {
                    const { pages } = get();

                    set({
                        pages: pages.map(p =>
                            p.id === pageId ? { ...p, name } : p
                        ),
                    });
                },

                getCurrentPage: () => {
                    const { pages, currentPageId } = get();
                    return pages.find(p => p.id === currentPageId) || pages[0];
                },

                updateCurrentPage: (strokes, shapes) => {
                    const { pages, currentPageId } = get();

                    set({
                        pages: pages.map(p =>
                            p.id === currentPageId
                                ? { ...p, strokes, shapes }
                                : p
                        ),
                    });
                },
            };
        },
        {
            name: 'aura-board-pages',
        }
    )
);
