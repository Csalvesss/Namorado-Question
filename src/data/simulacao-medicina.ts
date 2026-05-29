// Modo Simulação — Medicina
// A aluna NÃO monta a receita. Ela RECEBE uma receita pronta (como se um
// paciente fictício tivesse chegado ao consultório com ela em mãos) e
// precisa INTERPRETAR e ORIENTAR o paciente.
//
// Diferença do receituário guiado: aqui o exercício é de leitura clínica
// + comunicação. O foco é pegar a armadilha que o paciente comumente
// entende errado e construir uma orientação verbal sólida.

export interface PrescritorFicticio {
  nome: string;
  registro: string;
  especialidade: string;
  clinica: string;
  endereco: string;
  telefone: string;
}

export interface ItemReceita {
  medicamento: string;
  apresentacao?: string;
  posologia: string;
  observacao?: string;
}

export interface ReceitaSimulacao {
  id: string;
  track: 'medicina' | 'odonto';
  especialidade: string;
  patientTag: string;
  patientContext: string;
  prescritor: PrescritorFicticio;
  pacienteNome: string;
  pacienteIdade?: string;
  data: string;
  itens: ItemReceita[];
  observacoesReceita?: string;
  answerKey: {
    identificacao: string;
    posologiaResumida: string;
    instrucoesChave: string[];
    sinaisAlarme: string[];
    armadilhas: string[];
  };
  teaching: string;
}

