// Language Switcher Component
import React from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../store';
import type { LocaleType } from '../../types';
import styles from './LanguageSwitcher.module.css';

const buttonVariants = {
    tap: { scale: 0.95 },
    hover: { scale: 1.05 },
};

export const LanguageSwitcher: React.FC = () => {
    const { locale, setLocale } = useSettingsStore();

    const handleSwitch = () => {
        const newLocale: LocaleType = locale === 'en' ? 'ar' : 'en';
        setLocale(newLocale);
    };

    return (
        <motion.button
            className={styles.switcher}
            onClick={handleSwitch}
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
            title={locale === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
        >
            <span className={styles.flag}>
                {locale === 'en' ? '🇸🇦' : '🇺🇸'}
            </span>
            <span className={styles.label}>
                {locale === 'en' ? 'AR' : 'EN'}
            </span>
        </motion.button>
    );
};

export default LanguageSwitcher;
