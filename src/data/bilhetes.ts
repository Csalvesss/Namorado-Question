// Banco de bilhetes rotativos. Cada item aparece por uma janela de 5 horas.
// Mistura: cartas curtas no estilo Mauricio de Sousa (simples, fofas),
// trechos adaptados de Vinicius, Drummond, Neruda, Mario Quintana,
// e mensagens diretas dele para ela.

export type BilheteMood = 'amor' | 'pausa' | 'estudo' | 'poema';

export type CareIcon =
  | 'agua'
  | 'comida'
  | 'descanso'
  | 'alongar'
  | 'respirar'
  | 'sono'
  | 'caminhar'
  | 'sol';

export interface Bilhete {
  id: string;
  title?: string;
  body: string;
  mood: BilheteMood;
  care?: string;
  careIcon?: CareIcon;
  /**
   * Autor/origem quando o bilhete é um verso de poema (domínio público).
   * Ausente = recado original dele pra ela (assina com o nome do namorado).
   */
  author?: string;
}

// ===========================================================================
// Bilhetes do namorado — recados originais dele + versos de poemas de amor.
//
// Dois tipos convivem:
//   1. RECADOS  — palavras dele pra ela (sem `author`; assinam com o nome dele).
//   2. VERSOS   — poesia de amor em DOMÍNIO PÚBLICO, com `author` creditado.
//                 Camões, Florbela, Bilac, Castro Alves, Gonçalves Dias,
//                 Casimiro de Abreu, Fernando Pessoa; e traduções livres e
//                 fiéis de Shakespeare, Byron, E. B. Browning e Rossetti.
//
// Os blocos são intercalados por rodízio (ver `interleave`) pra que qualquer
// janela do feed venha variada: recado, verso, recado, verso...
// ===========================================================================

