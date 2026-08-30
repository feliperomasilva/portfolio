import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useCustom';
import { projectsContent } from '../data/content';

const ProjectCard = ({ project, index }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      style={{
        position: 'relative',
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '0.75rem',
        border: '1px solid rgba(14, 165, 233, 0.2)',
        backgroundColor: 'rgba(10, 20, 40, 0.2)',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          background: 'linear-gradient(to bottom-right, rgba(14, 165, 233, 0.2), rgba(14, 165, 233, 0.1))',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: isHovered ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)',
            transition: 'background var(--transition-smooth)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity var(--transition-smooth)',
          }}>
            <a
              href={project.link}
              style={{
                padding: '0.5rem 1.5rem',
                background: 'var(--color-accent-blue)',
                color: 'white',
                borderRadius: '0.5rem',
                fontWeight: 500,
                fontSize: '0.875rem',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              Ver Projeto
            </a>
          </div>
        </div>

        <div style={{
          padding: 'var(--space-lg)',
          position: 'relative',
          zIndex: 10,
        }}>
          <span style={{
            display: 'inline-block',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'rgba(14, 165, 233, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 'var(--space-sm)',
          }}>
            {project.category}
          </span>

          <h3 style={{
            fontSize: '1.25rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 'var(--space-sm)',
            transform: isHovered ? 'translateX(8px)' : 'translateX(0)',
            transition: 'transform var(--transition-fast)',
          }}>
            {project.name}
          </h3>

          <p style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-md)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {project.description}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {project.technologies.map((tech) => (
              <span
                key={tech}
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'rgba(14, 165, 233, 0.1)',
                  color: 'var(--color-accent-blue)',
                  borderRadius: '9999px',
                  border: '1px solid rgba(14, 165, 233, 0.2)',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '0.75rem',
            pointerEvents: 'none',
            boxShadow: isHovered ? '0 0 40px rgba(14, 165, 233, 0.2), inset 0 0 40px rgba(14, 165, 233, 0.05)' : '0 0 0px rgba(14, 165, 233, 0)',
            transition: 'box-shadow var(--transition-smooth)',
          }}
        />
      </div>
    </motion.div>
  );
};

const Projects = () => {
  const { ref: projectsRef, isInView } = useInView({ threshold: 0.05 });

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
      id="projects"
      ref={projectsRef}
      style={{
        position: 'relative',
        padding: '8rem var(--space-md)',
      }}
    >
      <div style={{ maxWidth: '88rem', margin: '0 auto' }}>
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
            Trabalhos em Destaque
          </motion.span>

          <motion.h2
            variants={itemVariants}
            style={{
              marginBottom: 'var(--space-md)',
            }}
          >
            {projectsContent.title}
          </motion.h2>

          <motion.p
            variants={itemVariants}
            style={{
              fontSize: '1rem',
              color: 'var(--color-text-muted)',
              maxWidth: '48rem',
            }}
          >
            {projectsContent.subtitle}
          </motion.p>
        </motion.div>

        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-lg)',
          }}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
              },
            },
          }}
        >
          {projectsContent.projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
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

export default Projects;

