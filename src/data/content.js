/* Content Data - Português Brasileiro */

export const heroContent = {
  name: "Felipe Romao da Silva",
  title: "Desenvolvedor Criativo",
  subtitle: "Criando experiências digitais que combinam elegância, performance e inovação",
  cta: "Explorar Trabalhos",
  scroll: "Role para explorar"
};

export const aboutContent = {
  title: "Sobre Mim",
  intro: "Sou um desenvolvedor que pensa tanto em código quanto em design.",
  description: [
    "Construindo expertise em arquitetura frontend, motion design e experiência do usuário, crio produtos digitais que se sentem premium e funcionam impecavelmente.",
    "Todo projeto é uma oportunidade de ultrapassar limites — de encontrar a intersecção entre excelência técnica e visão artística.",
    "Acredito que o trabalho excelente acontece na interseção entre ofício, curiosidade e obsessão pelos detalhes."
  ],
  stats: [
    { label: "Projetos Entregues", value: "2+" },
    { label: "Anos de Experiência", value: "2+" },
  ]
};

export const skillsContent = {
  title: "Habilidades",
  subtitle: "Um conjunto abrangente de ferramentas construído através de aprendizado ao longo do tempo e aplicação no mundo real",
  categories: [
    {
      name: "Frontend",
      icon: "",
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML", "JavaScript"]
    },
    {
      name: "Animação & Motion",
      icon: "",
      skills: ["Framer Motion", "Three.js", "GSAP", "Canvas", "SVG", "WebGL"]
    },
    {
      name: "Ferramentas & Workflow",
      icon: "",
      skills: ["GitHub", "VS Code", "Git", "Netlify", "Figma", "Vercel"]
    },
    {
      name: "BackEnd",
      icon: "",
      skills: ["Node.js", "NPM", "Python", "PostgreSQL", "MongoDB"]
    }
  ]
};

export const projectsContent = {
  title: "Projetos em Destaque",
  subtitle: "Projetos criativos e unicos que densenvolvi ao longo da minha carreira como programador",
  projects: [
    {
      id: 1,
      number: "01",
      name: "Agrotec",
      category: "Plataforma Web",
      description: "Plataforma completa de gestão agrícola com dashboard interativo, mapas geográficos e análise de dados em tempo real para otimização de cultivos",
      image: "/assets/images/agrotec.jpg",
      technologies: ["JavaScript", "Css", "HTML",],
      featured: true,
      link: "https://projeto-agrotec.vercel.app/",
      github: "https://github.com/feliperomasilva/projeto-agrotec"
    },
  ]
};

export const contactContent = {
  title: "Vamos criar algo extraordinário juntos",
  subtitle: "Quer trabalhar comigo ou apenas conversar sobre desenvolvimento criativo? Entre em contato!",
  email: "feliperomasilva@gmail.com",
  links: [
    { label: "GitHub", url: "https://github.com", icon: "github" },
    { label: "LinkedIn", url: "https://linkedin.com", icon: "linkedin" },
    { label: "Twitter", url: "https://twitter.com", icon: "twitter" },
  ]
};

export const navItems = [
  { label: "Início", id: "hero" },
  { label: "Sobre", id: "about" },
  { label: "Habilidades", id: "skills" },
  { label: "Projetos", id: "projects" },
  { label: "Contato", id: "contact" }
];