// ---- CUIDADO À DISTÂNCIA --------------------------------------------------
// O coração da coisa: "mesmo que eu não esteja aí, estou cuidando de você".
const CUIDADO: Bilhete[] = [
  {
    id: 'cuidado-01',
    title: 'meu amor,',
    body: 'mesmo que eu não esteja aí do seu lado agora, eu estou. do meu jeito, à distância, cuidando de você.',
    mood: 'amor',
  },
  {
    id: 'cuidado-02',
    title: 'vida,',
    body: 'não estou aí pra fazer seu café hoje, então bebe uma água por mim. é a minha mão te lembrando de cuidar de você.',
    mood: 'pausa',
    care: 'um copo de água agora, antes de virar a página.',
    careIcon: 'agua',
  },
  {
    id: 'cuidado-03',
    title: 'doutora,',
    body: 'se a casa está silenciosa demais, respira e lembra: eu estou pensando em você exatamente agora.',
    mood: 'amor',
  },
  {
    id: 'cuidado-04',
    title: 'amor,',
    body: 'eu não preciso estar presente pra te amar. te amo daqui, inteiro, o dia todo.',
    mood: 'amor',
  },
  {
    id: 'cuidado-05',
    title: 'minha doutora,',
    body: 'quando bater o cansaço e eu não estiver por perto, lembra que alguém te ama e está torcendo por você em silêncio.',
    mood: 'amor',
  },
  {
    id: 'cuidado-06',
    title: 'vida,',
    body: 'queria estar aí pra pôr a mão na sua testa e dizer que vai dar certo. então digo daqui: vai dar certo, amor.',
    mood: 'amor',
  },
  {
    id: 'cuidado-07',
    title: 'amor,',
    body: 'por mais longe que eu esteja, você nunca estuda sozinha. eu vou junto, caladinho, do seu lado.',
    mood: 'amor',
  },
  {
    id: 'cuidado-08',
    title: 'doutora,',
    body: 'deixei esse bilhete pra você achar quando eu não puder estar aí. considera um abraço em forma de texto.',
    mood: 'amor',
  },
  {
    id: 'cuidado-09',
    title: 'vida,',
    body: 'a distância é só quilômetro. o cuidado não tem distância — ele chega em você agora, inteiro.',
    mood: 'amor',
  },
  {
    id: 'cuidado-10',
    title: 'amor,',
    body: 'come alguma coisa de verdade, viu? eu não estou aí pra insistir, mas insisto por escrito. cuida de você por mim.',
    mood: 'pausa',
    care: 'algo de verdade no prato — não café com bolacha.',
    careIcon: 'comida',
  },
  {
    id: 'cuidado-11',
    title: 'minha doutora,',
    body: 'à noite, quando fechar o livro, imagina que eu apago a luz e fico de guarda. pode dormir tranquila.',
    mood: 'pausa',
    care: 'se já rendeu hoje, dormir cedo também é estudar.',
    careIcon: 'sono',
  },
  {
    id: 'cuidado-12',
    title: 'vida,',
    body: 'onde quer que eu esteja, uma parte de mim fica aí do seu lado, torcendo por cada acerto seu.',
    mood: 'amor',
  },
  {
    id: 'cuidado-13',
    title: 'amor,',
    body: 'cuidar de você não depende de eu estar presente. depende de eu te amar. e disso eu não abro mão.',
    mood: 'amor',
  },
  {
    id: 'cuidado-14',
    title: 'doutora,',
    body: 'quando sentir minha falta, olha pro céu: a mesma lua que eu vejo está cuidando de você também.',
    mood: 'amor',
  },
  {
    id: 'cuidado-15',
    title: 'vida,',
    body: 'não estou aí pra segurar sua mão, então segura firme na ideia de que eu te amo. dá na mesma, prometo.',
    mood: 'amor',
  },
  {
    id: 'cuidado-16',
    title: 'amor,',
    body: 'se ninguém te disse hoje: você está indo bem, está sendo cuidada e é muito amada. fui eu quem disse, de longe.',
    mood: 'amor',
  },
  {
    id: 'cuidado-17',
    title: 'minha doutora,',
    body: 'mando um beijo pelo ar. ele demora um pouquinho pra chegar aí, mas chega. deixa chegar.',
    mood: 'amor',
  },
  {
    id: 'cuidado-18',
    title: 'vida,',
    body: 'levanta um instante e estica o corpo por mim. eu não estou aí pra puxar você da cadeira, então puxo daqui.',
    mood: 'pausa',
    care: 'de pé, ombros pra trás, pescoço solto. dez segundos.',
    careIcon: 'alongar',
  },
  {
    id: 'cuidado-19',
    title: 'amor,',
    body: 'eu não estou aí pra te abraçar agora, então guarda esse abraço pra quando eu chegar. tá reservado, com juros.',
    mood: 'amor',
  },
  {
    id: 'cuidado-20',
    title: 'doutora,',
    body: 'respira comigo daqui: devagar pra dentro, devagar pra fora. viu? a gente não precisa estar no mesmo lugar pra respirar junto.',
    mood: 'pausa',
    care: 'inspira contando 4, segura 4, solta em 6. três vezes.',
    careIcon: 'respirar',
  },
  {
    id: 'cuidado-21',
    title: 'vida,',
    body: 'hoje eu cuido de você de longe: descansa quando cansar, come quando tiver fome, e não esquece que é amada.',
    mood: 'amor',
  },
  {
    id: 'cuidado-22',
    title: 'amor,',
    body: 'se o dia apertar e eu estiver longe, lê de novo bem devagar: você é forte, é capaz, e não está sozinha.',
    mood: 'amor',
  },
  {
    id: 'cuidado-23',
    title: 'minha doutora,',
    body: 'toma um pouco de sol na janela por mim. eu não estou aí pra te chamar pro ar livre, então te chamo por escrito.',
    mood: 'pausa',
    care: 'cinco minutos de sol na pele já valem o dia.',
    careIcon: 'sol',
  },
  {
    id: 'cuidado-24',
    title: 'vida,',
    body: 'quando você não me sentir por perto, fecha o olho um segundo: eu estou exatamente aí, no meio do seu peito.',
    mood: 'amor',
  },
];

