import { useState, useEffect } from 'react';

export const useCanvasWidth = () => {
    const [width, setWidth] = useState(24);

    useEffect(() => {
        const updateWidth = () => {
            const canvas = document.querySelector("#artboard-main-container") as HTMLElement;
            if (canvas) {
                // Return width in inches (96 DPI)
                setWidth(canvas.offsetWidth / 96);
            }
        };

        // Initial update
        updateWidth();

        // Update on resize
        window.addEventListener('resize', updateWidth);

        // Also update if the container changes (e.g. sidebar open/close)
        const observer = new ResizeObserver(updateWidth);
        const container = document.querySelector("#artboard-main-container");
        if (container) {
            observer.observe(container);
        }

        return () => {
            window.removeEventListener('resize', updateWidth);
            observer.disconnect();
        };
    }, []);

    return width;
};
