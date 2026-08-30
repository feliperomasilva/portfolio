import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useCustom';
import { contactContent } from '../data/content';

const Contact = () => {
  const { ref: contactRef, isInView } = useInView({ threshold: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
  };

  const linkVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section
      id="contact"
      ref={contactRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-2xl) var(--space-md)',
      }}
    >
      <motion.div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '64rem',
          width: '100%',
          textAlign: 'center',
        }}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <motion.h2
          variants={itemVariants}
          style={{
            marginBottom: 'var(--space-lg)',
            textWrap: 'balance',
          }}
        >
          {contactContent.title}
        </motion.h2>

        <motion.p
          variants={itemVariants}
          style={{
            fontSize: '1rem',
            color: 'var(--color-text-secondary)',
            maxWidth: '48rem',
            margin: '0 auto var(--space-2xl)',
            lineHeight: '1.7',
          }}
        >
          {contactContent.subtitle}
        </motion.p>

        <motion.div variants={itemVariants} style={{ marginBottom: 'var(--space-2xl)' }}>
          <a
            href={`mailto:${contactContent.email}`}
            style={{
              display: 'inline-block',
              position: 'relative',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--color-accent-cyan)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--color-accent-blue)'}
          >
            <div style={{
              fontSize: 'clamp(1.875rem, 5vw, 3rem)',
              fontFamily: 'var(--font-display)',
              fontWeight: 'bold',
              color: 'var(--color-accent-blue)',
              transition: 'color var(--transition-smooth)',
            }}>
              {contactContent.email}
            </div>
            <motion.div
              style={{
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(to right, transparent, var(--color-accent-blue), transparent)',
                scaleX: 0,
                transformOrigin: 'center',
              }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </a>
        </motion.div>

        <motion.div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 'var(--space-md)',
            alignItems: 'center',
          }}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {contactContent.links.map((link, index) => (
            <motion.a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: 'relative',
                padding: 'var(--space-sm) var(--space-md)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--color-accent-blue)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'all var(--transition-smooth)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              variants={linkVariants}
              custom={index}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.6)';
                e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.1)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.3)';
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-accent-blue)';
              }}
            >
              <span>{link.label}</span>
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                →
              </motion.span>
            </motion.a>
          ))}
        </motion.div>

        <motion.p
          variants={itemVariants}
          style={{
            marginTop: 'var(--space-2xl)',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Designed and built with care in 2024
        </motion.p>

        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 'calc(25%)',
            width: '256px',
            height: '256px',
            background: 'var(--color-accent-blue)',
            opacity: 0.05,
            filter: 'blur(96px)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 'calc(25%)',
            width: '320px',
            height: '320px',
            background: 'var(--color-accent-cyan)',
            opacity: 0.03,
            filter: 'blur(96px)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
          animate={{
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </motion.div>

      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(14, 165, 233, 0.3), transparent)',
        }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      />
    </section>
  );
};

export default Contact;