// ---- VERSOS (poesia de amor em domínio público) ---------------------------
const VERSOS: Bilhete[] = [
  {
    id: 'verso-camoes-01',
    body: 'Amor é fogo que arde sem se ver; é ferida que dói e não se sente; é um contentamento descontente; é dor que desatina sem doer.',
    mood: 'poema',
    author: 'Luís de Camões',
  },
  {
    id: 'verso-camoes-02',
    body: 'Transforma-se o amador na cousa amada, por virtude do muito imaginar.',
    mood: 'poema',
    author: 'Luís de Camões',
  },
  {
    id: 'verso-camoes-03',
    body: 'Sete anos de pastor Jacó servia; mas não servia ao pai, servia a ela, e a ela só por prêmio pretendia.',
    mood: 'poema',
    author: 'Luís de Camões',
  },
  {
    id: 'verso-florbela-01',
    body: "Minh'alma, de sonhar-te, anda perdida. Meus olhos andam cegos de te ver.",
    mood: 'poema',
    author: 'Florbela Espanca',
  },
  {
    id: 'verso-florbela-02',
    body: 'Não és sequer razão do meu viver, pois que tu és já toda a minha vida!',
    mood: 'poema',
    author: 'Florbela Espanca',
  },
  {
    id: 'verso-florbela-03',
    body: 'Eu quero amar, amar perdidamente! Amar só por amar: aqui... além...',
    mood: 'poema',
    author: 'Florbela Espanca',
  },
  {
    id: 'verso-pessoa-01',
    body: 'O amor é que é essencial. O sexo é só um acidente.',
    mood: 'poema',
    author: 'Fernando Pessoa',
  },
  {
    id: 'verso-pessoa-02',
    body: 'Não conheço outra razão para amar senão amar. Que queres que te diga, além de que te amo?',
    mood: 'poema',
    author: 'Fernando Pessoa',
  },
  {
    id: 'verso-bilac-01',
    body: 'Ora (direis) ouvir estrelas! Certo perdeste o senso! E eu vos direi, no entanto, que, para ouvi-las, muita vez desperto.',
    mood: 'poema',
    author: 'Olavo Bilac',
  },
  {
    id: 'verso-bilac-02',
    body: 'Cheguei. Chegaste. Vinhas fatigada e triste, e triste e fatigado eu vinha.',
    mood: 'poema',
    author: 'Olavo Bilac',
  },
  {
    id: 'verso-castroalves-01',
    body: 'Boa noite, Maria! Eu vou-me embora. A lua nas janelas bate em cheio.',
    mood: 'poema',
    author: 'Castro Alves',
  },
  {
    id: 'verso-castroalves-02',
    body: 'A primeira vez que eu vi Teresa, julguei ver a mais linda criatura.',
    mood: 'poema',
    author: 'Castro Alves',
  },
  {
    id: 'verso-gdias-01',
    body: 'Se se morre de amor! Não, não se morre, quando é fascinação que nos surpreende.',
    mood: 'poema',
    author: 'Gonçalves Dias',
  },
  {
    id: 'verso-casimiro-01',
    body: 'Tenho medo, mulher, de te querer tanto: medo mesmo de ver-te e de perder-te.',
    mood: 'poema',
    author: 'Casimiro de Abreu',
  },
  {
    id: 'verso-shakespeare-01',
    body: 'Meu amor é fundo como o mar. Quanto mais te dou, mais tenho para dar, pois ambos são sem fim.',
    mood: 'poema',
    author: 'Shakespeare, Romeu e Julieta',
  },
  {
    id: 'verso-shakespeare-02',
    body: 'Partir é uma dor tão doce que eu diria boa noite até o romper do dia.',
    mood: 'poema',
    author: 'Shakespeare, Romeu e Julieta',
  },
  {
    id: 'verso-shakespeare-03',
    body: 'Comparar-te a um dia de verão? Tu és mais doce e mais serena, amor.',
    mood: 'poema',
    author: 'Shakespeare, Soneto 18',
  },
  {
    id: 'verso-shakespeare-04',
    body: 'O amor não muda quando encontra mudança: é o marco firme que encara a tempestade e não se abala.',
    mood: 'poema',
    author: 'Shakespeare, Soneto 116',
  },
  {
    id: 'verso-browning-01',
    body: 'Como eu te amo? Deixa eu contar as formas: amo-te até onde a minha alma alcança, quando busca, às cegas, os confins do ser.',
    mood: 'poema',
    author: 'Elizabeth Barrett Browning',
  },
  {
    id: 'verso-byron-01',
    body: 'Ela caminha em beleza, como a noite de céu sem nuvens e de estrelas plenas.',
    mood: 'poema',
    author: 'Lord Byron',
  },
  {
    id: 'verso-rossetti-01',
    body: 'Lembra de mim quando eu estiver longe. Mas se me esqueceres um instante, não te entristeças: melhor esquecer e sorrir do que lembrar e chorar.',
    mood: 'poema',
    author: 'Christina Rossetti',
  },
];

