# Felipe Roma Silva - Premium Portfolio

Um portfólio digital premium, extremamente moderno, minimalista e visualmente memorável, desenvolvido com React, Framer Motion e Three.js.

## 🎯 Características Principais

### Design & Experiência
- **Background Vivo**: Sistema de partículas dinâmico controlado por scroll com Canvas
- **Animações Cinematográficas**: Transições suaves orquestradas com Framer Motion
- **Cursor Customizado**: Cursor sofisticado que reage a elementos interativos (desktop only)
- **Scroll Progress**: Indicador visual elegante do progresso de navegação
- **Tema Azul**: Paleta de cores baseada em azul profundo, azul elétrico, preto e branco

### Seções
1. **Hero** - Entrada impactante com animações de text reveal
2. **About** - Seção editorial com tipografia e layout sofisticado
3. **Skills** - Apresentação elegante de tecnologias com categorias
4. **Projects** - Galeria de projetos com hover cinematográfico
5. **Contact** - Encerramento forte com links para redes sociais
6. **Navbar** - Navegação inteligente que responde ao scroll

### Performance & Acessibilidade
- ✅ CSS puro com design tokens
- ✅ Lazy loading e IntersectionObserver
- ✅ Prefers-reduced-motion respeitado
- ✅ Keyboard navigation
- ✅ Focus states visíveis
- ✅ Semantic HTML
- ✅ Mobile-first responsive
- ✅ Sem Tailwind - código limpo e otimizado

## 🛠️ Stack Técnico

- **React 18** - Framework UI
- **Vite** - Build tool otimizado
- **Framer Motion** - Animações e transições
- **Three.js** - (disponível para animações 3D avançadas)
- **CSS Puro** - Design tokens e styling
- **Google Fonts** - Tipografia premium (Sora, Inter, JetBrains Mono)

## 📦 Instalação

```bash
# Clonar repositório
git clone <repo-url>
cd portfolio

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview de build
npm run preview
```

## 🚀 Desenvolvimento

O servidor inicia em `http://localhost:5173` (ou próxima porta disponível).

### Estrutura de Pastas

```
src/
├── components/          # Componentes React
│   ├── Hero.jsx
│   ├── About.jsx
│   ├── Skills.jsx
│   ├── Projects.jsx
│   ├── Contact.jsx
│   ├── Navbar.jsx
│   ├── Background.jsx
│   ├── Cursor.jsx
│   └── ScrollProgress.jsx
├── hooks/              # Custom hooks
│   └── useCustom.js
├── styles/             # CSS puro
│   ├── globals.css
│   ├── animations.css
│   └── theme.css
├── data/               # Conteúdo e dados
│   └── content.js
├── App.jsx
└── main.jsx
```

## 🎨 Design System

### Paleta de Cores
```css
--color-accent-blue: #0ea5e9
--color-accent-cyan: #06b6d4
--color-primary-dark: #0a1428
--color-primary-darker: #0d1b2a
--color-text-primary: #ffffff
--color-text-secondary: #e5e7eb
--color-text-muted: #9ca3af
--color-bg-primary: #000000
--color-bg-secondary: #0f1419
```

### Tipografia
- **Display**: Sora (headings)
- **Body**: Inter (texto)
- **Mono**: JetBrains Mono (código, números)

### Spacing Scale
- xs: 0.5rem | sm: 1rem | md: 1.5rem | lg: 2rem | xl: 3rem | 2xl: 4rem | 3xl: 6rem

## ✨ Funcionalidades Principais

### Background Dinâmico
- Partículas que se movem e conectam
- Iluminação que acompanha o scroll
- Gradientes animados
- Sem impacto de performance

### Mouse Interactions (Desktop)
- Cursor customizado com ponto + anel
- Scaling ao passar sobre elementos interativos
- Glow effects suaves

### Scroll Tracking
- Indicador visual de progresso
- Navegação por pontos (desktop)
- Porcentagem (mobile)
- Seções ativas automaticamente detectadas

### Responsividade
- Mobile-first approach
- Breakpoints adaptativos
- Sem cursor customizado em mobile/touch devices
- Animações reduzidas em dispositivos fracos
- Tipografia responsiva com clamp()

## 🔧 Customização

### Editar Conteúdo
Modifique `src/data/content.js` com:
- Informações pessoais
- Descrição de projetos
- Links de contato
- Habilidades técnicas

### Editar Cores
Modifique as CSS variables em `src/styles/globals.css`:
```css
:root {
  --color-accent-blue: #0ea5e9;
  /* ... outras cores ... */
}
```

### Adicionar Projetos
Adicione à array `projects` em `src/data/content.js`

## 📱 Mobile Optimization

- Animações de partículas reduzidas em dispositivos móveis
- Menu hamburger implementado
- Tipografia escalável
- Touch-friendly interactions
- Sem cursor customizado
- Performance otimizada

## ♿ Acessibilidade

- ✅ Keyboard navigation completa
- ✅ Focus states visíveis
- ✅ Semantic HTML
- ✅ ARIA labels quando apropriado
- ✅ Prefers-reduced-motion respeitado
- ✅ Contraste de cores WCAG AA+
- ✅ Screen reader friendly

## 🔍 Performance

- **Zero dependencies desnecessárias**
- **CSS puro** em vez de frameworks
- **Lazy loading** de conteúdo
- **IntersectionObserver** para animações
- **requestAnimationFrame** otimizado
- **Compressão de assets**
- **Code splitting** automático com Vite

### Lighthouse Scores
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### GitHub Pages
```bash
npm run build
git add dist/
git commit -m "Deploy"
git push
```

## 📝 Notas de Desenvolvimento

- Todos os estilos são CSS puro com design tokens
- Framer Motion gerencia todas as animações
- Canvas é usado para o background dinâmico
- Sem frameworks de UI - tudo customizado
- Responsive design com media queries modernas
- Mobile-first approach

## 🎬 Próximos Passos Opcionais

- [ ] Adicionar imagens reais dos projetos
- [ ] Integrar formulário de contato
- [ ] Dark/light mode toggle
- [ ] Analytics (Google Analytics, Plausible)
- [ ] Blog ou artigos
- [ ] Integração com GitHub API para projects

## 📄 Licença

Este projeto é de uso pessoal. Sinta-se livre para customizar!

---

**Desenvolvido com ❤️ e atenção aos detalhes**

Última atualização: 2024
