// Banco de bilhetes rotativos. Cada item aparece por uma janela de 5 horas.
// Mistura: cartas curtas no estilo Mauricio de Sousa (simples, fofas),
// trechos adaptados de Vinicius, Drummond, Neruda, Mario Quintana,
// e mensagens diretas dele para ela.

export type BilheteMood = 'amor' | 'pausa' | 'estudo' | 'poema';

export interface Bilhete {
  id: string;
  title?: string;
  body: string;
  mood: BilheteMood;
}

export const BILHETES: Bilhete[] = [
  // amor (cartinhas curtas)
  {
    id: 'amor-01',
    title: 'minha doutora,',
    body: 'hoje você é o melhor motivo do meu dia. amanhã também.',
    mood: 'amor',
  },
  {
    id: 'amor-02',
    title: 'vida,',
    body: 'te amo até onde sua paciência alcança. e ela alcança longe.',
    mood: 'amor',
  },
  {
    id: 'amor-03',
    title: 'doutora,',
    body: 'minha pessoa favorita do mundo, com folga, é você.',
    mood: 'amor',
  },
  {
    id: 'amor-04',
    title: 'amor,',
    body: 'sua cara estudando é a coisa mais bonita que eu vejo no dia.',
    mood: 'amor',
  },
  {
    id: 'amor-05',
    title: 'vida,',
    body: 'eu te amo do tamanho do mundo. e ainda sobra.',
    mood: 'amor',
  },
  {
    id: 'amor-06',
    title: 'minha doutora,',
    body: 'no fim do dia, você é o meu lugar de chegar.',
    mood: 'amor',
  },
  {
    id: 'amor-07',
    title: 'amor,',
    body: 'quando você dorme, eu fico aqui pensando: que sorte a minha.',
    mood: 'amor',
  },
  {
    id: 'amor-08',
    title: 'doutora,',
    body: 'qualquer caminho que você escolher, eu vou junto. de mão dada.',
    mood: 'amor',
  },
  {
    id: 'amor-09',
    title: 'vida,',
    body: 'eu te admiro tanto que dói um pouquinho. do bom tipo de dor.',
    mood: 'amor',
  },
  {
    id: 'amor-10',
    title: 'amor,',
    body: 'meu coração faz tum-tum quando você passa estudando concentrada.',
    mood: 'amor',
  },
  {
    id: 'amor-11',
    title: 'minha doutora,',
    body: 'eu não sei se Deus existe, mas você sim. e isso me basta.',
    mood: 'amor',
  },
  {
    id: 'amor-12',
    title: 'vida,',
    body: 'te amo do jeito que você morde a caneta sem perceber.',
    mood: 'amor',
  },
  {
    id: 'amor-13',
    title: 'doutora,',
    body: 'se um dia você esquecer alguma coisa, lembra: eu te amo. esse é o lembrete.',
    mood: 'amor',
  },
  {
    id: 'amor-14',
    title: 'amor,',
    body: 'eu sou o cachorrinho aqui do canto te esperando voltar para o café.',
    mood: 'amor',
  },
  {
    id: 'amor-15',
    title: 'vida,',
    body: 'saiu da prova, casou comigo. é assim que funciona, foi combinado.',
    mood: 'amor',
  },

  // pausa (descanso, autocuidado)
  {
    id: 'pausa-01',
    title: 'amor,',
    body: 'respira fundo. eu tô aqui, você não está sozinha em nada disso.',
    mood: 'pausa',
  },
  {
    id: 'pausa-02',
    title: 'doutora,',
    body: 'fecha o olho, conta até dez. agora abre. eu ainda te amo.',
    mood: 'pausa',
  },
  {
    id: 'pausa-03',
    title: 'vida,',
    body: 'tomar água também é estudo. é cuidar do cérebro que você precisa.',
    mood: 'pausa',
  },
  {
    id: 'pausa-04',
    title: 'amor,',
    body: 'ninguém memorizou a medicina inteira numa tarde. nem você consegue.',
    mood: 'pausa',
  },
  {
    id: 'pausa-05',
    title: 'doutora,',
    body: 'às vezes a melhor revisão é uma soneca curta. eu prometo, funciona.',
    mood: 'pausa',
  },
  {
    id: 'pausa-06',
    title: 'vida,',
    body: 'levanta da cadeira agora. o livro espera 5 minutos, eu garanto.',
    mood: 'pausa',
  },
  {
    id: 'pausa-07',
    title: 'amor,',
    body: 'se está cansando, não está rendendo. respeita seu corpo, ele te avisa.',
    mood: 'pausa',
  },
  {
    id: 'pausa-08',
    title: 'doutora,',
    body: 'faz um cafezinho. ou um chá. te amo mais feliz e descansada.',
    mood: 'pausa',
  },
  {
    id: 'pausa-09',
    title: 'vida,',
    body: 'dormir não é fugir do estudo. é parte dele. parte mais importante.',
    mood: 'pausa',
  },
  {
    id: 'pausa-10',
    title: 'amor,',
    body: 'respira de novo. agora um sorriso, mesmo pequeno. assim, ó.',
    mood: 'pausa',
  },

  // estudo (encorajamento)
  {
    id: 'estudo-01',
    title: 'amor,',
    body: 'cada erro é um acerto que ainda não chegou. continua.',
    mood: 'estudo',
  },
  {
    id: 'estudo-02',
    title: 'doutora,',
    body: 'você consegue tudo o que decide com calma. confia no método.',
    mood: 'estudo',
  },
  {
    id: 'estudo-03',
    title: 'vida,',
    body: 'eu te conheço. esse conteúdo é seu, só precisa pousar com paciência.',
    mood: 'estudo',
  },
  {
    id: 'estudo-04',
    title: 'amor,',
    body: 'prova passa. o que você construiu por dentro fica para sempre.',
    mood: 'estudo',
  },
  {
    id: 'estudo-05',
    title: 'doutora,',
    body: 'ninguém disse que ia ser fácil. mas é sua, e está dando.',
    mood: 'estudo',
  },
  {
    id: 'estudo-06',
    title: 'vida,',
    body: 'sua cabeça é mais organizada do que parece. confia no que já está lá.',
    mood: 'estudo',
  },
  {
    id: 'estudo-07',
    title: 'amor,',
    body: 'você sabe mais do que acha. lê de novo com calma, vai aparecer.',
    mood: 'estudo',
  },
  {
    id: 'estudo-08',
    title: 'doutora,',
    body: 'errar agora vale ouro no dia que importa. cada questão errada é uma certa garantida na prova.',
    mood: 'estudo',
  },
  {
    id: 'estudo-09',
    title: 'vida,',
    body: 'você é a prova viva de que dedicação funciona. tô vendo de perto.',
    mood: 'estudo',
  },
  {
    id: 'estudo-10',
    title: 'amor,',
    body: 'cada folha que você vira aproxima do dia que a gente comemora.',
    mood: 'estudo',
  },

  // poema (adaptados de Vinicius, Drummond, Neruda, Mario Quintana, Cecilia)
  {
    id: 'poema-01',
    title: 'minha doutora,',
    body: 'que seja eterno enquanto dure. eu juro que vai. (com licença, Vinicius)',
    mood: 'poema',
  },
  {
    id: 'poema-02',
    title: 'vida,',
    body: 'eu te amo como certas coisas obscuras se amam: em segredo, entre a sombra e a alma. (Neruda achou que era pra ele, mas é pra você)',
    mood: 'poema',
  },
  {
    id: 'poema-03',
    title: 'amor,',
    body: 'no meio do caminho havia eu. e ainda estou. (Drummond me deixou usar)',
    mood: 'poema',
  },
  {
    id: 'poema-04',
    title: 'doutora,',
    body: 'eu não sei amar pela metade. é por isso que demoro tanto, e que dura tanto.',
    mood: 'poema',
  },
  {
    id: 'poema-05',
    title: 'vida,',
    body: 'o tempo é o que a gente faz dele. eu escolho fazer com você.',
    mood: 'poema',
  },
  {
    id: 'poema-06',
    title: 'amor,',
    body: 'se eu pudesse, te daria a coisa mais bonita do mundo. mas o mundo já é seu de qualquer jeito.',
    mood: 'poema',
  },
  {
    id: 'poema-07',
    title: 'doutora,',
    body: 'há livros que terminam e o tempo que sobra a gente lê de novo. com você é assim. te leio sempre.',
    mood: 'poema',
  },
  {
    id: 'poema-08',
    title: 'vida,',
    body: 'o mundo dá voltas. mas existe um lugar que não muda, e esse lugar é você.',
    mood: 'poema',
  },
  {
    id: 'poema-09',
    title: 'amor,',
    body: 'eu te quero do tamanho da minha falta. e a minha falta é grande.',
    mood: 'poema',
  },
  {
    id: 'poema-10',
    title: 'minha doutora,',
    body: 'te amo no presente, no pretérito que vivemos e no futuro que ainda vamos chamar nosso.',
    mood: 'poema',
  },

  // mais (mistura)
  {
    id: 'mix-01',
    title: 'vida,',
    body: 'te amo até quando você tá brava comigo por motivo bobo. principalmente nessas horas.',
    mood: 'amor',
  },
  {
    id: 'mix-02',
    title: 'amor,',
    body: 'um conselho: estuda o que dá prazer primeiro. o difícil vem depois, com energia melhor.',
    mood: 'estudo',
  },
  {
    id: 'mix-03',
    title: 'doutora,',
    body: 'você é minha estrelinha. brilha calmo, brilha sempre.',
    mood: 'amor',
  },
  {
    id: 'mix-04',
    title: 'vida,',
    body: 'se você está cansada, fecha o app. eu cuido do dia, você cuida de você.',
    mood: 'pausa',
  },
  {
    id: 'mix-05',
    title: 'amor,',
    body: 'a gente comemora cada questão certa que nem cada gol. somos família simples assim.',
    mood: 'amor',
  },
];

