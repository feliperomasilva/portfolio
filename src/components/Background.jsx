import React, { useEffect, useRef } from 'react';
import { useScrollProgress } from '../hooks/useCustom';

const Background = () => {
  const canvasRef = useRef(null);
  const scrollProgress = useScrollProgress();
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    const particleCount = Math.min(80, Math.max(20, window.innerWidth / 20));
    const particles = [];

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.targetOpacity = this.opacity;
        this.hue = 200 + Math.random() * 50; // Blue hues
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        // Update opacity based on scroll
        this.targetOpacity = 0.2 + (scrollProgress / 100) * 0.6;
        this.opacity += (this.targetOpacity - this.opacity) * 0.1;
      }

      draw() {
        ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    particlesRef.current = particles;

    // Draw connecting lines
    const drawConnections = () => {
      const connectionDistance = 150;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.2;
            ctx.strokeStyle = `rgba(14, 165, 233, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // Background gradient based on scroll
    const drawGradientBg = () => {
      const scrollPercent = scrollProgress / 100;

      // Smooth transition through colors as user scrolls
      const startHue = 220; // Deep blue
      const endHue = 200; // Cyan-blue
      const currentHue = startHue + (endHue - startHue) * scrollPercent;

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `hsl(${currentHue}, 100%, 2%)`);
      gradient.addColorStop(0.5, `hsl(${currentHue}, 80%, 3%)`);
      gradient.addColorStop(1, `hsl(${currentHue - 20}, 90%, 4%)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Draw animated glow circles
    const drawGlows = () => {
      const glowPositions = [
        { x: canvas.width * 0.2, y: canvas.height * (0.1 + scrollPercent * 0.3), color: '#0ea5e9' },
        { x: canvas.width * 0.8, y: canvas.height * (0.6 + scrollPercent * 0.2), color: '#06b6d4' },
        { x: canvas.width * 0.5, y: canvas.height * (0.8 - scrollPercent * 0.4), color: '#0ea5e9' }
      ];

      glowPositions.forEach((glow) => {
        const gradient = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, 300);
        gradient.addColorStop(0, `rgba(14, 165, 233, 0.1)`);
        gradient.addColorStop(1, 'rgba(14, 165, 233, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(glow.x - 300, glow.y - 300, 600, 600);
      });
    };

    // Animation loop
    const animate = () => {
      const scrollPercent = scrollProgress / 100;

      drawGradientBg();
      drawGlows();

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      drawConnections();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [scrollProgress]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ background: '#000000' }}
    />
  );
};

export default Background;