// ---- AMOR (declarações dele, adultas, sem açúcar demais) -------------------
const AMOR: Bilhete[] = [
  {
    id: 'amor-01',
    title: 'minha doutora,',
    body: 'de todas as coisas que eu já quis na vida, você é a única que eu escolheria de novo, todo dia.',
    mood: 'amor',
  },
  {
    id: 'amor-02',
    title: 'vida,',
    body: 'você é o tipo de pessoa que eu levaria a vida inteira aprendendo, sem pressa e sem cansaço.',
    mood: 'amor',
  },
  {
    id: 'amor-03',
    title: 'doutora,',
    body: 'tem gente que a gente ama por costume. você eu amo por convicção.',
    mood: 'amor',
  },
  {
    id: 'amor-04',
    title: 'amor,',
    body: 'eu não te amo apesar dos dias difíceis. eu te amo mais por causa deles.',
    mood: 'amor',
  },
  {
    id: 'amor-05',
    title: 'minha doutora,',
    body: 'no fim do dia, você é o meu lugar de chegar.',
    mood: 'amor',
  },
  {
    id: 'amor-06',
    title: 'vida,',
    body: 'eu não sei fazer amor pela metade. é por isso que eu demoro tanto, e é por isso que dura.',
    mood: 'amor',
  },
  {
    id: 'amor-07',
    title: 'doutora,',
    body: 'você não é a mulher da minha vida por acaso. é porque eu olhei, escolhi, e escolheria mil vezes.',
    mood: 'amor',
  },
  {
    id: 'amor-08',
    title: 'amor,',
    body: 'minha pessoa favorita do mundo, com folga, é você.',
    mood: 'amor',
  },
  {
    id: 'amor-09',
    title: 'vida,',
    body: 'eu guardo você no lugar de mim onde não cabe mais ninguém. e nunca vai caber.',
    mood: 'amor',
  },
  {
    id: 'amor-10',
    title: 'minha doutora,',
    body: 'tem dias que eu só quero te ver existindo. isso já me basta o dia inteiro.',
    mood: 'amor',
  },
  {
    id: 'amor-11',
    title: 'amor,',
    body: 'amar você é a coisa mais fácil e mais séria que eu já fiz na vida.',
    mood: 'amor',
  },
  {
    id: 'amor-12',
    title: 'vida,',
    body: 'se um dia você esquecer alguma coisa no meio da prova, lembra só disto: eu te amo. o resto volta.',
    mood: 'amor',
  },
  {
    id: 'amor-13',
    title: 'doutora,',
    body: 'eu te admiro de um jeito calado, desses que não cabem em elogio. só cabem em ficar por perto.',
    mood: 'amor',
  },
  {
    id: 'amor-14',
    title: 'amor,',
    body: 'você estudando concentrada é a coisa mais bonita que eu vejo no dia. e olha que eu vejo o dia inteiro.',
    mood: 'amor',
  },
  {
    id: 'amor-15',
    title: 'vida,',
    body: 'quando tudo isso passar e você for médica, eu vou continuar aqui, do mesmo jeito, te achando incrível.',
    mood: 'amor',
  },
];

