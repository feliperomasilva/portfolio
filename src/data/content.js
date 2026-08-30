/* Content Data - Português Brasileiro */

export const heroContent = {
  name: "Felipe Roma Silva",
  title: "Desenvolvedor Criativo",
  subtitle: "Criando experiências digitais que combinam elegância, performance e inovação",
  cta: "Explorar Trabalhos",
  scroll: "Role para explorar"
};

export const aboutContent = {
  title: "Sobre Mim",
  intro: "Sou um desenvolvedor que pensa tanto em código quanto em design.",
  description: [
    "Com expertise em arquitetura frontend, motion design e experiência do usuário, crio produtos digitais que se sentem premium e funcionam impecavelmente.",
    "Todo projeto é uma oportunidade de ultrapassar limites — de encontrar a intersecção entre excelência técnica e visão artística.",
    "Acredito que o trabalho excelente acontece na interseção entre ofício, curiosidade e obsessão pelos detalhes."
  ],
  stats: [
    { label: "Projetos Entregues", value: "20+" },
    { label: "Anos de Experiência", value: "5+" },
    { label: "Clientes Atendidos", value: "30+" }
  ]
};

export const skillsContent = {
  title: "Habilidades e Expertise",
  subtitle: "Um conjunto abrangente de ferramentas construído através de aprendizado contínuo e aplicação no mundo real",
  categories: [
    {
      name: "Frontend",
      icon: "💻",
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue.js", "Svelte"]
    },
    {
      name: "Animação & Motion",
      icon: "✨",
      skills: ["Framer Motion", "Three.js", "GSAP", "Canvas", "SVG", "WebGL"]
    },
    {
      name: "Ferramentas & Workflow",
      icon: "🛠️",
      skills: ["Vite", "Webpack", "Git", "Docker", "Figma", "Vercel"]
    },
    {
      name: "Design & UX",
      icon: "🎨",
      skills: ["UI/UX Design", "Acessibilidade", "Performance", "Design Responsivo", "Design Tokens"]
    }
  ]
};

export const projectsContent = {
  title: "Projetos em Destaque",
  subtitle: "Uma seleção de trabalhos que representa minha abordagem ao desenvolvimento criativo",
  projects: [
    {
      id: 1,
      number: "01",
      name: "Aurora",
      category: "Experiência Interativa",
      description: "Uma experiência de marca premium com arte generativa, animações controladas por scroll e visuais imersivos",
      image: "/assets/images/project-1.jpg",
      technologies: ["React", "Three.js", "Framer Motion"],
      featured: true,
      link: "#"
    },
    {
      id: 2,
      number: "02",
      name: "Flux",
      category: "Plataforma E-commerce",
      description: "E-commerce moderno com inventário em tempo real, transições suaves e otimizações de performance",
      image: "/assets/images/project-2.jpg",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
      featured: true,
      link: "#"
    },
    {
      id: 3,
      number: "03",
      name: "Nebula",
      category: "Sistema de Design",
      description: "Sistema de design abrangente com 50+ componentes, recursos de acessibilidade e modo escuro",
      image: "/assets/images/project-3.jpg",
      technologies: ["React", "Storybook", "TypeScript"],
      featured: false,
      link: "#"
    },
    {
      id: 4,
      number: "04",
      name: "Quantum",
      category: "Dashboard de Análise",
      description: "Dashboard de análise em tempo real com visualizações dinâmicas e insights preditivos",
      image: "/assets/images/project-4.jpg",
      technologies: ["React", "D3.js", "WebSocket"],
      featured: false,
      link: "#"
    }
  ]
};

export const contactContent = {
  title: "Vamos criar algo extraordinário juntos",
  subtitle: "Quer trabalhar comigo ou apenas conversar sobre desenvolvimento criativo? Ficarei feliz em ouvir.",
  email: "feliperomasilva@gmail.com",
  links: [
    { label: "GitHub", url: "https://github.com", icon: "github" },
    { label: "LinkedIn", url: "https://linkedin.com", icon: "linkedin" },
    { label: "Twitter", url: "https://twitter.com", icon: "twitter" },
    { label: "Dribbble", url: "https://dribbble.com", icon: "dribbble" }
  ]
};

export const navItems = [
  { label: "Início", id: "hero" },
  { label: "Sobre", id: "about" },
  { label: "Habilidades", id: "skills" },
  { label: "Projetos", id: "projects" },
  { label: "Contato", id: "contact" }
];