export const GREETINGS: string[] = [
  'o que vamos estudar hoje, doutora?',
  'que tema hoje, amor?',
  'vamos juntos, doutora? eu seguro o tempo.',
  'hoje, qual capítulo me apresenta?',
  'respira, amor. e vamos com calma.',
  'qual matéria pede você agora?',
  'por onde a gente começa, doutora?',
  'estudar é também escolher, vida. escolhe leve.',
  'tô aqui pra te ouvir estudando, amor.',
  'doutora, hoje a gente foca em qual?',
  'vamos com calma, vida. tem tempo.',
  'qual módulo merece sua cabeça agora?',
  'amor, um capítulo de cada vez.',
  'doutora, escolhe o que mais te chamar.',
  'te amo estudando. comece quando quiser.',
  'amor, o dia é seu. o tema também.',
  'doutora, um café e a gente segue.',
  'vida, foco no que pulsa hoje.',
  'qual matéria pede você, amor?',
  'doutora, estamos prontos.',
];

export const GREETINGS_DOUTORA: string[] = [
  'selecione uma matéria abaixo.',
  'escolha o módulo do dia.',
  'continue de onde parou.',
  'estudo livre. boa sessão.',
  'foco no que precisar revisar hoje.',
  'comece pelo modo de erro se houver pendências.',
  'priorize tópicos com menor acerto.',
  'sessão aberta. selecione uma matéria.',
  'distribua o tempo entre os módulos.',
  'mantenha consistência. um por dia já basta.',
];

