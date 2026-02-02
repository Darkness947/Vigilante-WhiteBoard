// Toast Notification Component
// Shows feedback messages for user actions
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Toast.module.css';

export interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
}

interface ToastProps {
    messages: ToastMessage[];
    onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ messages, onDismiss }) => {
    return (
        <div className={styles.toastContainer}>
            <AnimatePresence>
                {messages.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
                ))}
            </AnimatePresence>
        </div>
    );
};

interface ToastItemProps {
    toast: ToastMessage;
    onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, toast.duration || 3000);

        return () => clearTimeout(timer);
    }, [toast, onDismiss]);

    return (
        <motion.div
            className={`${styles.toast} ${styles[toast.type]}`}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={() => onDismiss(toast.id)}
        >
            <span className={styles.icon}>
                {toast.type === 'success' && '✓'}
                {toast.type === 'error' && '✕'}
                {toast.type === 'info' && 'ℹ'}
            </span>
            <span className={styles.message}>{toast.message}</span>
        </motion.div>
    );
};

// Hook for managing toasts
export function useToast() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info', duration = 3000) => {
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
    const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
    const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);

    return {
        toasts,
        showToast,
        dismissToast,
        success,
        error,
        info,
    };
}

export default Toast;
