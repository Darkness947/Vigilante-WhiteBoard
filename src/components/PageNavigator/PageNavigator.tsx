// Page Navigator Component
// UI for switching between whiteboard pages
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePagesStore, useBoardStore } from '../../store';
import styles from './PageNavigator.module.css';

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
);

const buttonVariants = {
    tap: { scale: 0.95 },
    hover: { scale: 1.02 },
};

export const PageNavigator: React.FC = () => {
    const { pages, currentPageId, addPage, deletePage, switchPage, updateCurrentPage, getCurrentPage } = usePagesStore();
    const { loadPageContent, getCurrentContent, strokes, shapes } = useBoardStore();
    const [isExpanded, setIsExpanded] = useState(false);

    // Save current page content when strokes/shapes change
    useEffect(() => {
        if (currentPageId) {
            updateCurrentPage(strokes, shapes);
        }
    }, [strokes, shapes, currentPageId, updateCurrentPage]);

    // Load page content on mount
    useEffect(() => {
        const currentPage = getCurrentPage();
        if (currentPage) {
            loadPageContent(currentPage.strokes, currentPage.shapes);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    const handleAddPage = useCallback(() => {
        // Save current page first
        const content = getCurrentContent();
        updateCurrentPage(content.strokes, content.shapes);

        // Add new page (this also switches to it)
        addPage();

        // Load empty content for new page
        loadPageContent([], []);
    }, [getCurrentContent, updateCurrentPage, addPage, loadPageContent]);

    const handleSwitchPage = useCallback((pageId: string) => {
        if (pageId === currentPageId) return;

        // Save current page content
        const content = getCurrentContent();
        updateCurrentPage(content.strokes, content.shapes);

        // Switch to new page
        switchPage(pageId);

        // Load new page content
        const targetPage = pages.find(p => p.id === pageId);
        if (targetPage) {
            loadPageContent(targetPage.strokes, targetPage.shapes);
        }
    }, [currentPageId, getCurrentContent, updateCurrentPage, switchPage, pages, loadPageContent]);

    const handleDeletePage = useCallback((e: React.MouseEvent, pageId: string) => {
        e.stopPropagation();
        if (pages.length > 1) {
            const wasCurrentPage = pageId === currentPageId;
            deletePage(pageId);

            // If we deleted the current page, load the new current page's content
            if (wasCurrentPage) {
                const newCurrentPage = pages.find(p => p.id !== pageId);
                if (newCurrentPage) {
                    loadPageContent(newCurrentPage.strokes, newCurrentPage.shapes);
                }
            }
        }
    }, [pages, currentPageId, deletePage, loadPageContent]);

    return (
        <div className={styles.navigator}>
            <motion.button
                className={styles.toggleButton}
                onClick={() => setIsExpanded(!isExpanded)}
                variants={buttonVariants}
                whileTap="tap"
                whileHover="hover"
            >
                <span className={styles.pageCount}>{pages.length}</span>
                <span className={styles.label}>Pages</span>
            </motion.button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className={styles.pageList}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        {pages.map((page, index) => (
                            <motion.div
                                key={page.id}
                                className={`${styles.pageItem} ${page.id === currentPageId ? styles.active : ''}`}
                                onClick={() => handleSwitchPage(page.id)}
                                variants={buttonVariants}
                                whileTap="tap"
                                whileHover="hover"
                            >
                                <span className={styles.pageNumber}>{index + 1}</span>
                                <span className={styles.pageName}>{page.name}</span>
                                {pages.length > 1 && (
                                    <button
                                        className={styles.deleteButton}
                                        onClick={(e) => handleDeletePage(e, page.id)}
                                        title="Delete page"
                                    >
                                        <TrashIcon />
                                    </button>
                                )}
                            </motion.div>
                        ))}

                        <motion.button
                            className={styles.addButton}
                            onClick={handleAddPage}
                            variants={buttonVariants}
                            whileTap="tap"
                            whileHover="hover"
                        >
                            <PlusIcon />
                            <span>Add Page</span>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PageNavigator;
