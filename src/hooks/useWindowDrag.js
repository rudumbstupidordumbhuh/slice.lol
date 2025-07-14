import { useState, useRef, useCallback, useEffect } from 'react';

export function useWindowDrag() {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const windowRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    // Only allow dragging from titlebar
    if (!e.target.closest('.window-titlebar') || e.target.closest('.window-control')) {
      return;
    }

    e.preventDefault();
    setIsDragging(true);
    
    const rect = windowRef.current.getBoundingClientRect();
    dragStart.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Add dragging class to window
    if (windowRef.current) {
      windowRef.current.classList.add('dragging');
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !windowRef.current) return;

    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;

    // Keep window within viewport bounds
    const maxX = window.innerWidth - windowRef.current.offsetWidth;
    const maxY = window.innerHeight - windowRef.current.offsetHeight;
    
    const clampedX = Math.max(0, Math.min(newX, maxX));
    const clampedY = Math.max(0, Math.min(newY, maxY));

    setPosition({ x: clampedX, y: clampedY });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      windowRef.current?.classList.remove('dragging');
    }
  }, [isDragging]);

  // Add global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    windowRef,
    position,
    isDragging,
    handleMouseDown
  };
} 