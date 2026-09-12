import React, { useEffect } from 'react';
import Background from './components/Background';
import Cursor from './components/Cursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import ScrollProgress from './components/ScrollProgress';
import './styles/globals.css';
import './styles/animations.css';
import './styles/theme.css';

function App() {
  useEffect(() => {
    // Prevent scroll on load and smooth behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.documentElement.style.scrollBehavior = 'auto';
    }

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background system */}
      <Background />

      {/* Custom cursor */}
      <Cursor />

      {/* Navigation */}
      <Navbar />

      {/* Scroll progress indicator */}
      <ScrollProgress />

      {/* Main content */}
      <main className="relative z-20">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-8 px-4 sm:px-6 lg:px-8 border-t border-azul-500/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-slate-500 font-mono">
              © 2024 Felipe Romao da Silva. All rights reserved.
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-mono">
              Construído com React, CSS & HTML
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
