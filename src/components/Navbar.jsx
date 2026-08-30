import React, { useEffect, useState } from 'react';
import { useScrollDirection, useViewportSize } from '../hooks/useCustom';
import { navItems } from '../data/content';

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
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        transform: isHidden ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.3s',
        backdropFilter: hasScroll ? 'blur(8px)' : 'none',
        backgroundColor: hasScroll ? 'rgba(10, 20, 40, 0.5)' : 'transparent',
        borderBottom: hasScroll ? '1px solid rgba(14, 165, 233, 0.1)' : 'none',
      }}
    >
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: 'var(--space-md) var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a
            href="#hero"
            style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              fontFamily: 'var(--font-display)',
              color: 'white',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--color-accent-blue)'}
            onMouseLeave={(e) => e.target.style.color = 'white'}
          >
            FRS
          </a>

          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    position: 'relative',
                    padding: '0.5rem var(--space-sm)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: activeSection === item.id ? 'var(--color-accent-blue)' : 'var(--color-text-muted)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== item.id) e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== item.id) e.target.style.color = 'var(--color-text-muted)';
                  }}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: 'var(--color-accent-blue)',
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          {isMobile && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              style={{
                padding: '0.5rem',
                color: 'var(--color-accent-blue)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.5rem',
              }}
              aria-label="Toggle menu"
            >
              {isOpen ? '✕' : '☰'}
            </button>
          )}
        </div>

        {isMobile && isOpen && (
          <div style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(14, 165, 233, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  textAlign: 'left',
                  padding: 'var(--space-sm)',
                  borderRadius: '0.5rem',
                  backgroundColor: activeSection === item.id ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                  color: activeSection === item.id ? 'var(--color-accent-blue)' : 'var(--color-text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  fontSize: '1rem',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
