// Camada de copy do Education Assistant.
//
// A engine de insights (src/lib/assistant.ts) é determinística: emite objetos
// `AssistantInsight` com `code` tipado e `params` estruturados. Este arquivo
// traduz cada par (code, displayMode) em texto humano, com placeholders
// substituídos a partir de `params`.
//
// 3 vozes (displayMode):
//   - namorado: carinhoso, primeira pessoa do namorado, usa "amor"/"doutora".
//   - doutora:  neutro e profissional, sem termos afetivos, conciso.
//   - irmao:    irmão chato torcedor, zoeira leve, sem "amor"/"doutora".
//
// Regras de estilo (válidas para todo o app):
//   - SEMPRE "para", NUNCA "pra".
//   - lowercase como tom natural; nomes próprios mantêm capitalização.
//   - sem emojis.

import type { AssistantInsight, InsightCode } from '../lib/agenda-types';

export type DisplayMode = 'namorado' | 'doutora' | 'irmao';

export interface Template {
  /** pode conter placeholders no formato {nome} — resolvidos por interpolate() */
  title: string;
  body: string;
}

type CopyDict = Record<InsightCode, Record<DisplayMode, Template>>;

// =============================================================================
// Dicionário principal — 12 codes × 3 modos = 36 templates
// =============================================================================

