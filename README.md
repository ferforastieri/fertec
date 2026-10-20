# Fertec — Portfólio de Fernando Forastieri

Portfólio profissional de Fernando Forastieri, engenheiro de software fullstack. Reúne apresentação, projetos e currículo em uma experiência editorial, responsiva e disponível em português, inglês e espanhol.

**Site:** [fer.tec.br](https://fer.tec.br)

## Sobre

O projeto foi construído para apresentar trabalho, trajetória e competências sem parecer um catálogo genérico. A interface combina tipografia editorial, temas claro e escuro, navegação flutuante e animações discretas.

## Funcionalidades

- Home com apresentação, indicadores profissionais e linha do tempo.
- Projetos pessoais e profissionais com detalhes técnicos e árvore de repositório.
- Currículo completo com download em PDF.
- Conteúdo em português, inglês e espanhol.
- Tema claro e escuro com preferência persistida.
- PWA instalável com navegação offline básica.
- Layout responsivo para desktop e celular.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Aplicação | Next.js 16, React 19 e TypeScript |
| Estilo | Tailwind CSS 4, Manrope e Instrument Serif |
| Conteúdo | next-intl |
| PDF | jsPDF |
| Animações | Web Animations API e `requestAnimationFrame` |
| Hospedagem | Cloudflare Workers |

## Arquitetura

```text
app/
├── (portfolio)/
│   ├── page.tsx              # home
│   ├── _components/          # componentes da home
│   ├── projetos/             # índice, detalhes e árvore de projetos
│   └── curriculo/            # currículo e exportação em PDF
├── components/
│   ├── ui/                   # componentes compartilhados
│   └── seo/                  # dados estruturados
├── hooks/                    # animações de entrada e scroll
├── layout.tsx                # shell, providers e metadata
├── globals.css               # tema e estilos globais
├── manifest.ts               # manifesto PWA
├── sitemap.ts
└── robots.ts

messages/                     # textos e dados em PT, EN e ES
public/                       # imagens, ícones e service worker
```

O conteúdo editorial fica em `messages/`; os componentes cuidam apenas de apresentação e interação. As páginas são geradas estaticamente no build.

## Como rodar

Requisitos: Node.js 20.9 ou superior.

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

Para gerar o build de produção:

```bash
npm run build
```

Para visualizar o build localmente:

```bash
npm start
```

## Deploy

O site é publicado na Cloudflare Workers. O deploy é automático a partir da branch `main` via Cloudflare Workers Builds.

## Licença

Distribuído sob a licença MIT. Consulte [LICENSE](LICENSE).
