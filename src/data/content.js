// Textos do site num lugar só

// Hero: nome, cargo, título em 2 linhas, subtítulo e os 3 destaques rápidos
export const heroContent = {
  name: 'Felipe Romão da Silva',
  role: 'Desenvolvedor Front-End & Back-End',
  roles: ['Interfaces que parecem vivas', 'Alimentadas pelas sombras do back-end.', 'Responsividade Sempre Presente.'],
  headlineA: 'Interfaces que',
  headlineB: 'parecem vivas.',
  sub: 'Arquitetura frontend, motion design e experiência do usuário — cada projeto combina excelência técnica com visão artística.',
  primaryCta: { label: 'Ver trabalhos', target: 'projects' },
  secondaryCta: { label: 'Entrar em contato', target: 'contact' },
  availability: 'Disponível para projetos',
  location: 'Brasil · Remoto & Presencial · BRT',
  // Linha de provas rápidas do Hero (case real, stack e base remota)
  proof: [
    { k: '01', v: 'case real no ar — Agrotec' },
    { k: '12+', v: 'tecnologias em produção' },
    { k: 'BR', v: 'Brasil · trabalho remoto' },
  ],
  meta: [
    { k: 'Base', v: 'Brasil · Remoto e Presencial' },
    { k: 'Foco', v: 'Frontend + Backend' },
    { k: 'Stack', v: 'React · CSS · JS · HTML · Python · SQL · Git · GitHub · etc...' },
  ],
};

// Sobre: índice da seção, título, parágrafos e os números animados
export const aboutContent = {
  index: '01',
  title: 'Front com intenção, Back com propósito.',
  intro: 'Meu nome é Felipe Romão da Silva, sou desenvolvedor junior full-stack, apaixonado por criar experiências digitais envolventes. Cada projeto que assumo é uma oportunidade de unir estudos, funcionalidade e inovação.',
  description: [
    'Construo e busco mais expertise em arquitetura frontend, motion design e experiência do usuário. ',
    'Estudo também como funcionar por trás das cortinas como banco de dados, servidores, API e integrações. ',
    'Acredito que trabalho excelente nasce da junção entre ofício, curiosidade e obsessão pelos mínimos detalhes.',
  ],
  stats: [
    { label: 'Case real no ar', value: 1, suffix: '' },
    { label: 'Tecnologias em produção', value: 12, suffix: '+' },
    { label: 'Frentes de atuação', value: 4, suffix: '' },
    { label: 'Portfólio 100% autoral', value: 100, suffix: '%' },
  ],
};

// Habilidades: 4 grupos (icon é a chave do mapa de ícones em Skills.jsx)
export const skillsContent = {
  index: '02',
  title: 'Caixa de ferramentas, calibrada.',
  subtitle: 'Um conjunto construído ao longo do tempo com aprendizado contínuo e aplicação em projetos reais.',
  categories: [
    { name: 'Frontend', icon: 'code', skills: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS',] },
    { name: 'Mobile', icon: 'palette', skills: ['Flutter','Three.js', 'Responsividade', 'ScrollTrigger'] },
    { name: 'Ferramentas', icon: 'wrench', skills: ['Git', 'GitHub', 'VS Code', 'Figma', 'Netlify', 'Vercel'] },
    { name: 'Backend & Dados', icon: 'database', skills: ['Node.js', 'Python', 'PostgreSQL', 'NPM'] },
  ],
};

// Projetos: só o case real (Agrotec). link = site no ar, github = código-fonte, status live = selo "no ar"
export const projectsContent = {
  index: '03',
  title: 'Trabalhos em destaque.',
  subtitle: 'Projetos criativos e únicos que desenvolvi ao longo da minha trajetória como programador.',
  projects: [
    {
      id: 'agrotec',
      number: '01',
      name: 'Agrotec',
      category: 'Plataforma Web · Case real',
      description: 'Plataforma de gestão agrícola com dashboard interativo, mapas geográficos e análise de dados em tempo real para otimização de cultivos.',
      technologies: ['JavaScript', 'CSS', 'HTML'],
      link: 'https://projetoagrotec.vercel.app/',
      github: 'https://github.com/feliperomasilva/projeto-agrotec',
      status: 'live',
      accent: 'amber',
    },
  ],
};

// Contato: e-mail + 3 canais (GitHub, LinkedIn, WhatsApp com mensagem pronta codificada na URL)
export const contactContent = {
  index: '04',
  title: 'Vamos criar algo extraordinário juntos.',
  subtitle: 'Quer trabalhar comigo ou apenas conversar sobre desenvolvimento criativo? Entre em contato.',
  email: 'feliperomasilva@gmail.com',
  links: [
    { label: 'GitHub', url: 'https://github.com/feliperomasilva', icon: 'github' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/feliperomao-dev', icon: 'linkedin' },
    { label: 'WhatsApp', url: 'https://wa.me/5514982019092?text=Ol%C3%A1%20Felipe%2C%20vi%20seu%20portf%C3%B3lio%20e%20quero%20conversar.', icon: 'whatsapp' },
  ],
};

// Itens da navbar: rótulo visível + id da seção de destino (Início aponta para o Hero/showreel)
export const navItems = [
  { label: 'Início', id: 'showreel' },
  { label: 'Sobre', id: 'about' },
  { label: 'Habilidades', id: 'skills' },
  { label: 'Projetos', id: 'projects' },
  { label: 'Contato', id: 'contact' },
];