export const INSIGHT_COPY: CopyDict = {
  // ---------------------------------------------------------------------------
  // starting-soon — próximo evento em ≤ 60 min
  // params: { title, minutes }
  // ---------------------------------------------------------------------------
  'starting-soon': {
    namorado: {
      title: 'começa em {minutes} min, amor',
      body: 'tá quase na hora de {title}. respira, junta o material e vai com calma. eu fico torcendo daqui.',
    },
    doutora: {
      title: 'Próximo: {title} em {minutes} min',
      body: 'Início agendado em breve. Verifique material e local antes de sair.',
    },
    irmao: {
      title: 'olha aí, {title} em {minutes} min',
      body: 'para com o instagram e vai. confere se não esqueceu nada como você sempre esquece.',
    },
  },

  // ---------------------------------------------------------------------------
  // exam-imminent — prova em ≤ 48h
  // params: { subjectName, examLabel, daysUntil, dateLabel }
  // ---------------------------------------------------------------------------
  'exam-imminent': {
    namorado: {
      title: '{subjectName} está logo ali, doutora',
      body: '{examLabel} em {daysUntil} dia ({dateLabel}). respira, faz uma última passada nos pontos críticos e dorme cedo. você está pronta.',
    },
    doutora: {
      title: '{subjectName} — {examLabel} em {daysUntil} dia',
      body: 'Prova em {dateLabel}. Revisão final hoje, sem assunto novo. Descanso à noite.',
    },
    irmao: {
      title: '{subjectName} é praticamente amanhã',
      body: '{examLabel} em {daysUntil} dia ({dateLabel}). revisa o que tá fraco, não tenta aprender coisa nova agora. dorme cedo, sério.',
    },
  },

  // ---------------------------------------------------------------------------
  // exam-week-heavy — N provas em ≤ 7 dias
  // params: { count, days, firstSubject, daysToFirst }
  // ---------------------------------------------------------------------------
  'exam-week-heavy': {
    namorado: {
      title: 'semana cheia de provas, doutora',
      body: '{count} provas em {days} dias. a primeira é {firstSubject} em {daysToFirst} dias. dá para fechar com uma noite por matéria, começando agora. eu te ajudo a dividir.',
    },
    doutora: {
      title: '{count} provas em {days} dias',
      body: 'Próxima: {firstSubject} em {daysToFirst} dias. Distribua uma matéria por noite, comece pela mais distante para deixar a recente fresca.',
    },
    irmao: {
      title: '{count} provas em {days} dias, parça',
      body: 'a primeira é {firstSubject} em {daysToFirst} dias. divide uma por noite e começa hoje mesmo. depois fica difícil e você sabe disso.',
    },
  },

  // ---------------------------------------------------------------------------
  // exam-upcoming — prova em 3–14 dias
  // params: { subjectName, daysUntil }
  // ---------------------------------------------------------------------------
  'exam-upcoming': {
    namorado: {
      title: '{subjectName} vem aí, amor',
      body: 'prova em {daysUntil} dias. nada de pânico — uma hora hoje e amanhã já te deixa bem encaminhada. eu lembro você dos blocos.',
    },
    doutora: {
      title: '{subjectName} em {daysUntil} dias',
      body: 'Janela boa para começar a revisão. Distribua o conteúdo em blocos curtos ao longo dos próximos dias.',
    },
    irmao: {
      title: '{subjectName} em {daysUntil} dias, fica esperto',
      body: 'parece longe mas não é. uma hora por dia já resolve. melhor começar agora do que se enfiar no buraco na véspera.',
    },
  },

  // ---------------------------------------------------------------------------
  // conflict — duas ocorrências sobrepostas
  // params: { titleA, titleB, dateISO, timeOverlap }
  // ---------------------------------------------------------------------------
  conflict: {
    namorado: {
      title: 'amor, dois compromissos batendo',
      body: '{titleA} e {titleB} estão marcados juntos em {timeOverlap}. dá uma olhada para resolver antes que vire dor de cabeça.',
    },
    doutora: {
      title: 'Conflito de horário',
      body: '{titleA} e {titleB} sobrepostos em {timeOverlap}. Ajuste um dos eventos.',
    },
    irmao: {
      title: 'olha, dois compromissos no mesmo horário',
      body: '{titleA} e {titleB} estão batendo em {timeOverlap}. resolve isso agora, depois você esquece e dá ruim.',
    },
  },

  // ---------------------------------------------------------------------------
  // heavy-day — hoje ≥ 5h de eventos
  // params: { busyHours, eventCount }
  // ---------------------------------------------------------------------------
  'heavy-day': {
    namorado: {
      title: 'dia puxado hoje, doutora',
      body: '{eventCount} compromissos e cerca de {busyHours}h ocupadas. come direito, bebe água e separa um respiro entre eles. eu fico torcendo.',
    },
    doutora: {
      title: 'Dia carregado: {busyHours}h em {eventCount} eventos',
      body: 'Programe intervalos curtos entre compromissos e refeições leves.',
    },
    irmao: {
      title: 'dia puxado, prepara o corpo',
      body: '{eventCount} eventos e {busyHours}h cravadas. come direito, bebe água, e não tenta marcar mais nada hoje. para com isso.',
    },
  },

  // ---------------------------------------------------------------------------
  // free-day — agenda vazia hoje
  // params: { nextExamSubject, daysToExam }
  // ---------------------------------------------------------------------------
  'free-day': {
    namorado: {
      title: 'hoje está livre, amor',
      body: 'que tal puxar {nextExamSubject}? a prova é em {daysToExam} dias e meia hora hoje vale muito. depois descansa sem culpa.',
    },
    doutora: {
      title: 'Dia livre',
      body: 'Bom momento para revisar {nextExamSubject} ({daysToExam} dias até a prova). Bloco curto já adianta bastante.',
    },
    irmao: {
      title: 'dia livre, aproveita',
      body: 'puxa uma hora de {nextExamSubject} agora — a prova é em {daysToExam} dias. depois pode descansar com a consciência limpa.',
    },
  },

  // ---------------------------------------------------------------------------
  // free-block — janela livre ≥ 2h
  // params: { start, end, hours, dayLabel }
  // ---------------------------------------------------------------------------
  'free-block': {
    namorado: {
      title: 'janela livre {dayLabel}, doutora',
      body: '{hours}h livres entre {start} e {end}. se quiser, eu separo esse bloco para revisão e te aviso na hora de começar.',
    },
    doutora: {
      title: 'Bloco livre {dayLabel}: {start}–{end}',
      body: '{hours}h disponíveis. Janela útil para revisão ou tarefa longa.',
    },
    irmao: {
      title: '{hours}h livres {dayLabel}',
      body: 'das {start} às {end}. usa pelo menos metade para estudar, depois faz o que quiser. é negociação justa.',
    },
  },

  // ---------------------------------------------------------------------------
  // tip-no-exams — sem prova marcada para 30+ dias
  // params: (nenhum)
  // ---------------------------------------------------------------------------
  'tip-no-exams': {
    namorado: {
      title: 'nenhuma prova à vista, amor',
      body: 'momento ótimo para revisar conteúdo antigo e adiantar leitura. eu te lembro de manter a constância.',
    },
    doutora: {
      title: 'Sem provas marcadas',
      body: 'Período favorável para revisão espaçada e leitura adiantada. Mantenha blocos curtos diários.',
    },
    irmao: {
      title: 'sem prova marcada, aproveita',
      body: 'é agora que se ganha distância — revisão leve todo dia. não dorme no ponto e depois corre na véspera, hein.',
    },
  },

  // ---------------------------------------------------------------------------
  // tip-empty-plan — 0 disciplinas cadastradas
  // params: (nenhum)
  // ---------------------------------------------------------------------------
  'tip-empty-plan': {
    namorado: {
      title: 'agenda vazia ainda, doutora',
      body: 'começa cadastrando as disciplinas do semestre. o resto a gente monta por cima, com calma.',
    },
    doutora: {
      title: 'Plano vazio',
      body: 'Cadastre as disciplinas do semestre para começar a montar a agenda.',
    },
    irmao: {
      title: 'cadê as disciplinas, parça',
      body: 'põe as disciplinas do semestre aí primeiro. sem isso a agenda fica sem chão e o app não te ajuda em nada.',
    },
  },

  // ---------------------------------------------------------------------------
  // tip-long-block — bloco de aulas muito longo sem pausa
  // params: { hours, dayLabel }
  // ---------------------------------------------------------------------------
  'tip-long-block': {
    namorado: {
      title: 'bloco longo {dayLabel}, amor',
      body: '{hours}h seguidas sem pausa. coloca uma janela de 10 min no meio para água, banheiro e respirar. faz diferença.',
    },
    doutora: {
      title: 'Bloco contínuo de {hours}h {dayLabel}',
      body: 'Inclua pausa curta a cada 90 min para manter foco e bem-estar.',
    },
    irmao: {
      title: '{hours}h sem pausa {dayLabel}',
      body: 'isso é receita para apagar no meio. mete uma pausa de 10 min entre eles, sério. seu cérebro não é máquina.',
    },
  },

  // ---------------------------------------------------------------------------
  // tip-enable-reminders — notificações desativadas
  // params: (nenhum)
  // ---------------------------------------------------------------------------
  'tip-enable-reminders': {
    namorado: {
      title: 'ativa os lembretes, amor',
      body: 'com a permissão ligada eu te aviso antes de cada aula, prova e atividade. assim você só pensa em estudar.',
    },
    doutora: {
      title: 'Lembretes desativados',
      body: 'Ative as notificações do navegador para receber alertas automáticos dos eventos.',
    },
    irmao: {
      title: 'ativa os lembretes, esquecida',
      body: 'liga as notificações. assim você não vem chorar comigo que esqueceu a aula de novo. é um clique.',
    },
  },
};

