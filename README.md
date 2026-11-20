# Fertec — Portfólio de Fernando Forastieri

Portfólio profissional de Fernando Forastieri, engenheiro de software fullstack. Reúne apresentação, projetos e currículo em uma experiência editorial, responsiva e disponível em português, inglês e espanhol.

**Site:** [fer.tec.br](https://fer.tec.br)

## Sobre

O projeto foi construído para apresentar trabalho, trajetória e competências sem parecer um catálogo genérico. A interface combina tipografia editorial, temas claro e escuro, navegação flutuante e animações discretas.

## Funcionalidades

- Home com apresentação, indicadores profissionais e linha do tempo.
- Painel em `/admin` para editar perfil, currículo, competências e projetos sem novo deploy.
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
| Conteúdo | Cloudflare D1 |
| Interface | next-intl |
| PDF | jsPDF |
| Animações | Web Animations API e `requestAnimationFrame` |
| Hospedagem | Cloudflare Workers (OpenNext) |

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

O conteúdo editorial fica no D1 e é editado em `/admin`. `lib/content/seed.json` é a carga inicial usada enquanto o banco está vazio; `messages/` guarda só os rótulos de interface. As páginas são renderizadas no Worker a cada visita, para refletir a edição na hora.

```text
lib/
├── auth.ts                   # senha (PBKDF2), sessão e limite de tentativas
├── db.ts                     # binding D1
└── content/                  # tipos, carga inicial e leitura/gravação
app/
├── admin/                    # login, primeiro acesso e painel
└── api/admin/                # login, logout, conteúdo e histórico
migrations/                   # tabelas do D1
```

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

Para rodar o Worker com D1 local:

```bash
npm run db:migrate:local
npm run preview
```

## Deploy

O site é publicado na Cloudflare Workers. O passo a passo (D1, token de setup e `npm run deploy`) está em `docs/deploy-cloudflare.md`.

## Licença

Distribuído sob a licença MIT. Consulte [LICENSE](LICENSE).