export const PERFORMANCE_QUOTES_DOUTORA = {
  high: [
    'desempenho consistente. mantenha o ritmo.',
    'média estável acima de 75%. continue.',
    'resultado dentro do esperado para a fase.',
    'progresso adequado. monitore tópicos fracos.',
  ],
  mid: [
    'acerto médio razoável. há margem para subir.',
    'desempenho intermediário. revise os erros.',
    'mantenha o estudo periódico.',
    'distribuição típica. foque em tópicos fracos.',
  ],
  low: [
    'média abaixo do esperado. revise o conteúdo.',
    'tópicos fracos pedem atenção. modo erro disponível.',
    'reduza o volume e aumente a revisão.',
    'volte aos conceitos básicos antes de avançar.',
  ],
};

export const PERFORMANCE_QUOTES = {
  high: [
    'firme, constante, sem pressa — a curva está subindo.',
    'doutora, esse desempenho me dá orgulho real.',
    'amor, está fluindo. continua exatamente assim.',
    'você está mais perto do que imagina, vida.',
    'olha o que você está construindo. é bonito.',
  ],
  mid: [
    'olha a evolução, amor. está acontecendo aos poucos.',
    'doutora, mais um pouco e fecha um ciclo bonito.',
    'vida, está no caminho. fica nele.',
    'continua. eu vejo melhorando a cada semana.',
    'amor, paciência é parte do plano. tá indo.',
  ],
  low: [
    'amor, devagar e sempre. não é hora de desistir.',
    'doutora, hoje a gente planta. semana que vem colhemos.',
    'vida, recomeçar é parte. eu acredito em você.',
    'amor, dia ruim existe. amanhã a página vira.',
    'doutora, respira e tenta de novo. eu seguro.',
  ],
};
