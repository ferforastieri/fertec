# Deploy na Cloudflare

O site passou de export estático para Next.js rodando em Cloudflare Workers (OpenNext), com conteúdo em D1.

## Uma vez só

```bash
npm install
npx wrangler login          # ou export CLOUDFLARE_API_TOKEN=...
npx wrangler d1 create fertec-content
```

Copie o `database_id` que o comando devolve e troque `TROCAR-PELO-ID-DO-D1` em `wrangler.jsonc`.

```bash
npm run db:migrate                                  # cria as tabelas no D1 remoto
npx wrangler secret put ADMIN_SETUP_TOKEN           # invente uma senha longa só para o primeiro acesso
```

## Publicar

O Worker `fertec` está ligado ao repositório `ferforastieri/fertec` pelo Workers Builds: todo push na `main` builda e publica sozinho, sem rodar nada daqui.

Configuração usada no painel (Settings → Build):

| Campo | Valor |
| --- | --- |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx wrangler deploy` |
| Production branch | `main` |
| Variável de build | `NEXT_PUBLIC_SITE_URL=https://fer.tec.br` |
| Variável de build | `SWC_NATIVE_BINDING_CACHE_SKIP_SECURITY_CHECK=1` |

A última é contorno para o `@swc/core` 1.16.x, que rejeita o cache em `/tmp` e `/opt/buildhome/.cache` no runner da Cloudflare.

Para publicar manualmente (sem o build automático), o comando equivalente é:

```bash
npm run deploy
```

Depois do deploy, abra `https://fer.tec.br/admin/setup`, informe o `ADMIN_SETUP_TOKEN`, seu e-mail e a senha do painel. O setup funciona uma única vez: depois do primeiro administrador a rota responde 404. Em seguida remova o segredo:

```bash
npx wrangler secret delete ADMIN_SETUP_TOKEN
```

## Testar antes de publicar

```bash
npm run db:migrate:local
printf 'ADMIN_SETUP_TOKEN=teste-local\n' > .dev.vars
npm run preview
```

O `preview` sobe o Worker em `http://localhost:8787` com o D1 local.

## O que fica onde

| Recurso | Uso |
| --- | --- |
| Worker `fertec` | renderização das páginas, painel e APIs |
| D1 `fertec-content` | conteúdo editável, usuários, sessões e histórico |
| Rota `fer.tec.br/*` | domínio de produção |

## Observações

- O conteúdo inicial vem de `lib/content/seed.json` enquanto o banco estiver vazio. A primeira gravação no painel cria a linha correspondente no D1.
- A senha é guardada como PBKDF2-SHA256 com 210 mil iterações; a sessão é um cookie `HttpOnly` de 7 dias.
- Cinco tentativas erradas no mesmo IP em 15 minutos bloqueiam novas tentativas; a contagem e a inserção acontecem no mesmo comando SQL, para não furar com pedidos paralelos.
- O painel envia `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` e `frame-ancestors 'none'`.
- Cada gravação guarda uma versão; o painel mantém as últimas 20 e permite restaurar.
