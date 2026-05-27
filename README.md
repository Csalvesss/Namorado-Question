# Guava Education

Plataforma de estudos pra ela. Banco de questões curado, sem IA em runtime, com a experiência de quiz do "Seu Namorado Question" original preservada e expandida.

## O que tem hoje

- **Login privado** (lista de e-mails convidados controlada por env)
- **4 cursos seedados** com **81 questões** do material original:
  - HIV / AIDS (20)
  - Insuficiência Cardíaca (15)
  - Meningites (19)
  - Hipertensão Arterial (27)
- **5 modos de estudo**: Prova padrão (20), Revisão rápida (5), Maratona (50), Simulado cronometrado, Modo erro
- **Filtro por tópico** dentro de cada curso
- **Histórico** de provas com nota, duração e modo
- **Modo Autor**: importa novos cursos via JSON com validação (formato pronto pra colar com o Claude)
- **Modo namorado / doutora**: troca as frases entre carinhosas (padrão) e neutras (estudo em público)
- **Identidade visual** do HTML original 100% preservada (paleta vinho/rosa/dourado, Cormorant Garamond + Inter)
- **Mobile-friendly**

## O que ainda NÃO tem (próximas sessões)

- Multi-usuário entre dispositivos (Firebase Auth + Firestore — hoje cada navegador é independente, dados ficam em `localStorage`)
- Agenda de estudo e repetição espaçada
- Flashcards
- Casos clínicos
- Upload e leitura de PDF dentro da plataforma

## Como rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

Na primeira vez que abrir, ele importa automaticamente os 4 cursos seed. Você loga com qualquer nome + e-mail (a lista de e-mails permitidos só é validada se você setar `VITE_ALLOWED_EMAILS`).

## Como adicionar uma prova nova

Esse é o fluxo principal pra ela ter material novo:

1. Ela te manda um PDF de estudo
2. Você abre uma conversa nova com o Claude (ou outro LLM)
3. Vai na plataforma em **Modo Autor**, clica em **"Copiar prompt"**, cola no Claude junto com o PDF
4. O Claude devolve um JSON
5. Volta na plataforma, cola o JSON no campo de importação ou sobe o arquivo `.json`
6. O novo curso fica disponível pra ela na mesma hora

O formato do JSON está documentado dentro do Modo Autor (botão "Carregar exemplo"). Cada curso = um arquivo JSON.

## Deploy no Netlify

Já tem `netlify.toml` configurado. Você só precisa:

1. Subir esse repo no GitHub
2. Conectar o repo no Netlify
3. Deixar build command `npm run build` e publish directory `dist` (já configurado)
4. Adicionar variável de ambiente `VITE_ALLOWED_EMAILS` com os e-mails separados por vírgula
5. Deploy

## Estrutura

```
src/
├── App.tsx                  # roteamento
├── main.tsx                 # entry
├── index.css                # tailwind + tema
├── types.ts                 # tipos TS
├── components/              # Header, Layout, RequireAuth
├── pages/                   # Login, Dashboard, Course, Quiz, History, Author, Profile
├── lib/
│   ├── auth.ts              # login / logout (localStorage)
│   ├── db.ts                # API de banco (localStorage hoje, Firestore depois)
│   ├── quiz.ts              # amostragem, embaralhamento, scoring
│   ├── seed.ts              # carrega os 4 cursos iniciais
│   └── useUser.ts           # hook do usuário logado
└── data/
    ├── phrases.ts           # frases carinhosas e neutras
    └── seeds/               # os 4 JSONs de seed
```

## Próximo passo natural

Quando ela testar e validar a experiência, a gente:

1. Liga Firebase (multi-usuário real entre dispositivos) — o `db.ts` é só uma camada, fica fácil trocar
2. Adiciona flashcards e agenda
3. Importa mais bancos de questão conforme ela for estudando novos temas

Identidade do design e a alma do "Seu Namorado Question" continuam no comando.
