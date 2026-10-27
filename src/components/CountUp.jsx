import React, { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

const CountUp = ({ value, prefix = '', suffix = '', duration = 1.4 }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-40px' });
    const prefersReducedMotion = useReducedMotion();
    const [display, setDisplay] = useState(0);
    const target = Number(value) || 0;

    useEffect(() => {
        if (!isInView) return;
        if (prefersReducedMotion) {
            setDisplay(target);
            return;
        }
        const controls = animate(0, target, {
            duration,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: (latest) => setDisplay(Math.round(latest)),
        });
        return () => controls.stop();
    }, [isInView, prefersReducedMotion, target, duration]);

    return (
        <span ref={ref}>
            {prefix}{display.toLocaleString('en-US')}{suffix}
        </span>
    );
};

export default CountUp;
