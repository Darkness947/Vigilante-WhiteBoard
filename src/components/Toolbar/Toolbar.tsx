// Toolbar Component - Main UI for tool selection, colors, and settings
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToolStore, useSettingsStore, useBoardStore } from '../../store';
import { LanguageSwitcher } from '../LanguageSwitcher';
import styles from './Toolbar.module.css';

// Tool icons as SVG components
const PenIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
    </svg>
);

const EraserIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8L14.8 1.4c.8-.8 2-.8 2.8 0L21 5c.8.8.8 2 0 2.8L9 20" />
    </svg>
);

const SelectIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        <path d="M13 13l6 6" />
    </svg>
);

const UndoIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7v6h6" />
        <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6.36 2.64L3 13" />
    </svg>
);

const RedoIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 7v6h-6" />
        <path d="M3 17a9 9 0 019-9 9 9 0 016.36 2.64L21 13" />
    </svg>
);

const TrashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
);

const SunIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
);

const MoonIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

// Animation variants
const toolbarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }
    },
};

const buttonVariants = {
    tap: { scale: 0.95 },
    hover: { scale: 1.05 },
};

const colorPickerVariants = {
    hidden: { opacity: 0, scale: 0.9, y: -10 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.2 }
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        y: -10,
        transition: { duration: 0.15 }
    },
};

export const Toolbar: React.FC = () => {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showWidthPicker, setShowWidthPicker] = useState(false);

    // Store hooks
    const { activeTool, setTool, strokeColor, setColor, strokeWidth, setWidth, colorPalette } = useToolStore();
    const { theme, toggleTheme, autoCorrect, toggleAutoCorrect, reducedMotion } = useSettingsStore();
    const { undo, redo, clear, historyIndex, history } = useBoardStore();

    const canUndo = historyIndex >= 0;
    const canRedo = historyIndex < history.length - 1;

    const handleColorSelect = useCallback((color: string) => {
        setColor(color);
        setShowColorPicker(false);
    }, [setColor]);

    const handleWidthChange = useCallback((width: number) => {
        setWidth(width);
    }, [setWidth]);

    return (
        <motion.div
            className={styles.toolbar}
            variants={toolbarVariants}
            initial={reducedMotion ? 'visible' : 'hidden'}
            animate="visible"
        >
            {/* Tool Selection */}
            <div className={styles.toolGroup}>
                <motion.button
                    className={`${styles.toolButton} ${activeTool === 'pen' ? styles.active : ''}`}
                    onClick={() => setTool('pen')}
                    variants={buttonVariants}
                    whileTap="tap"
                    whileHover="hover"
                    title="Pen (P)"
                >
                    <PenIcon />
                </motion.button>

                <motion.button
                    className={`${styles.toolButton} ${activeTool === 'eraser' ? styles.active : ''}`}
                    onClick={() => setTool('eraser')}
                    variants={buttonVariants}
                    whileTap="tap"
                    whileHover="hover"
                    title="Eraser (E)"
                >
                    <EraserIcon />
                </motion.button>

                <motion.button
                    className={`${styles.toolButton} ${activeTool === 'select' ? styles.active : ''}`}
                    onClick={() => setTool('select')}
                    variants={buttonVariants}
                    whileTap="tap"
                    whileHover="hover"
                    title="Select (V)"
                >
                    <SelectIcon />
                </motion.button>
            </div>

            <div className={styles.divider} />

            {/* Color & Width */}
            <div className={styles.toolGroup}>
                <div className={styles.colorWrapper}>
                    <motion.button
                        className={styles.colorButton}
                        style={{ backgroundColor: strokeColor }}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        variants={buttonVariants}
                        whileTap="tap"
                        whileHover="hover"
                        title="Color"
                    />

                    <AnimatePresence>
                        {showColorPicker && (
                            <motion.div
                                className={styles.colorPicker}
                                variants={colorPickerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                {colorPalette.map((color) => (
                                    <button
                                        key={color}
                                        className={`${styles.colorSwatch} ${color === strokeColor ? styles.selectedColor : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => handleColorSelect(color)}
                                    >
                                        {color === strokeColor && <CheckIcon />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className={styles.widthWrapper}>
                    <motion.button
                        className={styles.widthButton}
                        onClick={() => setShowWidthPicker(!showWidthPicker)}
                        variants={buttonVariants}
                        whileTap="tap"
                        whileHover="hover"
                        title="Stroke Width"
                    >
                        <div
                            className={styles.widthPreview}
                            style={{ width: strokeWidth * 2, height: strokeWidth * 2 }}
                        />
                    </motion.button>

                    <AnimatePresence>
                        {showWidthPicker && (
                            <motion.div
                                className={styles.widthPicker}
                                variants={colorPickerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={strokeWidth}
                                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                                    className={styles.widthSlider}
                                />
                                <span className={styles.widthLabel}>{strokeWidth}px</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className={styles.divider} />

            {/* Actions */}
            <div className={styles.toolGroup}>
                <motion.button
                    className={`${styles.toolButton} ${!canUndo ? styles.disabled : ''}`}
                    onClick={undo}
                    disabled={!canUndo}
                    variants={buttonVariants}
                    whileTap={canUndo ? 'tap' : undefined}
                    whileHover={canUndo ? 'hover' : undefined}
                    title="Undo (Ctrl+Z)"
                >
                    <UndoIcon />
                </motion.button>

                <motion.button
                    className={`${styles.toolButton} ${!canRedo ? styles.disabled : ''}`}
                    onClick={redo}
                    disabled={!canRedo}
                    variants={buttonVariants}
                    whileTap={canRedo ? 'tap' : undefined}
                    whileHover={canRedo ? 'hover' : undefined}
                    title="Redo (Ctrl+Y)"
                >
                    <RedoIcon />
                </motion.button>

                <motion.button
                    className={styles.toolButton}
                    onClick={clear}
                    variants={buttonVariants}
                    whileTap="tap"
                    whileHover="hover"
                    title="Clear Canvas"
                >
                    <TrashIcon />
                </motion.button>
            </div>

            <div className={styles.divider} />

            {/* Settings */}
            <div className={styles.toolGroup}>
                <motion.button
                    className={`${styles.toolButton} ${autoCorrect ? styles.active : ''}`}
                    onClick={toggleAutoCorrect}
                    variants={buttonVariants}
                    whileTap="tap"
                    whileHover="hover"
                    title={`Shape Recognition: ${autoCorrect ? 'ON' : 'OFF'}`}
                >
                    <span className={styles.autoCorrectIcon}>AI</span>
                </motion.button>

                <motion.button
                    className={styles.toolButton}
                    onClick={toggleTheme}
                    variants={buttonVariants}
                    whileTap="tap"
                    whileHover="hover"
                    title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                >
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </motion.button>

                <LanguageSwitcher />
            </div>
        </motion.div>
    );
};

export default Toolbar;
