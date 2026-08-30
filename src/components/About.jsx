import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useCustom';
import { aboutContent } from '../data/content';

const About = () => {
  const { ref: aboutRef, isInView } = useInView({ threshold: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
  };

  return (
    <section
      id="about"
      ref={aboutRef}
      style={{
        position: 'relative',
        padding: '8rem var(--space-md)',
      }}
    >
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          style={{ marginBottom: 'var(--space-2xl)' }}
        >
          <motion.span
            variants={itemVariants}
            style={{
              display: 'inline-block',
              padding: '0.5rem var(--space-sm)',
              borderRadius: '9999px',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              color: 'var(--color-accent-blue)',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 'var(--space-md)',
            }}
          >
            About Me
          </motion.span>

          <motion.h2
            variants={itemVariants}
            style={{
              marginBottom: 'var(--space-md)',
            }}
          >
            {aboutContent.title}
          </motion.h2>

          <motion.p
            variants={itemVariants}
            style={{
              fontSize: '1.25rem',
              color: 'var(--color-accent-blue)',
              fontWeight: 300,
              maxWidth: '48rem',
            }}
          >
            {aboutContent.intro}
          </motion.p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-2xl)' }}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
          >
            {aboutContent.description.map((paragraph, index) => (
              <motion.p
                key={index}
                variants={itemVariants}
                style={{
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.7',
                  fontSize: '1rem',
                }}
              >
                {paragraph}
              </motion.p>
            ))}
          </motion.div>

          <motion.div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)' }}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {aboutContent.stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                style={{
                  padding: 'var(--space-md)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(14, 165, 233, 0.2)',
                  background: 'rgba(10, 20, 40, 0.2)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all var(--transition-smooth)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.5)';
                  e.currentTarget.style.backgroundColor = 'rgba(10, 20, 40, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.2)';
                  e.currentTarget.style.backgroundColor = 'rgba(10, 20, 40, 0.2)';
                }}
              >
                <div style={{
                  fontSize: '2rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 'bold',
                  color: 'var(--color-accent-blue)',
                  marginBottom: '0.5rem',
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                  fontWeight: 500,
                }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(14, 165, 233, 0.3), transparent)',
          }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </div>
    </section>
  );
};

export default About;
