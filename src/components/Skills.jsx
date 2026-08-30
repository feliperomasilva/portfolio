import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useCustom';
import { skillsContent } from '../data/content';

const SkillCard = ({ category, skills, icon, index }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      style={{
        position: 'relative',
        height: '100%',
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          position: 'relative',
          height: '100%',
          padding: 'var(--space-lg)',
          borderRadius: '0.75rem',
          border: isHovered ? '1px solid rgba(14, 165, 233, 0.5)' : '1px solid rgba(14, 165, 233, 0.2)',
          background: isHovered ? 'rgba(10, 20, 40, 0.4)' : 'rgba(10, 20, 40, 0.2)',
          backdropFilter: 'blur(8px)',
          transition: 'all var(--transition-smooth)',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: isHovered ? 'linear-gradient(to bottom-right, rgba(14, 165, 233, 0.05), rgba(14, 165, 233, 0))' : 'transparent', transition: 'all var(--transition-smooth)' }} />

        <div style={{ position: 'relative', zIndex: 10 }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 'bold',
            color: 'var(--color-accent-blue)',
            marginBottom: 'var(--space-md)',
            transform: isHovered ? 'translateX(8px)' : 'translateX(0)',
            transition: 'transform var(--transition-fast)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span style={{ fontSize: '1.5rem' }}>{icon}</span>
            {category}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {skills.map((skill) => (
              <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--color-accent-blue)',
                  transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                  transition: 'transform var(--transition-fast)',
                }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  {skill}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '64px',
          height: '64px',
          background: isHovered ? 'linear-gradient(to top-left, rgba(14, 165, 233, 0.1), transparent)' : 'transparent',
          borderRadius: '8px 0 0 0',
          pointerEvents: 'none',
          transition: 'all var(--transition-smooth)',
        }} />
      </div>
    </motion.div>
  );
};

const Skills = () => {
  const { ref: skillsRef, isInView } = useInView({ threshold: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  return (
    <section
      id="skills"
      ref={skillsRef}
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
            Expertise
          </motion.span>

          <motion.h2
            variants={itemVariants}
            style={{
              marginBottom: 'var(--space-md)',
            }}
          >
            {skillsContent.title}
          </motion.h2>

          <motion.p
            variants={itemVariants}
            style={{
              fontSize: '1rem',
              color: 'var(--color-text-muted)',
              maxWidth: '48rem',
            }}
          >
            {skillsContent.subtitle}
          </motion.p>
        </motion.div>

        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-2xl)',
          }}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.08,
                delayChildren: 0.2,
              },
            },
          }}
        >
          {skillsContent.categories.map((category, index) => (
            <SkillCard
              key={category.name}
              category={category.name}
              skills={category.skills}
              icon={category.icon}
              index={index}
            />
          ))}
        </motion.div>

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
          transition={{ duration: 1, delay: 0.4 }}
        />
      </div>
    </section>
  );
};

export default Skills;

