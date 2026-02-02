// Internationalization (i18n) System
// Simple, lightweight i18n without external dependencies

export type LocaleCode = 'en' | 'ar';

export interface TranslationStrings {
    // Tools
    pen: string;
    eraser: string;
    select: string;

    // Actions
    undo: string;
    redo: string;
    clear: string;

    // Settings
    color: string;
    strokeWidth: string;
    shapeRecognition: string;
    darkMode: string;
    lightMode: string;

    // Notifications
    shapeRecognized: string;
    canvasCleared: string;

    // Tooltips
    penTooltip: string;
    eraserTooltip: string;
    selectTooltip: string;
    undoTooltip: string;
    redoTooltip: string;
    clearTooltip: string;
    colorTooltip: string;
    widthTooltip: string;
    aiOnTooltip: string;
    aiOffTooltip: string;
    themeTooltip: string;
}

const translations: Record<LocaleCode, TranslationStrings> = {
    en: {
        // Tools
        pen: 'Pen',
        eraser: 'Eraser',
        select: 'Select',

        // Actions
        undo: 'Undo',
        redo: 'Redo',
        clear: 'Clear',

        // Settings
        color: 'Color',
        strokeWidth: 'Stroke Width',
        shapeRecognition: 'Shape Recognition',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',

        // Notifications
        shapeRecognized: 'Shape recognized: {shape}',
        canvasCleared: 'Canvas cleared',

        // Tooltips
        penTooltip: 'Pen (P)',
        eraserTooltip: 'Eraser (E)',
        selectTooltip: 'Select (V)',
        undoTooltip: 'Undo (Ctrl+Z)',
        redoTooltip: 'Redo (Ctrl+Y)',
        clearTooltip: 'Clear Canvas',
        colorTooltip: 'Color',
        widthTooltip: 'Stroke Width',
        aiOnTooltip: 'Shape Recognition: ON',
        aiOffTooltip: 'Shape Recognition: OFF',
        themeTooltip: 'Switch to {theme} Mode',
    },
    ar: {
        // Tools
        pen: 'قلم',
        eraser: 'ممحاة',
        select: 'تحديد',

        // Actions
        undo: 'تراجع',
        redo: 'إعادة',
        clear: 'مسح',

        // Settings
        color: 'اللون',
        strokeWidth: 'عرض الخط',
        shapeRecognition: 'التعرف على الأشكال',
        darkMode: 'الوضع الداكن',
        lightMode: 'الوضع الفاتح',

        // Notifications
        shapeRecognized: 'تم التعرف على الشكل: {shape}',
        canvasCleared: 'تم مسح اللوحة',

        // Tooltips
        penTooltip: 'قلم (P)',
        eraserTooltip: 'ممحاة (E)',
        selectTooltip: 'تحديد (V)',
        undoTooltip: 'تراجع (Ctrl+Z)',
        redoTooltip: 'إعادة (Ctrl+Y)',
        clearTooltip: 'مسح اللوحة',
        colorTooltip: 'اللون',
        widthTooltip: 'عرض الخط',
        aiOnTooltip: 'التعرف على الأشكال: مفعّل',
        aiOffTooltip: 'التعرف على الأشكال: معطّل',
        themeTooltip: 'التبديل إلى الوضع {theme}',
    },
};

// Shape name translations
const shapeNames: Record<LocaleCode, Record<string, string>> = {
    en: {
        line: 'Line',
        circle: 'Circle',
        rectangle: 'Rectangle',
        square: 'Square',
        triangle: 'Triangle',
        arrow: 'Arrow',
        checkmark: 'Checkmark',
        xmark: 'X Mark',
    },
    ar: {
        line: 'خط',
        circle: 'دائرة',
        rectangle: 'مستطيل',
        square: 'مربع',
        triangle: 'مثلث',
        arrow: 'سهم',
        checkmark: 'علامة صح',
        xmark: 'علامة خطأ',
    },
};

export function getTranslation(locale: LocaleCode, key: keyof TranslationStrings): string {
    return translations[locale][key] || translations.en[key] || key;
}

export function getShapeName(locale: LocaleCode, shape: string): string {
    return shapeNames[locale][shape] || shapeNames.en[shape] || shape;
}

export function formatString(template: string, values: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => values[key] || `{${key}}`);
}

// Hook for using translations
import { useCallback } from 'react';
import { useSettingsStore } from '../store';

export function useTranslation() {
    const { locale } = useSettingsStore();

    const t = useCallback((key: keyof TranslationStrings) => {
        return getTranslation(locale, key);
    }, [locale]);

    const tShape = useCallback((shape: string) => {
        return getShapeName(locale, shape);
    }, [locale]);

    const format = useCallback((template: string, values: Record<string, string>) => {
        return formatString(template, values);
    }, []);

    return { t, tShape, format, locale };
}

export default translations;
