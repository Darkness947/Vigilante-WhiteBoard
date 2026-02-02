// Settings Store - manages theme, locale, and drawing settings
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeType, LocaleType } from '../types';

interface SettingsState {
    // State
    theme: ThemeType;
    locale: LocaleType;
    autoCorrect: boolean;
    confidenceThreshold: number;
    reducedMotion: boolean;

    // Actions
    setTheme: (theme: ThemeType) => void;
    toggleTheme: () => void;
    setLocale: (locale: LocaleType) => void;
    toggleLocale: () => void;
    setAutoCorrect: (enabled: boolean) => void;
    toggleAutoCorrect: () => void;
    setConfidenceThreshold: (threshold: number) => void;
    setReducedMotion: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            // Initial state - detect system preferences
            theme: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light',
            locale: 'en',
            autoCorrect: true,
            confidenceThreshold: 0.75,
            reducedMotion: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,

            setTheme: (theme) => set({ theme }),

            toggleTheme: () => {
                const { theme } = get();
                set({ theme: theme === 'light' ? 'dark' : 'light' });
            },

            setLocale: (locale) => set({ locale }),

            toggleLocale: () => {
                const { locale } = get();
                set({ locale: locale === 'en' ? 'ar' : 'en' });
            },

            setAutoCorrect: (enabled) => set({ autoCorrect: enabled }),

            toggleAutoCorrect: () => {
                const { autoCorrect } = get();
                set({ autoCorrect: !autoCorrect });
            },

            setConfidenceThreshold: (threshold) => {
                // Clamp between 0.5 and 0.95
                const clamped = Math.max(0.5, Math.min(0.95, threshold));
                set({ confidenceThreshold: clamped });
            },

            setReducedMotion: (enabled) => set({ reducedMotion: enabled }),
        }),
        {
            name: 'aura-board-settings',
        }
    )
);
