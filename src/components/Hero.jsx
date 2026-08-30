import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useCustom';

const ScrollIndicator = () => {
  return (
    <motion.div
      style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          Role para explorar
        </span>
        <motion.div
          animate={{ y: [0, 32, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: '2px',
            height: '32px',
            background: 'linear-gradient(to bottom, var(--color-accent-blue), transparent)',
          }}
        />
      </div>
    </motion.div>
  );
};

const Hero = () => {
  const { ref: heroRef, isInView } = useInView({ threshold: 0.3 });

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const textRevealVariants = {
    hidden: { opacity: 0, clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)' },
    visible: {
      opacity: 1,
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      transition: {
        duration: 1,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 var(--space-md)',
        overflow: 'hidden',
        paddingTop: '5rem',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {/* Decorative blur elements */}
        <motion.div
          style={{
            position: 'absolute',
            top: '5rem',
            right: '2.5rem',
            width: '288px',
            height: '288px',
            background: 'var(--color-accent-blue)',
            opacity: 0.1,
            filter: 'blur(96px)',
            borderRadius: '50%',
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            bottom: '8rem',
            left: '2.5rem',
            width: '384px',
            height: '384px',
            background: 'var(--color-accent-cyan)',
            opacity: 0.05,
            filter: 'blur(96px)',
            borderRadius: '50%',
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      <motion.div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '80rem',
          width: '100%',
          textAlign: 'center',
        }}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {/* Label */}
        <motion.div variants={itemVariants} style={{ marginBottom: 'var(--space-lg)' }}>
          <span style={{
            display: 'inline-block',
            padding: '0.5rem var(--space-sm)',
            borderRadius: '9999px',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            color: 'var(--color-accent-cyan)',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            backdropFilter: 'blur(4px)',
          }}>
            ✨ Bem-vindo ao meu portfólio
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.div variants={textRevealVariants} style={{ marginBottom: 'var(--space-lg)' }}>
          <h1 style={{
            color: 'white',
            textWrap: 'balance',
          }}>
            Felipe Roma Silva
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.div variants={itemVariants} style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.875rem)',
            color: 'var(--color-text-secondary)',
            fontWeight: 300,
            textWrap: 'balance',
            maxWidth: '48rem',
            margin: '0 auto',
          }}>
            Desenvolvedor Criativo que constrói experiências digitais premium
          </h2>
        </motion.div>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          style={{
            fontSize: '1rem',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-2xl)',
            maxWidth: '48rem',
            margin: '0 auto var(--space-2xl)',
            lineHeight: '1.6',
          }}
        >
          Especializado em arquitetura frontend, motion design e experiência do usuário.
          Cada projeto é uma oportunidade de combinar excelência técnica com visão artística.
        </motion.p>

        {/* CTA */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 'var(--space-2xl)',
            flexWrap: 'wrap',
          }}
        >
          <button style={{
            position: 'relative',
            paddingLeft: '2rem',
            paddingRight: '2rem',
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem',
            background: 'var(--color-accent-blue)',
            color: 'white',
            fontWeight: 600,
            borderRadius: '0.5rem',
            overflow: 'hidden',
            border: 'none',
            cursor: 'pointer',
            transition: 'all var(--transition-smooth)',
            fontSize: '1rem',
          }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 0 30px rgba(14, 165, 233, 0.6)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🚀 Explorar Trabalhos
          </button>

          <a
            href="#contact"
            style={{
              paddingLeft: '2rem',
              paddingRight: '2rem',
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem',
              border: '1px solid rgba(14, 165, 233, 0.5)',
              color: 'var(--color-accent-blue)',
              fontWeight: 600,
              borderRadius: '0.5rem',
              transition: 'all var(--transition-smooth)',
              textDecoration: 'none',
              display: 'inline-block',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'rgba(14, 165, 233, 0.8)';
              e.target.style.backgroundColor = 'rgba(14, 165, 233, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(14, 165, 233, 0.5)';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            💬 Entrar em Contato
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <ScrollIndicator />
      </motion.div>

      {/* Bottom accent line */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(to right, transparent, var(--color-accent-blue), transparent)',
        }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
      />
    </section>
  );
};

export default Hero;
