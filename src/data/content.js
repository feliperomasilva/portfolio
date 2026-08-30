/* Content Data */

export const heroContent = {
  name: "Felipe Roma Silva",
  title: "Creative Developer",
  subtitle: "Crafting digital experiences that blend elegance, performance, and innovation",
  cta: "Explore My Work",
  scroll: "Scroll to explore"
};

export const aboutContent = {
  title: "About",
  intro: "I'm a developer who thinks in both code and design.",
  description: [
    "With expertise spanning frontend architecture, motion design, and user experience, I create digital products that feel premium and perform flawlessly.",
    "Every project is an opportunity to push boundaries—to find the intersection of technical excellence and artistic vision.",
    "I believe great work happens at the intersection of craft, curiosity, and obsession with details."
  ],
  stats: [
    { label: "Projects Shipped", value: "20+" },
    { label: "Years Experience", value: "5+" },
    { label: "Clients Served", value: "30+" }
  ]
};

export const skillsContent = {
  title: "Skills & Expertise",
  subtitle: "A comprehensive toolkit built through continuous learning and real-world application",
  categories: [
    {
      name: "Frontend",
      icon: "code",
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue.js", "Svelte"]
    },
    {
      name: "Motion & Animation",
      icon: "motion",
      skills: ["Framer Motion", "Three.js", "GSAP", "Canvas", "SVG", "WebGL"]
    },
    {
      name: "Tools & Workflow",
      icon: "tools",
      skills: ["Vite", "Webpack", "Git", "Docker", "Figma", "Vercel"]
    },
    {
      name: "Design Systems",
      icon: "design",
      skills: ["UI/UX Design", "Accessibility", "Performance", "Responsive Design", "Design Tokens"]
    }
  ]
};

export const projectsContent = {
  title: "Featured Projects",
  subtitle: "A selection of work that represents my approach to creative development",
  projects: [
    {
      id: 1,
      number: "01",
      name: "Aurora",
      category: "Interactive Experience",
      description: "A premium brand experience with generative art, scroll-driven animations, and immersive visuals",
      image: "/assets/images/project-1.jpg",
      technologies: ["React", "Three.js", "Framer Motion"],
      featured: true,
      link: "#"
    },
    {
      id: 2,
      number: "02",
      name: "Flux",
      category: "E-commerce Platform",
      description: "Modern e-commerce with real-time inventory, smooth transitions, and performance optimizations",
      image: "/assets/images/project-2.jpg",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
      featured: true,
      link: "#"
    },
    {
      id: 3,
      number: "03",
      name: "Nebula",
      category: "Design System",
      description: "Comprehensive design system with 50+ components, accessibility features, and dark mode",
      image: "/assets/images/project-3.jpg",
      technologies: ["React", "Storybook", "TypeScript"],
      featured: false,
      link: "#"
    },
    {
      id: 4,
      number: "04",
      name: "Quantum",
      category: "Dashboard Analytics",
      description: "Real-time analytics dashboard with dynamic visualizations and predictive insights",
      image: "/assets/images/project-4.jpg",
      technologies: ["React", "D3.js", "WebSocket"],
      featured: false,
      link: "#"
    }
  ]
};

export const contactContent = {
  title: "Let's create something extraordinary together",
  subtitle: "Whether you have a project in mind or just want to chat about creative development, I'd love to hear from you.",
  email: "feliperomasilva@gmail.com",
  links: [
    { label: "GitHub", url: "https://github.com", icon: "github" },
    { label: "LinkedIn", url: "https://linkedin.com", icon: "linkedin" },
    { label: "Twitter", url: "https://twitter.com", icon: "twitter" },
    { label: "Dribbble", url: "https://dribbble.com", icon: "dribbble" }
  ]
};

export const navItems = [
  { label: "Home", id: "hero" },
  { label: "About", id: "about" },
  { label: "Skills", id: "skills" },
  { label: "Projects", id: "projects" },
  { label: "Contact", id: "contact" }
];