export const SIMULACAO_MEDICINA: ReceitaSimulacao[] = [
  // 1) CARDIOLOGIA — Varfarina em FA crônica (anticoagulante com janela estreita)
  {
    id: 'card-varfarina-fa',
    track: 'medicina',
    especialidade: 'Cardiologia',
    patientTag: 'Homem 72a, FA crônica',
    patientContext:
      'Seu Joaquim, 72 anos, chega ao consultório com a receita do cardiologista. Diz que "começou ontem aquele remedinho fino" e pergunta se pode comer a salada de couve que a esposa fez no almoço. Confessa também que toma chá de ginkgo "pra memória" todo dia.',
    prescritor: {
      nome: 'Dr. Renan Albuquerque Tavares',
      registro: 'CRM/SP 78.421',
      especialidade: 'Cardiologia',
      clinica: 'Clínica Cardiovascular Paulista',
      endereco: 'Av. Paulista, 1842 — Bela Vista, São Paulo/SP',
      telefone: '(11) 3287-4410',
    },
    pacienteNome: 'Joaquim Bento de Oliveira',
    pacienteIdade: '72 anos',
    data: '12/03/2026',
    itens: [
      {
        medicamento: 'Varfarina sódica 5 mg',
        apresentacao: '30 comprimidos',
        posologia:
          'Tomar 1 comprimido, via oral, 1 vez ao dia, sempre no mesmo horário (18h). Uso contínuo.',
        observacao: 'Coletar TP/INR em 7 dias. Meta INR 2,0–3,0.',
      },
    ],
    observacoesReceita: 'Retorno em 1 semana com exame em mãos. Suspender AAS prévio.',
    answerKey: {
      identificacao:
        'Varfarina 5 mg — anticoagulante oral antagonista da vitamina K (cumarínico). Indicação aqui: prevenção de AVC em FA não valvar.',
      posologiaResumida:
        '1 cp via oral, 1× ao dia, em horário FIXO (18h), uso contínuo, com INR seriado',
    instrucoesChave: [
        'Horário fixo todos os dias — atraso ou esquecimento muda o INR no dia seguinte',
        'Se esqueceu uma dose: tomar até 6h depois; passou disso, pular (NÃO dobrar)',
        'Dieta CONSISTENTE em vitamina K — não cortar couve/brócolis/espinafre, mas manter quantidade estável (oscilação derruba o INR)',
        'Suspender ginkgo, gengibre em alta dose, alho em cápsula — potencializam sangramento',
        'Informar TODO médico/dentista que usa varfarina ANTES de qualquer procedimento',
        'Coletar INR conforme solicitado — dose se ajusta pelo exame, não pelo sintoma',
      ],
      sinaisAlarme: [
        'Sangramento de gengiva persistente, urina escura/avermelhada, fezes pretas',
        'Hematomas espontâneos extensos ou inchaço dolorido em uma perna',
        'Queda da própria altura ou trauma craniano — procurar PS mesmo sem sintoma',
        'Cefaleia súbita intensa, alteração visual ou fala arrastada (alarme de sangramento intracraniano)',
      ],
      armadilhas: [
        'Cortar todo vegetal verde "porque tem vitamina K" — paradoxalmente desestabiliza o INR',
        'Tomar junto com fitoterápico de farmácia (ginkgo, ginseng) sem avisar — interação séria',
        'Achar que pode pular doses quando "se sente bem" — FA é silenciosa, o AVC não avisa',
        'Trocar entre marcas/genéricos sem dosar INR — bioequivalência é estreita nesse fármaco',
      ],
    },
    teaching:
      'Varfarina é o anticoagulante de margem terapêutica mais estreita do arsenal clínico. O paradoxo da couve precisa ser bem comunicado: a meta NÃO é eliminar vitamina K e sim manter ingestão constante — o problema é a oscilação, porque o ajuste de dose foi calibrado para uma dieta média. O ginkgo deve ser suspenso (efeito antiplaquetário aditivo, sangramento descrito até com INR em meta). Em FA não valvar e CHA2DS2-VASc alto, a alternativa moderna seria DOAC (apixabana, rivaroxabana), mas se o cardiologista escolheu varfarina presume-se indicação específica — clearance baixo, custo, ou valvopatia oculta. INR semanal até estabilizar, depois mensal.',
  },

  // 2) ENDOCRINOLOGIA — Insulinoterapia basal-bolus (DM1 ou DM2 insulinizado)
  {
    id: 'endo-insulina-basal-bolus',
    track: 'medicina',
    especialidade: 'Endocrinologia',
    patientTag: 'Mulher 58a, DM2 insulinizada',
    patientContext:
      'Dona Vera, 58 anos, chega à UBS com a receita da endocrinologista e dois frascos de insulina na bolsa de pano (sem cooler). Diz que "às vezes esquece a da noite porque já jantou" e que aplica "sempre no mesmo cantinho da barriga porque dói menos lá". Está com glicemia capilar de 312 mg/dL hoje.',
    prescritor: {
      nome: 'Dra. Camila Vasconcelos Pereira',
      registro: 'CRM/RJ 54.880',
      especialidade: 'Endocrinologia e Metabologia',
      clinica: 'Instituto de Endocrinologia Botafogo',
      endereco: 'Rua Voluntários da Pátria, 445 — Botafogo, Rio de Janeiro/RJ',
      telefone: '(21) 2538-9912',
    },
    pacienteNome: 'Vera Lúcia Almeida Cardoso',
    pacienteIdade: '58 anos',
    data: '20/02/2026',
    itens: [
      {
        medicamento: 'Insulina glargina U-100 (Lantus) 100 UI/mL',
        apresentacao: '1 caneta refil 3 mL',
        posologia:
          'Aplicar 22 UI, via subcutânea, 1× ao dia, às 22h (bedtime). Uso contínuo.',
      },
      {
        medicamento: 'Insulina lispro (Humalog) 100 UI/mL',
        apresentacao: '1 caneta refil 3 mL',
        posologia:
          'Aplicar 6 UI, via subcutânea, imediatamente antes do café da manhã, almoço e jantar. Ajustar pela contagem de carboidratos conforme orientação.',
      },
      {
        medicamento: 'Metformina 850 mg',
        apresentacao: '60 comprimidos',
        posologia: 'Tomar 1 comprimido, via oral, de 12 em 12 horas, junto com almoço e jantar. Uso contínuo.',
      },
    ],
    observacoesReceita: 'Glicemia capilar pré-prandial e bedtime. Retorno em 30 dias com mapa glicêmico.',
    answerKey: {
      identificacao:
        'Esquema basal-bolus: glargina (análogo de ação prolongada — basal) + lispro (análogo ultrarrápido — bolus prandial) + metformina (biguanida — sensibilização hepática).',
      posologiaResumida:
        'Glargina 22 UI SC à noite (22h) + lispro 6 UI SC antes das 3 refeições + metformina 850 mg VO 12/12h',
      instrucoesChave: [
        'Insulina FECHADA fica na geladeira (2–8°C); insulina EM USO pode ficar fora por até 28 dias, longe do sol/calor',
        'Rodar locais de aplicação SEMPRE — abdômen, coxa, braço, glúteo — lipodistrofia altera absorção',
        'Lispro: aplicar e comer em até 15 min (idealmente IMEDIATAMENTE antes); se atrasar, hipoglicemia',
        'Glargina: horário fixo, NÃO misturar com outra insulina na mesma seringa, NÃO agitar',
        'Metformina junto com refeição reduz desconforto GI; se diarreia persistir > 2 semanas, avisar',
        'Hipoglicemia (<70 mg/dL): regra dos 15 — 15 g de carboidrato simples (suco, sachê de açúcar) + medir em 15 min',
      ],
      sinaisAlarme: [
        'Hipoglicemia grave (sudorese fria, confusão, perda de consciência) — usar glucagon ou levar ao PS',
        'Hiperglicemia persistente >300 mg/dL com vômitos, hálito cetônico, sonolência (cetoacidose)',
        'Lesões/manchas escuras nos locais de aplicação ou abscesso',
        'Náusea persistente + dor abdominal alta com metformina (rara acidose láctica)',
      ],
      armadilhas: [
        'Aplicar SEMPRE no mesmo ponto — gera lipohipertrofia e absorção errática',
        'Esquecer a glargina à noite e "compensar de manhã" — vira sobreposição de pico',
        'Misturar glargina e lispro na mesma seringa — glargina precipita, perde efeito',
        'Pular a lispro porque "comeu pouco" sem ajustar — risco de hiperglicemia pós-prandial; o correto é ajustar dose, não pular',
      ],
    },
    teaching:
      'O basal-bolus mimetiza a fisiologia: glargina cobre o débito hepático noturno e o jejum (efeito sem pico por ~24h); lispro cobre o pico prandial (início em 10–15 min, pico em 1h). Os erros operacionais aqui são clássicos: (1) a paciente armazena insulina fora da geladeira no calor do RJ — degradação proteica reduz potência e explica glicemia de 312; (2) lipohipertrofia abdominal cria absorção imprevisível, é causa frequente de "insulina que parou de funcionar"; (3) glargina + lispro NUNCA na mesma seringa por incompatibilidade de pH (glargina é ácida, precipita em meio neutro). A metformina mantém-se mesmo insulinizada — atua na resistência hepática e reduz dose total de insulina necessária. Educação em diabetes é a intervenção de maior impacto custo-benefício nessa paciente, mais do que ajuste fino de dose.',
  },

  // 3) PNEUMOLOGIA — Asma persistente moderada (corticoide inalatório + SABA)
  {
    id: 'pneumo-asma-bombinha',
    track: 'medicina',
    especialidade: 'Pneumologia',
    patientTag: 'Homem 28a, asma persistente',
    patientContext:
      'Rafael, 28 anos, professor de educação física, traz a receita do pneumo da última crise no PS. Diz que "usa a bombinha azul quando aperta" e que parou a "bombinha laranja faz três dias porque achou que era a mesma coisa". Volta com chiado em consulta.',
    prescritor: {
      nome: 'Dra. Fernanda Sobral Mendonça',
      registro: 'CRM/MG 41.207',
      especialidade: 'Pneumologia',
      clinica: 'Centro Respiratório Belo Horizonte',
      endereco: 'Av. do Contorno, 6789 — Funcionários, Belo Horizonte/MG',
      telefone: '(31) 3284-1100',
    },
    pacienteNome: 'Rafael dos Santos Moreira',
    pacienteIdade: '28 anos',
    data: '05/04/2026',
    itens: [
      {
        medicamento: 'Budesonida + Formoterol 200/6 mcg (Symbicort Turbuhaler)',
        apresentacao: '1 inalador com 60 doses',
        posologia:
          'Inalar 1 jato, via inalatória, de 12 em 12 horas (manhã e noite). Uso CONTÍNUO de manutenção. Bochechar a boca após cada uso.',
      },
      {
        medicamento: 'Salbutamol 100 mcg (Aerolin spray)',
        apresentacao: '1 frasco aerossol 200 doses',
        posologia:
          'Inalar 2 jatos, via inalatória, somente em caso de falta de ar, chiado ou aperto no peito. Espaçar 1 minuto entre jatos. Não exceder 8 jatos em 24h.',
      },
    ],
    observacoesReceita: 'Retorno em 30 dias com diário de uso da bombinha de resgate.',
    answerKey: {
      identificacao:
        'Symbicort (budesonida = corticoide inalatório / formoterol = LABA β2-agonista de ação prolongada): MANUTENÇÃO. Aerolin (salbutamol = SABA β2-agonista de ação curta): RESGATE.',
      posologiaResumida:
        'Symbicort 1 jato 12/12h DIÁRIO (manutenção) + Aerolin 2 jatos SOMENTE em crise (resgate)',
      instrucoesChave: [
        'A "laranja" (Symbicort) é a que CONTROLA — usar TODO DIA, mesmo sem sintoma. É ela que evita crise',
        'A "azul" (Aerolin) é só para alívio rápido. Se precisar usar mais de 2× por semana, asma está descontrolada — voltar à consulta',
        'Técnica Turbuhaler: dispositivo na vertical, girar base até o clique, expirar LONGE do bocal, inspirar FORTE e profundo, prender 10s',
        'Técnica do spray (Aerolin): agitar, expirar, jato no início da inspiração lenta, prender 10s. Idealmente com espaçador',
        'BOCHECHAR e cuspir após o corticoide (Symbicort) — previne candidíase oral e disfonia',
        'Manter a vacina anual de influenza e pneumocócica em dia',
      ],
      sinaisAlarme: [
        'Crise que não cede com 4 jatos de salbutamol em 1h — PS imediato',
        'Cianose, fala entrecortada, sonolência durante crise — emergência',
        'Uso de resgate diário ou mais de 1 frasco de salbutamol/mês — sinal de descontrole grave',
        'Pico de fluxo expiratório <60% do basal pessoal',
      ],
      armadilhas: [
        'Achar que "bombinha é bombinha" — confundir resgate com manutenção é o erro mais comum',
        'Parar o corticoide inalatório quando "melhora" — ele é antiinflamatório de uso contínuo, não age na hora',
        'Esquecer de bochechar e desenvolver sapinho — paciente acha que é "alergia ao remédio"',
        'Técnica inalatória ruim — até 70% dos asmáticos erram a técnica e o remédio fica na garganta',
      ],
    },
    teaching:
      'A dicotomia controlador × resgate é o conceito que mais salva vida na asma. Budesonida é o tratamento da DOENÇA (inflamação crônica das vias aéreas); salbutamol trata o SINTOMA (broncoespasmo agudo). O paciente que parou o Symbicort vai voltar ao PS — é matemática. GINA 2024 inclusive já contraindica monoterapia com SABA na asma persistente; toda asma persistente deve receber CI. Sobre técnica: o Turbuhaler exige inspiração FORTE (fluxo >60 L/min) — diferente do spray, que pede inspiração LENTA. Erro de técnica explica boa parte das "asmas refratárias". Candidíase oral é o efeito adverso local mais comum dos CI e o motivo de muito abandono — bochecho previne e a aderência se mantém.',
  },

  // 4) PSIQUIATRIA — ISRS para depressão (janela de início, suspensão)
  {
    id: 'psiq-sertralina-depressao',
    track: 'medicina',
    especialidade: 'Psiquiatria',
    patientTag: 'Mulher 34a, episódio depressivo',
    patientContext:
      'Mariana, 34 anos, advogada, retorna 10 dias após início do antidepressivo. Diz que "não sentiu nada de melhora e ainda apareceu enjoo e dor de cabeça" — está pensando em parar. Pergunta também se pode tomar com a "tarja preta" do sono que a amiga emprestou.',
    prescritor: {
      nome: 'Dr. Eduardo Marques Quintela',
      registro: 'CRM/SP 102.554',
      especialidade: 'Psiquiatria',
      clinica: 'Consultório Pinheiros — Saúde Mental',
      endereco: 'Rua dos Pinheiros, 1456 — Pinheiros, São Paulo/SP',
      telefone: '(11) 3815-7720',
    },
    pacienteNome: 'Mariana Figueiredo Brandão',
    pacienteIdade: '34 anos',
    data: '28/03/2026',
    itens: [
      {
        medicamento: 'Sertralina 50 mg',
        apresentacao: '30 comprimidos',
        posologia:
          'Tomar 1 comprimido, via oral, pela manhã, junto com o café, por 7 dias. Após 7 dias, aumentar para 2 comprimidos (100 mg) pela manhã. Uso contínuo.',
        observacao: 'Esquema de titulação. Não suspender abruptamente.',
      },
    ],
    observacoesReceita: 'Retorno em 4 semanas. Em caso de piora súbita ou ideação suicida, procurar atendimento.',
    answerKey: {
      identificacao:
        'Sertralina 50 mg — inibidor seletivo da recaptação de serotonina (ISRS). Primeira linha para depressão e ansiedade.',
      posologiaResumida:
        '50 mg VO pela manhã por 7 dias, depois titular para 100 mg/dia. Uso contínuo (mínimo 6–9 meses após remissão)',
      instrucoesChave: [
        'EFEITO TERAPÊUTICO leva 2 a 4 semanas para começar e 6 a 8 para pleno — 10 dias é cedo demais para julgar',
        'Efeitos adversos do início (náusea, cefaleia, insônia, ansiedade paradoxal) costumam ceder em 1–2 semanas — não confundir com "remédio errado"',
        'Tomar pela manhã (sertralina pode dar insônia se à noite); com alimento reduz náusea',
        'NÃO suspender abruptamente — síndrome de descontinuação (tontura, parestesia, "choques", síndrome gripal). Sempre desmamar com o médico',
        'Risco aumentado de sangramento — atenção se uso concomitante de AINE, AAS ou anticoagulante',
        'Evitar associação com qualquer "tarja preta" sem prescrição — risco de síndrome serotoninérgica com tramadol, triptanos, IMAO, MDMA',
      ],
      sinaisAlarme: [
        'Ideação suicida nova ou piorada — especialmente nas primeiras 2 semanas em <25 anos (FDA black box)',
        'Síndrome serotoninérgica: agitação, tremor, hiperreflexia, hipertermia, diarreia — emergência',
        'Sangramento atípico (epistaxe, gengival, melena) — interação ou efeito antiplaquetário',
        'Inquietação intensa (acatisia) ou virada maníaca (euforia, insônia, gastos impulsivos)',
      ],
      armadilhas: [
        'Parar em 1–2 semanas porque "não fez efeito" — janela farmacológica é de 2–4 semanas',
        'Parar de uma vez ao "se sentir bem" — síndrome de descontinuação ou recaída',
        'Combinar com tramadol, sumatriptano, MDMA, erva-de-são-joão — risco de síndrome serotoninérgica',
        'Beber álcool em quantidade pensando "é só remédio de cabeça" — potencializa sedação e disforia',
      ],
    },
    teaching:
      'O paradoxo do ISRS: efeitos colaterais aparecem na semana 1, efeito terapêutico na semana 4. Essa janela é o motivo número 1 de abandono — a paciente está exatamente nesse vale e precisa de psicoeducação, não de troca de medicação. Náusea ocorre por estímulo serotoninérgico do TGI (5-HT3), tende a ceder com tolerância. A "tarja preta" mais comum que se mistura erroneamente é clonazepam ou zolpidem — pode-se associar com cautela e prescrição, mas tramadol, triptanos e linezolida são interações de risco real para síndrome serotoninérgica. Tratamento da depressão é de pelo menos 6–9 meses após remissão (primeiro episódio) e indefinido em recorrências. O descontinuação deve ser sempre gradual ao longo de semanas — mesmo a sertralina, que tem meia-vida intermediária (26h), tem síndrome de retirada se interrompida abruptamente.',
  },

  // 5) GASTROENTEROLOGIA — Esquema tríplice para H. pylori
  {
    id: 'gastro-hpylori-triplice',
    track: 'medicina',
    especialidade: 'Gastroenterologia',
    patientTag: 'Homem 46a, úlcera + H. pylori',
    patientContext:
      'Seu Antonio, 46 anos, taxista, retorna após EDA com biópsia positiva para H. pylori (úlcera duodenal). Chega com 3 caixas na mão e cara confusa: "Doutor, são três remédios ao mesmo tempo? E é só por dois semanas? Posso tomar uma cervejinha no fim de semana?".',
    prescritor: {
      nome: 'Dra. Patrícia Holanda Cavalcanti',
      registro: 'CRM/PE 28.991',
      especialidade: 'Gastroenterologia',
      clinica: 'Clínica do Aparelho Digestivo Boa Viagem',
      endereco: 'Av. Conselheiro Aguiar, 2543 — Boa Viagem, Recife/PE',
      telefone: '(81) 3325-6677',
    },
    pacienteNome: 'Antonio Carlos Bezerra da Silva',
    pacienteIdade: '46 anos',
    data: '18/04/2026',
    itens: [
      {
        medicamento: 'Omeprazol 20 mg',
        apresentacao: '28 cápsulas',
        posologia:
          'Tomar 1 cápsula, via oral, de 12 em 12 horas (jejum/30 min antes das refeições), por 14 dias.',
      },
      {
        medicamento: 'Amoxicilina 500 mg',
        apresentacao: '56 cápsulas',
        posologia: 'Tomar 2 cápsulas (1 g), via oral, de 12 em 12 horas, por 14 dias.',
      },
      {
        medicamento: 'Claritromicina 500 mg',
        apresentacao: '28 comprimidos',
        posologia: 'Tomar 1 comprimido, via oral, de 12 em 12 horas, por 14 dias.',
      },
    ],
    observacoesReceita:
      'Esquema tríplice OAC 14 dias. Manter omeprazol em monoterapia por mais 4–6 semanas após o esquema. Teste de erradicação (ureia respiratória ou antígeno fecal) em 4 semanas após término — SEM IBP nas 2 semanas que antecedem.',
    answerKey: {
      identificacao:
        'Esquema tríplice OAC (omeprazol + amoxicilina + claritromicina) por 14 dias para erradicação de H. pylori em úlcera péptica.',
      posologiaResumida:
        'Omeprazol 20 mg 12/12h + Amoxicilina 1 g 12/12h + Claritromicina 500 mg 12/12h, todos por 14 DIAS corridos',
      instrucoesChave: [
        'TODOS os três medicamentos JUNTOS, 12/12h, por 14 DIAS completos — não pode parar antes nem pular dose (gera resistência)',
        'Omeprazol em jejum 30 min ANTES de comer; amoxi e claritro podem ser com alimento se houver náusea',
        'PROIBIDO álcool durante o esquema — risco de reação dissulfiram-like com o tinidazol/metronidazol (se houver) e potencializa hepatotoxicidade',
        'Gosto metálico, fezes amolecidas e candidíase são esperados — não suspender por isso',
        'Teste de cura (ureia respiratória ou antígeno fecal) 4 semanas após o término, SEM USAR IBP nas 2 semanas anteriores ao teste — IBP dá falso negativo',
        'Manter omeprazol em monoterapia por mais 4–6 semanas após o esquema para cicatrização da úlcera',
      ],
      sinaisAlarme: [
        'Diarreia profusa, com sangue ou muco — possível colite por C. difficile',
        'Icterícia, urina escura, dor em hipocôndrio direito — hepatotoxicidade',
        'Hematêmese, melena, dor abdominal intensa — sangramento ulceroso',
        'Palpitações ou síncope — claritromicina prolonga QT (cuidar interação com outros prolongadores)',
      ],
      armadilhas: [
        'Parar em 7 dias "porque melhorou" — induz resistência bacteriana e falha terapêutica',
        'Tomar só 2 dos 3 — esquema sem o ATB de uma classe não erradica e seleciona resistência',
        'Beber cerveja "só no fim de semana" — interação com a flora hepática e gástrica, piora sintomas',
        'Fazer teste de cura com IBP ainda ativo — falso negativo, paciente recebe alta com bactéria viva',
      ],
    },
    teaching:
      'O esquema tríplice OAC é o pilar da erradicação. A duração de 14 dias é o padrão atual em regiões com resistência à claritromicina >15% (Brasil entra nesse grupo); regimes de 7 dias estão em desuso. O IBP eleva o pH gástrico aumentando a atividade dos antibióticos e reduzindo a replicação bacteriana — não é coadjuvante secundário, é parte essencial. Aderência abaixo de 80% derruba a taxa de erradicação de ~85% para <60% e ainda gera resistência. O teste de cura sem janela de IBP é um erro frequente e custoso: paciente faz teste, vem negativo (porque o IBP suprime a bactéria), recebe alta — e volta meses depois com úlcera. Em falha do esquema OAC, o resgate é tetraciclina + metronidazol + bismuto (esquema quádruplo) ou esquema com levofloxacino.',
  },

  // 6) REUMATOLOGIA — Prednisona com desmame programado
  {
    id: 'reumato-prednisona-desmame',
    track: 'medicina',
    especialidade: 'Reumatologia',
    patientTag: 'Mulher 62a, polimialgia reumática',
    patientContext:
      'Dona Cleide, 62 anos, com polimialgia reumática, está há 3 meses em corticoide. Chega trazendo a receita "do desmame" e pergunta: "Posso parar de uma vez porque já estou ótima? E essa caixinha pequena de cálcio, posso tomar junto com o leite?". Refere também ganho de 4 kg e episódios de azia.',
    prescritor: {
      nome: 'Dr. Henrique Pessoa Drummond',
      registro: 'CRM/RJ 62.118',
      especialidade: 'Reumatologia',
      clinica: 'Centro de Reumatologia Tijuca',
      endereco: 'Rua Conde de Bonfim, 887 — Tijuca, Rio de Janeiro/RJ',
      telefone: '(21) 2576-3340',
    },
    pacienteNome: 'Cleide Aparecida Ramos',
    pacienteIdade: '62 anos',
    data: '02/05/2026',
    itens: [
      {
        medicamento: 'Prednisona 5 mg',
        apresentacao: '60 comprimidos',
        posologia:
          'Tomar 3 comprimidos (15 mg), via oral, 1× ao dia pela manhã, junto com café, por 14 dias. Após 14 dias, reduzir para 2 comprimidos (10 mg)/dia por mais 14 dias. Após esse período, reduzir para 1 comprimido (5 mg)/dia por 14 dias. Retorno antes de suspender.',
        observacao: 'Desmame gradual. Não interromper sem reavaliação.',
      },
      {
        medicamento: 'Carbonato de cálcio 500 mg + Vitamina D 400 UI',
        apresentacao: '60 comprimidos',
        posologia: 'Tomar 1 comprimido, via oral, de 12 em 12 horas, longe das refeições principais e do leite.',
      },
      {
        medicamento: 'Omeprazol 20 mg',
        apresentacao: '30 cápsulas',
        posologia: 'Tomar 1 cápsula, via oral, em jejum, 30 min antes do café, uso contínuo enquanto durar o corticoide.',
      },
    ],
    observacoesReceita: 'Densitometria óssea em 6 meses. Monitorar PA, glicemia e peso mensalmente.',
    answerKey: {
      identificacao:
        'Prednisona 5 mg — corticoide sistêmico em desmame escalonado. Cálcio+D para profilaxia de osteoporose induzida por corticoide. Omeprazol para gastroproteção.',
      posologiaResumida:
        'Prednisona 15 mg/dia × 14d → 10 mg/dia × 14d → 5 mg/dia × 14d → retorno antes de zerar. Tomar pela manhã. + Cálcio/D 2×/dia + Omeprazol 1×/dia',
      instrucoesChave: [
        'NUNCA parar corticoide de uma vez após >2 semanas de uso — risco de insuficiência adrenal aguda (crise addisoniana)',
        'Tomar pela manhã (mimetiza ritmo circadiano do cortisol; reduz insônia)',
        'Tomar com alimento — reduz gastrite; manter omeprazol enquanto usar o corticoide',
        'Cálcio + vit D: tomar LONGE do leite e LONGE de levotiroxina/bisfosfonato/tetraciclina (quelação)',
        'Reduzir sal (retenção hídrica/HAS), açúcar simples (hiperglicemia), e aumentar atividade física (perda muscular e óssea)',
        'Comunicar uso de corticoide ANTES de qualquer cirurgia, infecção grave ou estresse maior — pode precisar dose de estresse',
      ],
      sinaisAlarme: [
        'Febre, ferida que não cicatriza, sinais de infecção sem outros sintomas (corticoide mascara)',
        'Fraqueza extrema, hipotensão, hipoglicemia, náusea/vômito após redução de dose (insuficiência adrenal)',
        'Dor lombar súbita ou de costela sem trauma (fratura osteoporótica)',
        'Visão embaçada, dor ocular, halo (catarata/glaucoma esteroidal)',
        'Sintomas psiquiátricos novos: euforia, insônia, paranoia (psicose esteroidal)',
      ],
      armadilhas: [
        'Parar de uma vez "porque melhorou" — supressão adrenal exige semanas para recuperação',
        'Tomar cálcio junto com leite/iogurte — saturação de absorção, perda do suplemento',
        'Achar que ganho de peso é "boa alimentação" — é redistribuição central (face de lua, giba) e retenção',
        'Voltar à dose alta sozinha em "crise de dor" sem reavaliar diagnóstico — pode ser efeito rebote, não recidiva',
      ],
    },
    teaching:
      'Corticoide de uso >2 semanas suprime o eixo HHA — o córtex adrenal "desliga" porque o feedback negativo da prednisona inibe ACTH. Suspensão abrupta deixa o paciente sem cortisol endógeno por dias a semanas, e em estresse (infecção, cirurgia) o resultado é crise addisoniana: hipotensão, hipoglicemia, choque. Desmame gradual permite o eixo religar. Profilaxia tríplice é mandatória: (1) gastroproteção com IBP — risco aumentado de úlcera, especialmente se combinado com AINE; (2) cálcio + vitamina D — perda óssea começa nas primeiras semanas, com pico nos 6 primeiros meses; (3) atenção à glicemia, PA e peso. Em uso >3 meses de >7,5 mg/dia, considerar bisfosfonato profilático. A dica do leite afasta a quelação intestinal (cálcio-fosfato, cálcio-tetraciclina). O omeprazol em si tem implicação na absorção de cálcio em uso muito prolongado — outra razão para reavaliar todos esses fármacos ao longo do tempo.',
  },

  // 7) INFECTOLOGIA — RIPE para tuberculose pulmonar
  {
    id: 'infecto-tuberculose-ripe',
    track: 'medicina',
    especialidade: 'Infectologia',
    patientTag: 'Homem 39a, TB pulmonar',
    patientContext:
      'Carlos, 39 anos, pedreiro, recebeu o diagnóstico de tuberculose pulmonar (BAAR positivo, GeneXpert sensível) e chega na UBS com a cartela RIPE para começar. Pergunta: "Doutor, vou ficar com a urina vermelha? Meu vizinho disse que tomou e ficou. E posso continuar com a cervejinha do fim de semana?". Tabagista, 1 dose de pinga por dia.',
    prescritor: {
      nome: 'Dra. Beatriz Salgado Nogueira',
      registro: 'CRM/BA 38.704',
      especialidade: 'Infectologia',
      clinica: 'Programa de Controle da Tuberculose — UBS Liberdade',
      endereco: 'Rua da Liberdade, 234 — Salvador/BA',
      telefone: '(71) 3344-2200',
    },
    pacienteNome: 'Carlos Henrique de Souza',
    pacienteIdade: '39 anos',
    data: '10/05/2026',
    itens: [
      {
        medicamento: 'Rifampicina 150 mg + Isoniazida 75 mg + Pirazinamida 400 mg + Etambutol 275 mg (4 em 1 — RIPE)',
        apresentacao: '180 comprimidos (estoque para 2 meses de fase intensiva)',
        posologia:
          'Tomar 4 comprimidos, via oral, em JEJUM (1h antes do café), em dose única diária, por 2 meses (fase intensiva). Após 2 meses, trocar para esquema RH (rifampicina + isoniazida) por mais 4 meses.',
        observacao: 'Peso 65 kg. Tratamento Diretamente Observado (TDO) recomendado.',
      },
      {
        medicamento: 'Piridoxina (vitamina B6) 50 mg',
        apresentacao: '30 comprimidos',
        posologia: 'Tomar 1 comprimido, via oral, 1× ao dia, junto ao RIPE. Uso durante todo o tratamento.',
      },
    ],
    observacoesReceita:
      'Notificação compulsória feita. Avaliar contactantes domiciliares. Testar HIV. Baciloscopia mensal de controle. Retorno em 30 dias com função hepática.',
    answerKey: {
      identificacao:
        'Esquema RIPE (Rifampicina + Isoniazida + Pirazinamida + Etambutol) — fase intensiva de 2 meses para TB pulmonar sensível, seguida de fase de manutenção RH por 4 meses (total 6 meses). Piridoxina previne neuropatia por isoniazida.',
      posologiaResumida:
        '4 cp 4-em-1 VO em JEJUM, 1× ao dia, por 2 meses → depois RH por 4 meses (total: 6 meses). + B6 1 cp/dia',
      instrucoesChave: [
        'EM JEJUM — 1h antes ou 2h após refeição. Comida cai a absorção de rifampicina pela metade',
        'Tratamento de 6 MESES é o MÍNIMO — interrupção precoce gera resistência (TB multidroga-resistente é tragédia individual e de saúde pública)',
        'Urina, lágrima, suor LARANJA-AVERMELHADOS são esperados (rifampicina) — coram lentes de contato permanentemente',
        'PROIBIDO álcool — hepatotoxicidade aditiva (R, I e P são todos hepatotóxicos)',
        'Rifampicina é INDUTOR enzimático potente — diminui efeito de anticoncepcional, anticoagulante, antirretroviral, corticoide. Trocar ACO por método de barreira ou DIU',
        'Tratamento Diretamente Observado (TDO) na UBS — vai melhorar a aderência e o desfecho',
        'B6 (piridoxina) previne neuropatia periférica da isoniazida, essencial em alcoolista, diabético, gestante, HIV',
      ],
      sinaisAlarme: [
        'Icterícia, náusea persistente, dor em hipocôndrio direito — hepatotoxicidade (suspender e reavaliar)',
        'Alteração visual: borramento, perda de discriminação verde-vermelho (neurite óptica por etambutol)',
        'Parestesia em pés/mãos (neuropatia por isoniazida — checar adesão à B6)',
        'Hemoptise nova ou volumosa, febre persistente após 2 meses (suspeitar resistência/falha)',
        'Rash + febre + linfonodos (DRESS por rifampicina)',
      ],
      armadilhas: [
        'Parar quando "se sentir bom" em 2–3 meses — leva à recidiva e à TB resistente',
        'Tomar com leite/comida pesada — perde absorção, vira tratamento subterapêutico',
        'Continuar com pílula anticoncepcional — rifampicina anula, alto risco de gravidez não planejada',
        'Misturar álcool — soma hepatotoxicidade dos 3 fármacos. Especialmente arriscado no etilista crônico',
        'Achar que urina vermelha é "sangue" e abandonar — sempre antecipar essa pergunta na consulta',
      ],
    },
    teaching:
      'O esquema RIPE brasileiro segue diretriz do Ministério da Saúde: 2 meses RIPE + 4 meses RH em adultos com TB sensível. Cada droga tem uma toxicidade-marca: Rifampicina (alaranjamento, indução enzimática, hepatite), Isoniazida (neuropatia, hepatite — daí a B6), Pirazinamida (hiperuricemia, hepatite), Etambutol (neurite óptica — sempre checar acuidade e visão de cores antes e durante). A indução enzimática da rifampicina é talvez a interação mais subestimada na clínica geral: ela acelera metabolismo de praticamente tudo que passa por CYP3A4. Para a contracepção, o protocolo oficial é trocar ACO por método não hormonal durante e até 1 mês após o RIPE. Em alcoolista, o tripé de risco é hepatite medicamentosa, neuropatia (carência de B6 prévia) e baixa aderência — TDO obrigatório e B6 mandatória. TB é doença de notificação compulsória; deve-se investigar contactantes e descartar HIV em todo paciente novo.',
  },

  // 8) GERIATRIA — Polifarmácia em idoso (interações, cascata)
  {
    id: 'geriatria-polifarmacia-idoso',
    track: 'medicina',
    especialidade: 'Geriatria',
    patientTag: 'Idoso 81a, polifarmácia',
    patientContext:
      'Seu Aldemir, 81 anos, chega com a filha trazendo "todas as receitas que ele toma". A filha diz que ele caiu duas vezes nas últimas 3 semanas, está mais sonolento de manhã e teve um "soluço" de confusão à noite. A lista: clonazepam para "dormir", amitriptilina para "dor nas costas", oxibutinina para "incontinência" que o urologista passou, e captopril 25 mg 3×/dia. Pressão hoje: 102×64 mmHg.',
    prescritor: {
      nome: 'Dr. Otávio Bittencourt Ramalho',
      registro: 'CRM/RS 45.882',
      especialidade: 'Clínica Médica',
      clinica: 'Clínica Geral Moinhos',
      endereco: 'Rua Padre Chagas, 312 — Moinhos de Vento, Porto Alegre/RS',
      telefone: '(51) 3221-8800',
    },
    pacienteNome: 'Aldemir Pacheco da Rosa',
    pacienteIdade: '81 anos',
    data: '22/04/2026',
    itens: [
      {
        medicamento: 'Clonazepam 2 mg',
        apresentacao: '30 comprimidos',
        posologia: 'Tomar 1 comprimido, via oral, à noite, ao deitar. Uso contínuo.',
      },
      {
        medicamento: 'Amitriptilina 25 mg',
        apresentacao: '30 comprimidos',
        posologia: 'Tomar 1 comprimido, via oral, à noite. Uso contínuo.',
      },
      {
        medicamento: 'Oxibutinina 5 mg',
        apresentacao: '30 comprimidos',
        posologia: 'Tomar 1 comprimido, via oral, de 8 em 8 horas. Uso contínuo.',
      },
      {
        medicamento: 'Captopril 25 mg',
        apresentacao: '60 comprimidos',
        posologia: 'Tomar 1 comprimido, via oral, de 8 em 8 horas. Uso contínuo.',
      },
    ],
    observacoesReceita: 'Retorno em 60 dias.',
    answerKey: {
      identificacao:
        'Receita com QUATRO fármacos potencialmente inapropriados em idoso (PPI — Critérios de Beers/STOPP): clonazepam (BZD de meia-vida intermediária), amitriptilina (tricíclico anticolinérgico), oxibutinina (anticolinérgico vesical), captopril (esquema 3×/dia desnecessariamente fracionado para IECA).',
      posologiaResumida:
        'NÃO orientar continuidade. Encaminhar para desprescrição: 3 fármacos com carga anticolinérgica/sedativa em paciente que já caiu e está com hipotensão. Captopril 3×/dia pode ser trocado por IECA 1×/dia (enalapril/lisinopril).',
      instrucoesChave: [
        'NÃO suspender clonazepam de uma vez — desmame gradual ao longo de 8–12 semanas para evitar rebote e convulsão',
        'Amitriptilina em idoso é PROIBIDA na prática moderna — anticolinérgica, prolonga QT, causa retenção urinária e queda. Substituir por gabapentina/nortriptilina/duloxetina conforme o tipo de dor',
        'Oxibutinina cruza barreira hematoencefálica e causa confusão. Substituir por solifenacina/darifenacina ou treinar bexiga; ainda melhor reavaliar diagnóstico de incontinência',
        'Captopril 3×/dia é incômodo e dispensável — trocar por enalapril ou lisinopril 1×/dia. Mas com PA 102×64 e quedas, primeiro REDUZIR/SUSPENDER o anti-hipertensivo, não trocar',
        'A queda recorrente + sonolência + confusão = síndrome geriátrica clássica de polifarmácia. Revisar TODOS os medicamentos a cada consulta',
        'Educar a família: medicamento "para dormir", "para dor", "pra xixi" — todos podem ser causa das quedas; não são inocentes',
      ],
      sinaisAlarme: [
        'Nova queda (especialmente com TCE) — internação e revisão urgente',
        'Confusão aguda (delirium) — investigar infecção, distúrbio metabólico, fármaco novo',
        'Síncope, tontura postural (hipotensão ortostática pelo captopril em excesso)',
        'Retenção urinária aguda, constipação severa, glaucoma agudo (carga anticolinérgica)',
        'Sintomas de abstinência se BZD for retirado abruptamente: tremor, agitação, convulsão',
      ],
      armadilhas: [
        'Cascata da prescrição: oxibutinina foi dada para incontinência que pode ter sido causada pelos OUTROS fármacos. Tratar efeito colateral com mais remédio é o erro central',
        'Manter BZD "porque dorme bem" — risco-benefício invertido no idoso (queda, fratura de quadril, demência)',
        'Trocar amitriptilina por outro tricíclico — todos têm carga anticolinérgica significativa',
        'Achar que PA 102×64 em idoso de 81 anos é "ótima" — em idoso frágil meta de PA é mais frouxa (140–150/80), hipotensão causa AVC e quedas',
      ],
    },
    teaching:
      'Esta receita é um manual de PPI (potentially inappropriate prescriptions). Beers e STOPP listam clonazepam, amitriptilina e oxibutinina como evitar-se em >65 anos. A soma de 3 fármacos com carga anticolinérgica e sedativa explica TODA a clínica: sonolência matinal (BZD com t½ ~30h em idoso), confusão (anticolinérgicos atravessam BHE), quedas (sedação + hipotensão pelo captopril). A cascata clássica: paciente queixa-se de incontinência → urologista prescreve oxibutinina → confusão piora → família atribui à "idade" → ciclo. A intervenção começa pela DESPRESCRIÇÃO sistemática: (1) reduzir captopril/avaliar suspensão do anti-hipertensivo com PA 102×64 e quedas; (2) iniciar desmame de clonazepam (10–25% da dose a cada 1–2 semanas); (3) trocar amitriptilina por gabapentina ou nortriptilina; (4) reavaliar diagnóstico de incontinência sem oxibutinina antes de outra droga. Em idoso, "menos é mais" não é provérbio — é evidência. Cada medicamento novo precisa passar pelo teste: "se eu retirasse 3 dos remédios atuais, qual sintoma realmente voltaria?".',
  },
];
