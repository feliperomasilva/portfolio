import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useScrollDirection, useViewportSize } from '../hooks/useCustom';
import { navItems } from '../data/content';
import { Home, User, Zap, Briefcase, MessageCircle, Menu, X } from 'lucide-react';

const iconMap = {
  hero: Home,
  about: User,
  skills: Zap,
  projects: Briefcase,
  contact: MessageCircle
};

const Navbar = () => {
  const { scrollDirection, scrollY } = useScrollDirection();
  const viewport = useViewportSize();
  const [activeSection, setActiveSection] = useState('hero');
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(viewport.width < 768);
  }, [viewport.width]);

  useEffect(() => {
    const observeIntersection = () => {
      const sections = navItems.map(item => document.getElementById(item.id));

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id);
            }
          });
        },
        { threshold: 0.3 }
      );

      sections.forEach((section) => {
        if (section) observer.observe(section);
      });

      return () => observer.disconnect();
    };

    observeIntersection();
  }, []);

  const isHidden = scrollDirection === 'down' && scrollY > 100;
  const hasScroll = scrollY > 50;

  const handleNavClick = (id) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        backdropFilter: hasScroll ? 'blur(8px)' : 'none',
        backgroundColor: hasScroll ? 'rgba(10, 20, 40, 0.5)' : 'transparent',
        borderBottom: hasScroll ? '1px solid rgba(14, 165, 233, 0.1)' : 'none',
        transition: 'all var(--transition-smooth)',
      }}
      initial={{ y: 0 }}
      animate={{ y: isHidden ? '-100%' : 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: 'var(--space-md) var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <motion.a
            href="#hero"
            style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              fontFamily: 'var(--font-display)',
              color: 'white',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'color var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={(e) => e.target.style.color = 'var(--color-accent-blue)'}
            onMouseLeave={(e) => e.target.style.color = 'white'}
          >
            <Home size={24} style={{ color: 'var(--color-accent-blue)' }} />
            FRS
          </motion.a>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {navItems.map((item) => {
                const Icon = iconMap[item.id];
                const isActive = activeSection === item.id;

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    style={{
                      position: 'relative',
                      padding: '0.5rem var(--space-sm)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: isActive ? 'var(--color-accent-blue)' : 'var(--color-text-muted)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'color var(--transition-fast)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.target.style.color = 'var(--color-text-muted)';
                    }}
                  >
                    <Icon
                      size={18}
                      style={{
                        color: isActive ? 'var(--color-accent-blue)' : 'currentColor',
                        transition: 'color var(--transition-fast)',
                      }}
                    />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '2px',
                          background: 'linear-gradient(to right, transparent, var(--color-accent-blue), transparent)',
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              style={{
                padding: '0.5rem',
                color: 'var(--color-accent-blue)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          )}
        </div>

        {/* Mobile Navigation */}
        {isMobile && isOpen && (
          <motion.div
            style={{
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(14, 165, 233, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {navItems.map((item) => {
              const Icon = iconMap[item.id];
              const isActive = activeSection === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    textAlign: 'left',
                    padding: 'var(--space-sm)',
                    borderRadius: '0.5rem',
                    backgroundColor: isActive ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                    color: isActive ? 'var(--color-accent-blue)' : 'var(--color-text-muted)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontWeight: 500,
                  }}
                  whileHover={{ x: 8 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Animated bottom bar */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--color-accent-blue), transparent)',
          opacity: hasScroll ? 1 : 0,
        }}
        animate={{
          opacity: hasScroll ? 1 : 0,
          scaleX: hasScroll ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.nav>
  );
};

export default Navbar;
