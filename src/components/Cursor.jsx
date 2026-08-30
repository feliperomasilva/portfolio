import React, { useEffect, useRef, useState } from 'react';
import { useMousePosition, useViewportSize } from '../hooks/useCustom';

const Cursor = () => {
  const mousePosition = useMousePosition();
  const viewport = useViewportSize();
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || window.matchMedia('(hover: none)').matches);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [viewport.width]);

  useEffect(() => {
    if (isMobile) return;

    const handleMouseOver = (e) => {
      const isInteractive =
        e.target.tagName === 'BUTTON' ||
        e.target.tagName === 'A' ||
        e.target.classList.contains('interactive') ||
        e.target.closest('button') ||
        e.target.closest('a');

      if (isInteractive) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = () => {
      setIsHovering(false);
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [isMobile]);

  useEffect(() => {
    if (isMobile || !cursorRef.current || !ringRef.current) return;

    if (cursorRef.current) {
      cursorRef.current.style.left = `${mousePosition.x}px`;
      cursorRef.current.style.top = `${mousePosition.y}px`;
    }

    if (ringRef.current) {
      ringRef.current.style.left = `${mousePosition.x}px`;
      ringRef.current.style.top = `${mousePosition.y}px`;
    }
  }, [mousePosition, isMobile]);

  if (isMobile) return null;

  return (
    <>
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 50,
          transform: `translate(-50%, -50%) scale(${isHovering ? 0.75 : 1})`,
          width: '8px',
          height: '8px',
          backgroundColor: 'var(--color-accent-blue)',
          borderRadius: '50%',
          boxShadow: '0 0 8px rgba(14, 165, 233, 0.6)',
          transition: 'transform 0.1s',
        }}
      />

      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 50,
          transform: `translate(-50%, -50%) scale(${isHovering ? 1.5 : 1})`,
          width: '32px',
          height: '32px',
          border: '1.5px solid rgba(14, 165, 233, 0.5)',
          borderRadius: '50%',
          transition: 'transform 0.2s',
        }}
      />

      <style>{`
        * {
          cursor: none !important;
        }
        input, textarea, select {
          cursor: text !important;
        }
      `}</style>
    </>
  );
};

export default Cursor;
