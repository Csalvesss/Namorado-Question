# Deploy do painel admin

Esse documento lista **o que falta fazer fora do código** pra o admin/aprovação de
cadastro funcionar de ponta a ponta. Tudo aqui precisa ser feito **uma vez** —
depois, deploys futuros são só `firebase deploy`.

## Pré-requisitos

1. **Conta admin**: o e-mail `ads.cesaralves@gmail.com` é o único reconhecido como
   admin (ver `src/lib/admin.ts`). Pra adicionar outro admin no futuro, edita esse
   arquivo + faz o deploy.
2. **Firebase CLI instalado localmente**: `npm install -g firebase-tools` e depois
   `firebase login` com a conta que tem acesso ao projeto `guava-education`.
3. **Node 20** (requisito das Cloud Functions v2).

## Passo 1 — Subir o projeto pro plano Blaze

Cloud Functions exigem o plano Blaze (pay-as-you-go) no Firebase. Tem cota grátis
generosa (2M invocações/mês, 400k GB-segundos, 5GB egress) — o app dificilmente sai
do free tier.

1. Abre o [console Firebase](https://console.firebase.google.com/project/guava-education)
2. No canto inferior esquerdo: **Upgrade** → escolhe **Blaze**
3. Vincula um cartão. Recomendo setar um **budget alert** em ~R$10/mês pra evitar
   surpresa caso alguém ataque o app.

## Passo 2 — Ativar Firebase Storage

Storage é onde os PDFs/conteúdos vão viver.

1. Console → **Storage** → **Get Started**
2. Aceita a região default (us-central1) ou escolhe outra (a região fica permanente)
3. Deploy das rules: `firebase deploy --only storage`

## Passo 3 — Deploy das regras do Firestore atualizadas

As novas rules barram quem não é admin e quem não foi aprovado.

```bash
firebase deploy --only firestore:rules
```

**Importante**: usuárias antigas (sem campo `status` no doc) são tratadas como
`approved` pelas rules — então **ninguém perde acesso**. Só novos cadastros caem
no fluxo de aprovação.

## Passo 4 — Deploy das Cloud Functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

As 5 funções deployadas:

| nome | quem chama | o que faz |
|---|---|---|
| `redeemSignupCode` | usuária | valida código, libera status=approved |
| `approveSignup` | admin | gera código de aprovação |
| `denySignup` | admin | marca solicitação como denied |
| `createImpersonationToken` | admin | retorna custom token pra logar como X |
| `logAccessReal` | qualquer auth | log com IP **real** do servidor (best-effort) |

## Passo 5 — Marcar seu próprio usuário como admin

A primeira vez que `ads.cesaralves@gmail.com` logar após o deploy, o cliente faz
self-heal e seta `role: 'admin'` + `status: 'approved'` no doc do Firestore
(via `ensureAdminFields` em `src/lib/auth.ts`).

Se preferir fazer manual no Console:

1. Firestore → `users/<seu_uid>` → adiciona campos:
   - `role` = `"admin"` (string)
   - `status` = `"approved"` (string)

## Passo 6 — Migração das usuárias antigas (opcional)

Como dito, elas continuam funcionando sem migração. Se quiser **explicitar** o
status delas no doc (mais limpo pro painel), roda no Console um update em massa
ou um script Node com `firebase-admin`:

```js
// scripts/migrate-status.js
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function main() {
  const snap = await db.collection('users').get();
  const batch = db.batch();
  let count = 0;
  for (const d of snap.docs) {
    const data = d.data();
    if (!data.status) {
      batch.update(d.ref, { status: 'approved', migratedAt: Date.now() });
      count++;
    }
  }
  await batch.commit();
  console.log(`migradas ${count} usuárias`);
}
main();
```

Rodar: `node scripts/migrate-status.js` com `GOOGLE_APPLICATION_CREDENTIALS`
apontando pra service account.

## Como funciona o fluxo de cadastro daqui pra frente

1. Pessoa nova vai em `/login`, clica criar conta, preenche dados.
2. Cliente cria a usuária no Auth + doc em `/users/{uid}` com `status: 'pending'`.
3. Cliente também cria `/signup_requests/{uid}` com IP/geo/UA (via ipapi.co
   client-side; o IP de cliente é falsificável — pra ter IP de verdade,
   posso adicionar uma chamada à `logAccessReal` pós-signup).
4. Pessoa é redirecionada pra `/aguardando`.
5. Você (admin) abre `/admin` → aba **solicitações**, vê a pessoa pendente
   com IP/local.
6. Clica **aprovar com código** → painel mostra um código tipo `AB12-CD34`.
7. Você manda esse código por fora (WhatsApp).
8. Pessoa digita o código em `/aguardando` → backend valida → `status: 'approved'`.
9. Refresh → app libera.

## "Ver como" outra usuária

Aba **Usuárias** → botão **ver como**.

- O cliente chama `createImpersonationToken`, recebe um custom token.
- Faz `signInWithCustomToken` → sua sessão vira a dela. Você vê tudo como ela vê.
- Pra voltar: faz logout normal e loga de novo como admin.
- Toda impersonação grava em `/access_logs` com `kind: 'impersonate'` e o
  `impersonatedBy` do admin — fica rastreável.

## Custos esperados

Free tier do Blaze cobre tranquilo um app desse tamanho. O único gargalo é
**ipapi.co**: o tier sem chave tem ~1000 req/dia. Se passar disso, o IP/geo
volta `undefined` mas o app não quebra. Pra produção séria, troca por
[ipinfo.io](https://ipinfo.io/) (50k/mês free com chave) em
`functions/src/index.ts` → `geolocateIp`.