// =============================================================================
// Render — substitui placeholders no template do modo escolhido
// =============================================================================

/**
 * Renderiza um insight com a copy do modo dado.
 * Placeholders ausentes em `params` viram string vazia (resiliente).
 */
export function renderInsight(
  insight: AssistantInsight,
  displayMode: DisplayMode,
): { title: string; body: string } {
  const tpl = INSIGHT_COPY[insight.code]?.[displayMode];
  if (!tpl) return { title: '', body: '' };
  return {
    title: interpolate(tpl.title, insight.params),
    body: interpolate(tpl.body, insight.params),
  };
}

function interpolate(
  template: string,
  params: Record<string, string | number | undefined>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = params[key];
    return v === undefined ? '' : String(v);
  });
}

// =============================================================================
// Organization tips — dicas gerais (não vinculadas a InsightCode)
// =============================================================================
//
// O painel "Como organizar" mostra 2–3 dessas, rotacionando por dia. Temas:
// preparar material na véspera, revisão ativa, pomodoro adaptado, regra das
// 2h antes de dormir, marcar lazer também, revisão espaçada para provas,
// separar tempo para você, organizar por blocos.

export interface OrgTip {
  title: string;
  body: string;
}

export const ORGANIZATION_TIPS: Record<DisplayMode, OrgTip[]> = {
  namorado: [
    {
      title: 'deixa o material pronto na noite anterior',
      body: 'amor, separa livro, jaleco e o que precisar antes de dormir. de manhã você só pega e sai, sem caos.',
    },
    {
      title: 'estuda ativo, não passivo',
      body: 'em vez de só reler, fecha o caderno e tenta explicar o assunto em voz alta. é cansativo mas é o que gruda.',
    },
    {
      title: 'blocos de 45 com pausa de 10',
      body: 'pomodoro adaptado para estudo médico: 45 min de foco, 10 de pausa de verdade. eu te aviso quando virar a hora.',
    },
    {
      title: 'duas horas antes de dormir, sem tela de estudo',
      body: 'doutora, seu cérebro precisa desligar para fixar o que aprendeu. leitura leve ou conversa nossa, vale tudo.',
    },
    {
      title: 'marca o lazer na agenda também',
      body: 'descanso não é luxo, é parte do plano. coloca um café, uma série, um passeio. eu trato como compromisso.',
    },
    {
      title: 'revisão espaçada para prova',
      body: 'mesmo conteúdo: dia 1, dia 3, dia 7. é o que faz a memória durar até a prova. eu te lembro do espaçamento.',
    },
    {
      title: 'separa um tempo para você todo dia',
      body: 'amor, 30 min só seus já mudam tudo. banho longo, alongamento, uma música. não é desperdício, é gasolina.',
    },
    {
      title: 'organiza por bloco de matéria, não por hora corrida',
      body: 'agrupar afins ajuda o cérebro a fixar. anatomia inteira num bloco, farmaco em outro. eu deixo as cores diferentes.',
    },
  ],

  doutora: [
    {
      title: 'Prepare o material na véspera',
      body: 'Reúna livros, jaleco e instrumentos na noite anterior. Reduz fricção da manhã e evita esquecimentos.',
    },
    {
      title: 'Estudo ativo supera releitura',
      body: 'Recuperação ativa (autoexplicação, flashcards, questões) gera retenção superior à leitura passiva.',
    },
    {
      title: 'Ciclos de 45+10 minutos',
      body: 'Pomodoro adaptado: 45 min de foco, 10 de pausa. Mantém atenção sem fadiga acumulada.',
    },
    {
      title: 'Sem estudo intenso 2h antes de dormir',
      body: 'A consolidação da memória depende do sono. Atividade leve antes de deitar melhora o aprendizado.',
    },
    {
      title: 'Inclua lazer na agenda',
      body: 'Tempo livre estruturado evita procrastinação difusa e reduz fadiga cognitiva.',
    },
    {
      title: 'Revisão espaçada para provas',
      body: 'Intervalos crescentes (dia 1, 3, 7) consolidam memória de longo prazo. Use para revisões de prova.',
    },
    {
      title: 'Reserve tempo pessoal diário',
      body: '30 min protegidos por dia para autocuidado mantêm produtividade sustentável ao longo do semestre.',
    },
    {
      title: 'Organize por blocos temáticos',
      body: 'Agrupar conteúdos afins facilita codificação e recuperação. Evite fragmentar matérias em horários soltos.',
    },
  ],

  irmao: [
    {
      title: 'deixa tudo pronto antes de dormir',
      body: 'separa jaleco, caderno, tudo. de manhã você é zumbi e esquece metade. faz isso sempre, sério.',
    },
    {
      title: 'só ler não cola nada',
      body: 'fecha o livro e tenta explicar para a parede. se travar, é porque não sabe. doloroso, mas funciona.',
    },
    {
      title: '45 min focado, 10 de pausa',
      body: 'sem celular nos 45. e a pausa é pausa de verdade, levanta da cadeira. ficar lá rolando feed não conta.',
    },
    {
      title: 'sem estudar pesado nas duas horas antes de dormir',
      body: 'seu cérebro precisa consolidar. não adianta enfiar conteúdo até as 2 da manhã, ele cospe tudo de volta.',
    },
    {
      title: 'marca o lazer na agenda também',
      body: 'sem descanso planejado você procrastina o dia inteiro. bota um café ou um filme lá, e cumpre.',
    },
    {
      title: 'revisa em dia 1, 3 e 7',
      body: 'revisão espaçada é o cheat code para prova. mesma matéria três vezes em datas certas. simples.',
    },
    {
      title: 'separa meia hora para você todo dia',
      body: '30 min sem estudo, sem culpa, sem celular se possível. essa é a coisa que mais gente esquece.',
    },
    {
      title: 'agrupa matérias parecidas',
      body: 'estuda anatomia em bloco, farmaco em bloco. ficar pulando de matéria toda hora é receita para não fixar nada.',
    },
  ],
};
