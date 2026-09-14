# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19 + Vite + Framer Motion + CSS próprio (sem Tailwind). Deploy Netlify.

## Users

Recrutadores/tech leads avaliando senioridade frontend e clientes freelance buscando execução premium. Ambos chegam frios, escaneiam rápido e decidem por contato.

## Product Purpose

Portfólio Experience de Felipe Romao da Silva que prova craft frontend (motion, performance, responsivo) e converte visita em contato. Sucesso = visitante entende posicionamento em 5s, explora projetos e clica em contato/GitHub.

## Positioning

Desenvolvedor criativo que une arquitetura frontend + motion design. Prova pelo próprio site: background canvas reativo ao scroll, hero teatral, cards com física de hover — o portfólio é o case.

## Operating Context

Single-page com âncoras: hero, sobre, habilidades, projetos, contato. Uso desktop + mobile, luz variada, navegação por scroll. Idioma pt-BR.

## Capabilities and Constraints

Capacidades: hero animado, background canvas com partículas que muda com scroll, reveals por seção, cards interativos com hover, navbar com seção ativa + mobile menu, cursor custom (desktop), scroll progress, contato via mailto + links sociais.
Constraints: performance mobile (reduzir partículas, respeitar prefers-reduced-motion), responsivo 390px–1440px+, sem backend, sem imagens reais disponíveis — usar placeholders premium autorados em CSS/SVG, corrigir imagem quebrada /assets/images/agrotec.jpg, corrigir classes Tailwind órfãs (projeto não tem Tailwind), corrigir e-mail/links placeholder, tipografia via Google Fonts com fallback.

## Brand Commitments

Nome: Felipe Romao da Silva. Voz direta, técnica com visão artística, pt-BR. Dark premium autorizado como nova identidade completa (rebuild total aprovado). Sem logo existente; monograma FRS aceitável.

## Evidence on Hand

Conteúdo real parcial em src/data/content.js. Projeto real: Agrotec (https://projeto-agrotec.vercel.app/, github https://github.com/feliperomasilva/projeto-agrotec). E-mail feliperomasilva@gmail.com. Sem screenshots/fotos reais — conteúdo visual será sintético e marcado como substituível. Ausências que não devem ser fabricadas: depoimentos, métricas de clientes, anos de experiência inflados.

## Product Principles

1. O site é a prova — cada animação demonstra habilidade real, não decoração.
2. Um momento autoral por viewport, nunca o mesmo reveal repetido.
3. Performance é estética — 60fps e reduced-motion respeitado.
4. Conversão sem fricção — contato alcançável em 1 clique de qualquer seção.

## Accessibility & Inclusion

Teclado navegável com foco visível, contraste AA, prefers-reduced-motion desliga canvas/cursor/reveals, alvos touch ≥44px, pt-BR.
