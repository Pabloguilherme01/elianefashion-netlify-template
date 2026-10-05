> **Status: template legado, corrigido para referência técnica.**
>
> A implementação atual da Eliane Fashion é mantida em `Pabloguilherme01/eliane-fashion-site`. Este repositório preserva uma arquitetura anterior baseada em Netlify/Firebase e não deve ser tratado como fonte de produção.

# Eliane Fashion - Template Netlify

Template completo para loja virtual com:
- Netlify Functions
- Firebase (Auth + Firestore)
- Mercado Pago
- Instagram Feed
- PWA
- Painel Admin

## Deploy rápido

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/SEU_USUARIO/elianefashion-netlify-template)

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `MP_ACCESS_TOKEN` | Token do Mercado Pago |
| `FIREBASE_PROJECT_ID` | ID do projeto Firebase |
| `FIREBASE_CLIENT_EMAIL` | E-mail da conta de serviço |
| `FIREBASE_PRIVATE_KEY` | Chave privada do Firebase |
| `ADMIN_UID` | UID do usuário admin |
| `URL_BASE` | URL do site |
| `INSTAGRAM_TOKEN` | Token do Instagram (opcional) |
## Estrutura normalizada

- `index.html` — página pública do exemplo.
- `admin/index.html` — painel administrativo de demonstração.
- `functions/` — Netlify Functions.
- `netlify.toml` — configuração de deploy.

O ZIP duplicado e nomes com extensões repetidas foram removidos. As funções de estoque exigem autenticação administrativa e o checkout deriva nome/preço/estoque do Firestore, em vez de confiar em valores enviados pelo navegador.

> Este continua sendo um template legado. O produto mantido é `Pabloguilherme01/eliane-fashion-site`.
