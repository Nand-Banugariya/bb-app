'use client';
import { useEffect } from 'react';

/**
 * Drag-to-resize table columns: every element matching `resizeElementsClass` acts as a
 * handle that resizes its parent (e.g. a `<th>`) up to `containerWidth` px.
 */
export default function useResizer({ containerWidth = 300, resizeElementsClass = '.resizer' }) {
    useEffect(() => {
        const handles = Array.from(document.querySelectorAll<HTMLElement>(resizeElementsClass));
        let current: HTMLElement | null = null;

        const handleMouseMove = (e: MouseEvent) => {
            const column = current?.parentElement;
            if (!column) return;
            const newWidth = parseInt(window.getComputedStyle(column).width) + e.movementX;
            if (newWidth < containerWidth) column.style.width = `${newWidth}px`;
        };
        const handleMouseUp = () => {
            current = null;
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        const handleMouseDown = (e: MouseEvent) => {
            e.preventDefault();
            current = e.currentTarget as HTMLElement;
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        };

        handles.forEach((handle) => handle.addEventListener('mousedown', handleMouseDown));
        return () => {
            handles.forEach((handle) => handle.removeEventListener('mousedown', handleMouseDown));
            handleMouseUp();
        };
    }, [containerWidth, resizeElementsClass]);
}
