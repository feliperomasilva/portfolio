import React from 'react';
import { motion } from 'framer-motion';
import { useScrollProgress } from '../hooks/useCustom';

const ScrollProgress = () => {
  const progress = useScrollProgress();

  return (
    <>
      {/* Vertical progress line - left side */}
      <motion.div
        style={{
          position: 'fixed',
          left: 'var(--space-md)',
          top: 0,
          bottom: 0,
          width: '2px',
          background: 'linear-gradient(to bottom, var(--color-accent-blue), rgba(14, 165, 233, 0))',
          zIndex: 30,
          opacity: 1,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to bottom, var(--color-accent-blue), var(--color-accent-cyan))',
            width: '100%',
            height: `${progress}%`,
            transformOrigin: 'top',
          }}
        />
      </motion.div>

      {/* Progress indicator dots - desktop */}
      <motion.div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          gap: 'var(--space-2xl)',
          zIndex: 30,
          opacity: window.innerWidth > 768 ? 1 : 0,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: window.innerWidth > 768 ? 1 : 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {[
          { label: 'Hero', position: 0 },
          { label: 'About', position: 20 },
          { label: 'Skills', position: 40 },
          { label: 'Projects', position: 60 },
          { label: 'Contact', position: 80 },
        ].map((item) => (
          <motion.div
            key={item.label}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            animate={{
              scale: Math.abs(progress - item.position) < 15 ? 1.3 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--color-accent-blue)',
                cursor: 'pointer',
                boxShadow: Math.abs(progress - item.position) < 15 ? '0 0 16px rgba(14, 165, 233, 0.8)' : '0 0 0px rgba(14, 165, 233, 0)',
                transition: 'box-shadow var(--transition-smooth)',
              }}
            />

            <span
              style={{
                position: 'absolute',
                left: '1.5rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-accent-blue)',
                whiteSpace: 'nowrap',
                opacity: Math.abs(progress - item.position) < 15 ? 1 : 0,
                transition: 'opacity var(--transition-smooth)',
                pointerEvents: 'none',
              }}
            >
              {item.label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom progress percentage - mobile */}
      <motion.div
        style={{
          position: 'fixed',
          bottom: 'var(--space-md)',
          right: 'var(--space-md)',
          zIndex: 30,
          padding: 'var(--space-sm)',
          borderRadius: '9999px',
          backgroundColor: 'rgba(10, 20, 40, 0.8)',
          border: '1px solid rgba(14, 165, 233, 0.3)',
          backdropFilter: 'blur(8px)',
          display: window.innerWidth > 768 ? 'none' : 'block',
          opacity: 1,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <span style={{
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-accent-blue)',
        }}>
          {Math.round(progress)}%
        </span>
      </motion.div>
    </>
  );
};

export default ScrollProgress;