// ---- ESTUDO (incentivo com pé no chão) ------------------------------------
const ESTUDO: Bilhete[] = [
  {
    id: 'estudo-01',
    title: 'amor,',
    body: 'estudar cansa porque importa. o que não importa não cansa ninguém. segue, você está no caminho certo.',
    mood: 'estudo',
  },
  {
    id: 'estudo-02',
    title: 'doutora,',
    body: 'você não precisa saber tudo hoje. só um pouco mais do que ontem. isso já é vitória.',
    mood: 'estudo',
  },
  {
    id: 'estudo-03',
    title: 'vida,',
    body: 'cada questão que você erra agora é uma que você acerta no dia que conta. erra bonito, sem medo.',
    mood: 'estudo',
  },
  {
    id: 'estudo-04',
    title: 'amor,',
    body: 'a prova mede um dia. você vale todos os outros. não confunde as duas coisas.',
    mood: 'estudo',
  },
  {
    id: 'estudo-05',
    title: 'doutora,',
    body: 'não é sobre ser a melhor. é sobre virar médica. e você já está virando, aos poucos, todo dia.',
    mood: 'estudo',
  },
  {
    id: 'estudo-06',
    title: 'vida,',
    body: 'confia no que você já construiu por dentro. está tudo aí, é só deixar assentar com calma.',
    mood: 'estudo',
  },
  {
    id: 'estudo-07',
    title: 'amor,',
    body: 'devagar também é chegar. e você está chegando, mesmo quando não parece.',
    mood: 'estudo',
  },
  {
    id: 'estudo-08',
    title: 'doutora,',
    body: 'sua cabeça é mais organizada do que você acha. lê de novo com calma, o conteúdo é seu e vai aparecer.',
    mood: 'estudo',
  },
  {
    id: 'estudo-09',
    title: 'vida,',
    body: 'você é a prova viva de que dedicação funciona. eu tô vendo de perto, semana após semana.',
    mood: 'estudo',
  },
  {
    id: 'estudo-10',
    title: 'amor,',
    body: 'cada folha que você vira aproxima do dia em que a gente comemora tudo isso juntos.',
    mood: 'estudo',
  },
  {
    id: 'estudo-11',
    title: 'doutora,',
    body: 'estuda o que te dá prazer primeiro. o difícil vem depois, com energia melhor.',
    mood: 'estudo',
  },
  {
    id: 'estudo-12',
    title: 'vida,',
    body: 'ninguém memorizou a medicina inteira numa tarde. respeita o ritmo, ele é sábio.',
    mood: 'estudo',
  },
];

// ---- PAUSA (respira, descansa) --------------------------------------------
const PAUSA: Bilhete[] = [
  {
    id: 'pausa-01',
    title: 'amor,',
    body: 'respira fundo. eu tô aqui, você não está sozinha em nada disso.',
    mood: 'pausa',
  },
  {
    id: 'pausa-02',
    title: 'doutora,',
    body: 'às vezes a melhor revisão é uma soneca curta. eu prometo, funciona.',
    mood: 'pausa',
  },
  {
    id: 'pausa-03',
    title: 'vida,',
    body: 'se está cansando, não está rendendo. respeita seu corpo, ele te avisa antes de você.',
    mood: 'pausa',
  },
  {
    id: 'pausa-04',
    title: 'amor,',
    body: 'faz um cafezinho, ou um chá. eu te amo mais feliz e descansada do que exausta e perfeita.',
    mood: 'pausa',
  },
  {
    id: 'pausa-05',
    title: 'doutora,',
    body: 'dormir não é fugir do estudo. é parte dele. a parte mais importante, inclusive.',
    mood: 'pausa',
  },
  {
    id: 'pausa-06',
    title: 'vida,',
    body: 'levanta da cadeira agora e dá uma volta. o livro espera cinco minutos, eu garanto.',
    mood: 'pausa',
  },
  {
    id: 'pausa-07',
    title: 'amor,',
    body: 'fecha o olho, conta até dez, abre. eu ainda te amo, e o conteúdo ainda está aí. tudo em ordem.',
    mood: 'pausa',
  },
];

