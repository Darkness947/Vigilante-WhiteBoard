// Shape Morph Animation Component
// Animates the transition from stroke to recognized shape
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Shape, Stroke } from '../../types';

interface ShapeMorphProps {
    originalStroke: Stroke | null;
    recognizedShape: Shape | null;
    onComplete: () => void;
    duration?: number;
}

export const ShapeMorph: React.FC<ShapeMorphProps> = ({
    originalStroke,
    recognizedShape,
    onComplete,
    duration = 0.4,
}) => {
    const [phase, setPhase] = useState<'stroke' | 'morphing' | 'shape'>('stroke');

    useEffect(() => {
        if (!originalStroke || !recognizedShape) return;

        // Start morphing animation
        setPhase('morphing');

        const morphTimer = setTimeout(() => {
            setPhase('shape');
        }, duration * 500);

        const completeTimer = setTimeout(() => {
            onComplete();
        }, duration * 1000);

        return () => {
            clearTimeout(morphTimer);
            clearTimeout(completeTimer);
        };
    }, [originalStroke, recognizedShape, duration, onComplete]);

    if (!originalStroke || !recognizedShape) return null;

    return (
        <AnimatePresence>
            {phase !== 'shape' && (
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{
                        opacity: phase === 'morphing' ? 0.5 : 1,
                        scale: phase === 'morphing' ? 1.02 : 1,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: duration / 2 }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                    }}
                >
                    {/* This would render the stroke being morphed */}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Hook for managing shape morphing state
export function useShapeMorph() {
    const [morphingStroke, setMorphingStroke] = useState<Stroke | null>(null);
    const [morphingShape, setMorphingShape] = useState<Shape | null>(null);
    const [isMorphing, setIsMorphing] = useState(false);

    const startMorph = (stroke: Stroke, shape: Shape) => {
        setMorphingStroke(stroke);
        setMorphingShape(shape);
        setIsMorphing(true);
    };

    const completeMorph = () => {
        setMorphingStroke(null);
        setMorphingShape(null);
        setIsMorphing(false);
    };

    return {
        morphingStroke,
        morphingShape,
        isMorphing,
        startMorph,
        completeMorph,
    };
}

export default ShapeMorph;