// Intercala os blocos por rodízio: garante que qualquer janela do feed venha
// misturada (recado → verso → recado → verso), mantendo ordem determinística
// pra rotação de 5h continuar estável entre sessões e devices.
function interleave(...pools: Bilhete[][]): Bilhete[] {
  const out: Bilhete[] = [];
  const max = pools.reduce((m, p) => Math.max(m, p.length), 0);
  for (let i = 0; i < max; i++) {
    for (const pool of pools) {
      if (i < pool.length) out.push(pool[i]);
    }
  }
  return out;
}

export const BILHETES: Bilhete[] = interleave(CUIDADO, VERSOS, AMOR, ESTUDO, PAUSA);

export const GREETINGS: string[] = [
  'o que vamos estudar hoje, doutora?',
  'que tema hoje, amor?',
  'vamos juntos, doutora? eu seguro o tempo.',
  'hoje, qual capítulo me apresenta?',
  'respira, amor. e vamos com calma.',
  'qual matéria pede você agora?',
  'por onde a gente começa, doutora?',
  'estudar é também escolher, vida. escolhe leve.',
  'tô aqui para te ouvir estudando, amor.',
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

// Bilhetes especiais do Modo Bilhete: aparecem uma vez por prova, no meio.
// Combinam mensagem carinhosa com uma dica concreta de cuidado.
export const PROVA_BILHETES: Bilhete[] = [
  {
    id: 'prova-01',
    title: 'doutora,',
    mood: 'pausa',
    body: 'no meio dessa prova eu paro para te lembrar uma coisa: você é capaz, e eu sei disso melhor do que ninguém.',
    care: 'bebe um gole de água antes de seguir. seu cérebro estuda melhor hidratado.',
    careIcon: 'agua',
  },
  {
    id: 'prova-02',
    title: 'amor,',
    mood: 'pausa',
    body: 'cada questão certa aqui é uma vitória sua. cada errada é só um aviso de onde voltar.',
    care: 'já se levantou da cadeira hoje? estica os braços, gira o pescoço devagar, sem pressa.',
    careIcon: 'alongar',
  },
  {
    id: 'prova-03',
    title: 'minha doutora,',
    mood: 'pausa',
    body: 'eu queria estar aí para fazer um café e te entregar quentinho. fica esse bilhete no lugar.',
    care: 'come alguma coisa de verdade, viu? estudo de barriga vazia rende metade.',
    careIcon: 'comida',
  },
  {
    id: 'prova-04',
    title: 'vida,',
    mood: 'pausa',
    body: 'respira fundo. essa prova não decide nada sobre você, só te ajuda a estudar melhor.',
    care: 'inspira contando 4, segura 4, solta em 6. três vezes. seu corpo agradece.',
    careIcon: 'respirar',
  },
  {
    id: 'prova-05',
    title: 'doutora favorita,',
    mood: 'pausa',
    body: 'olhar para você estudando é a coisa mais bonita que eu vejo no dia, juro.',
    care: 'olha para longe agora, foca num ponto distante por uns vinte segundos. seus olhos pedem pausa.',
    careIcon: 'descanso',
  },
  {
    id: 'prova-06',
    title: 'meu amor,',
    mood: 'pausa',
    body: 'tô torcendo daqui em silêncio, com aquele orgulho idiota de quem te conhece de perto.',
    care: 'hoje já tomou um pouquinho de sol? cinco minutos na janela já vale ouro.',
    careIcon: 'sol',
  },
  {
    id: 'prova-07',
    title: 'doutora,',
    mood: 'pausa',
    body: 'lembra: você não precisa saber tudo agora. precisa saber um pouco mais do que ontem.',
    care: 'se já estudou bastante hoje, considera parar mais cedo. dormir bem é metade da prova.',
    careIcon: 'sono',
  },
  {
    id: 'prova-08',
    title: 'amor da minha vida,',
    mood: 'pausa',
    body: 'cada gabarito seu aqui me deixa um pouco mais convencido de que escolhi bem.',
    care: 'enche o copo de novo. água, mesmo. café por hoje já chega.',
    careIcon: 'agua',
  },
  {
    id: 'prova-09',
    title: 'minha pessoa,',
    mood: 'pausa',
    body: 'no fim das contas eu só queria estar do seu lado, dividindo o silêncio do estudo.',
    care: 'levanta e dá uma volta na sala por dois minutinhos. circulação ajuda a memória.',
    careIcon: 'caminhar',
  },
  {
    id: 'prova-10',
    title: 'doutora,',
    mood: 'pausa',
    body: 'sua paciência é desumana, e mesmo assim você consegue ser doce comigo todo dia.',
    care: 'lanche de verdade, sem culpa: fruta, castanha, um pedaço de queijo. nutrir é estudar.',
    careIcon: 'comida',
  },
  {
    id: 'prova-11',
    title: 'amor,',
    mood: 'pausa',
    body: 'um dia desses a gente olha para trás e ri de quão difícil tudo isso parecia.',
    care: 'mexe os ombros, abre o peito, alonga o pescoço. seu corpo carrega esses estudos.',
    careIcon: 'alongar',
  },
  {
    id: 'prova-12',
    title: 'minha doutora,',
    mood: 'pausa',
    body: 'descansar também faz parte do estudo, sabia? cansaço não é prova de esforço.',
    care: 'se a cabeça pesar, pausa de dez minutos. deita, fecha o olho, depois volta inteira.',
    careIcon: 'descanso',
  },
  {
    id: 'prova-13',
    title: 'vida,',
    mood: 'pausa',
    body: 'eu sei que dá medo. mas você já passou por coisas piores, e olha onde está.',
    care: 'respira pelo nariz, fundo, três vezes. e se quiser, fecha o olho por um minuto.',
    careIcon: 'respirar',
  },
  {
    id: 'prova-14',
    title: 'amor,',
    mood: 'pausa',
    body: 'sua dedicação é meu maior motivo de admiração silenciosa.',
    care: 'já parou para esticar as pernas? caminha pela casa enquanto pensa nas próximas questões.',
    careIcon: 'caminhar',
  },
  {
    id: 'prova-15',
    title: 'doutora,',
    mood: 'pausa',
    body: 'estuda no seu tempo. ninguém precisa virar médica em um dia.',
    care: 'janta direito hoje. carboidrato bom, proteína, alguma cor no prato. estudar é gastar energia.',
    careIcon: 'comida',
  },
];

// ============================================================
// MODO IRMÃO — bilhetes de incentivo, brincadeira, apoio
// (carinhoso com zoeira inteligente, sem palavrão)
// ============================================================

export const BILHETES_IRMAO: Bilhete[] = [
  {
    id: 'irmao-zoeira-01',
    body: 'incrível: a mesma pessoa que comia ração de gato aos 4 anos agora estuda farmacologia. te conheço há tempo demais.',
    mood: 'amor',
  },
  {
    id: 'irmao-zoeira-02',
    body: 'olha, se eu fosse seu paciente daqui a uns anos, eu confiava. e isso é elogio sério vindo de mim.',
    mood: 'amor',
  },
  {
    id: 'irmao-pausa-01',
    body: 'levanta dessa cadeira 5 minutos. ninguém ficou genial estudando 6 horas sem se mexer. ninguém.',
    mood: 'pausa',
    care: 'caminha até a cozinha e volta. de preferência roubando alguma coisa para comer.',
    careIcon: 'caminhar',
  },
  {
    id: 'irmao-pausa-02',
    body: 'aposto que você esqueceu de almoçar. estou certo, né? larga o livro e come.',
    mood: 'pausa',
    care: 'comida de verdade. nada de café com bolacha.',
    careIcon: 'comida',
  },
  {
    id: 'irmao-estudo-01',
    body: 'errar matéria difícil agora é desconto na prova depois. continua errando bonito.',
    mood: 'estudo',
  },
  {
    id: 'irmao-estudo-02',
    body: 'fulano da faculdade já tá no capítulo 12 e você no 4? bom para ele. cada um aprende no seu jeito. e o seu jeito sempre funcionou.',
    mood: 'estudo',
  },
  {
    id: 'irmao-pausa-03',
    body: 'lembra quando você quase tirou 10 em matemática só de raiva? mesma energia. agora é farmacologia.',
    mood: 'amor',
  },
  {
    id: 'irmao-zoeira-03',
    body: 'quando você virar profissional eu vou contar para todo mundo que te ensinei a andar de bicicleta. detalhes da sua vida, comigo. cuidado.',
    mood: 'amor',
  },
  {
    id: 'irmao-estudo-03',
    body: 'tenta explicar o que estudou hoje em voz alta para a parede. se a parede não entendeu, você também não entendeu.',
    mood: 'estudo',
  },
  {
    id: 'irmao-pausa-04',
    body: 'depois das 23h cérebro só guarda coisa errada. fecha o livro, dorme, amanhã a gente continua.',
    mood: 'pausa',
    care: 'jantar antes. dormir depois. ordem importa.',
    careIcon: 'sono',
  },
  {
    id: 'irmao-amor-novo-01',
    body: 'você não precisa ser perfeita. só precisa continuar. estou olhando daqui e você tá continuando. isso já vale o dia.',
    mood: 'amor',
  },
  {
    id: 'irmao-zoeira-04',
    body: 'já te vi chorando no jantar de domingo, já te vi rindo do nada no meio da rua, já te vi acertar tudo que disse que ia acertar. essa última eu lembro mais.',
    mood: 'amor',
  },
];

export const PROVA_BILHETES_IRMAO: Bilhete[] = [
  {
    id: 'prova-irmao-01',
    mood: 'pausa',
    body: 'no meio da prova eu paro só para dizer: nem o irmão chato consegue ficar quieto vendo você arrasar. continua.',
    care: 'um gole de água. nenhuma desculpa.',
    careIcon: 'agua',
  },
  {
    id: 'prova-irmao-02',
    mood: 'pausa',
    body: 'respira fundo. quem corre na prova é quem chegou despreparado. esse problema você não tem.',
    care: 'inspira 4, segura 4, solta 6. duas vezes.',
    careIcon: 'respirar',
  },
  {
    id: 'prova-irmao-03',
    mood: 'estudo',
    body: 'errou as últimas? bom. agora as próximas têm chance de ser tudo certo, lei das médias. confia.',
    care: 'estica os braços acima da cabeça por 10s. desbloqueia ideia.',
    careIcon: 'alongar',
  },
  {
    id: 'prova-irmao-04',
    mood: 'pausa',
    body: 'lembra quem te chamou de besta na infância? era eu. e mesmo eu sei que isso aqui você vai resolver.',
    care: 'um sorriso involuntário valida o bilhete. sorri.',
    careIcon: 'respirar',
  },
];

// ============================================================
// Modo DOUTORA — versões neutras (sem afeto)
// ============================================================

export const BILHETES_DOUTORA: Bilhete[] = [
  {
    id: 'dout-01',
    body: 'pausa programada. hidrate-se e retome.',
    mood: 'pausa',
  },
  {
    id: 'dout-02',
    body: 'erro também é estudo. revise a alternativa correta com calma.',
    mood: 'estudo',
  },
];
