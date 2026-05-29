// Cadeira Ansiosa — microssim de manejo farmacológico+comportamental
// do paciente ansioso (criança/idoso/fóbico) em consultório odontológico.
//
// Princípio cognitivo: retrieval contextual + encoding por perfil.
// A decisão certa varia conforme variáveis específicas (idade, jejum,
// comorbidade, procedimento, cooperação) — treinar com essas variáveis
// é o que faz a usuária internalizar o raciocínio clínico.

export type SedacaoChoice = 'nao-medicar' | 'midazolam' | 'lorazepam' | 'n2o' | 'encaminhar';

export const SEDACAO_LABEL: Record<SedacaoChoice, string> = {
  'nao-medicar': 'Não medicar (manejo comportamental)',
  midazolam: 'Midazolam VO 7,5–15 mg (adulto) ou 0,5 mg/kg (criança)',
  lorazepam: 'Lorazepam VO 1–2 mg, 1–2h antes',
  n2o: 'Óxido nitroso/O2 inalatório',
  encaminhar: 'Encaminhar para centro com anestesista',
};

export interface CadeiraCase {
  id: string;
  /** Curto rótulo do tipo de paciente */
  patientTag: string;
  vignette: string;
  procedure: string;
  question: string;
  correct: SedacaoChoice;
  /** Justificativa (aparece se acertar) */
  why: string;
  /** Explicação detalhada por opção (didática) */
  feedbackByOption: Record<SedacaoChoice, string>;
  /** Tag para SRS prefix */
  tags: string[];
}

export const CADEIRA_CASES: CadeiraCase[] = [
  {
    id: 'crianca-4a',
    patientTag: 'Criança 4 anos',
    vignette:
      'João, 4 anos, 18 kg, ASA I, choroso na sala de espera, sem cooperar com exame. Acompanhado pela mãe. Última refeição: leite materno há 1h, lanche sólido há 3h.',
    procedure: 'Tratamento restaurador em 2 molares decíduos',
    question: 'Qual a estratégia de sedação mais segura?',
    correct: 'midazolam',
    why:
      'Midazolam VO 0,5 mg/kg (≈9 mg, máx 15 mg) 15-20 min antes. Permite sedação consciente cooperativa, antagonista disponível (flumazenil). Sempre com oxímetro, O2 de reserva e acompanhante até alta com Aldrete.',
    feedbackByOption: {
      'nao-medicar':
        'Manejo comportamental (tell-show-do, distração, presença materna) é a 1ª linha — mas em criança 4a francamente não-cooperativa, prolongar essa abordagem traumatiza e adia o tratamento. Faz sentido como complemento, não como única estratégia.',
      midazolam:
        'CORRETO. 0,5 mg/kg VO, máx 15 mg, 15-20 min antes. Jejum: 2h líquido claro, 4h leite materno (3h ainda é limítrofe — confirmar com a mãe), 6h sólido (3h NÃO é seguro — adiar 3h ou trocar pro dia seguinte).',
      lorazepam:
        'Lorazepam tem início ~2h e duração 8h — desproporcional para criança e procedimento ambulatorial. Não é a 1ª escolha pediátrica.',
      n2o:
        'N2O é ótimo para criança cooperativa, mas em pré-escolar não-colaborativo que não aceita máscara nasal, falha. Tente após manejo comportamental se a criança permitir; caso contrário, midazolam.',
      encaminhar:
        'Encaminhamento para anestesia em centro cirúrgico só se houve falha de sedação consciente ambulatorial ou se há contraindicação. Pular etapas é overtreatment.',
    },
    tags: ['pediatria', 'midazolam'],
  },
  {
    id: 'idoso-hepatopata',
    patientTag: 'Idoso 78a hepatopata',
    vignette:
      'Sr. Antônio, 78 anos, 62 kg, hipertenso controlado, cirrose Child A por hepatite C tratada. Ansioso, sudorético. Acompanhante (filho) presente. Jejum 8h.',
    procedure: 'Exodontia simples de raiz residual',
    question: 'Sedativo pré-procedimento?',
    correct: 'lorazepam',
    why:
      'Lorazepam 1 mg VO 1-2h antes. É BZD 3-OH metabolizado por conjugação direta (glicuronidação) — sem fase oxidativa, sem metabólitos ativos. Efeito previsível em hepatopata e idoso. Não usa CYP3A4.',
    feedbackByOption: {
      'nao-medicar':
        'Funcionaria com uma técnica anestésica caprichada e tempo, mas com ansiedade visível (sudorese, FC alta provável) há risco cardiovascular real em idoso — sedar é mais seguro.',
      midazolam:
        'Midazolam passa por CYP3A4 (que cai com a idade) e tem metabólito ativo. No idoso/hepatopata acumula → sedação prolongada e risco de queda. Lorazepam é a melhor escolha.',
      lorazepam:
        'CORRETO. 3-OH BZD: glicuronidação direta, sem metabólito ativo. Início lento (~2h) é desvantagem em outros contextos, mas em procedimento eletivo agendado é OK.',
      n2o:
        'N2O é seguro e tem rápida recuperação, ótima opção complementar em idoso ansioso — mas precisa cooperação e via aérea pérvia. Como sedativo único pode não bastar para ansiedade marcada.',
      encaminhar:
        'Caso ambulatorial padrão — não há indicação de centro cirúrgico ou anestesista para extração simples em idoso compensado.',
    },
    tags: ['idoso', 'hepatopata', 'lorazepam'],
  },
  {
    id: 'fobica-jovem',
    patientTag: 'Adulta 32a fóbica',
    vignette:
      'Sra. Letícia, 32a, hígida, ASA I, fobia odontológica grave (não vai ao dentista há 12 anos). Veio agora com dor. Coopera com a conversa mas dispara FC e suor ao sentar na cadeira. Sem comorbidade. Jejum 6h.',
    procedure: 'Restauração + tratamento endodôntico em 1 sessão',
    question: 'Conduta inicial mais adequada?',
    correct: 'midazolam',
    why:
      'Midazolam VO 7,5-15 mg em adulto, 30-60 min antes. Sedação consciente permite tratamento sem trauma, com amnésia anterógrada (paciente não relembra a experiência ruim — ajuda a romper o ciclo de fobia).',
    feedbackByOption: {
      'nao-medicar':
        'Em fobia grave, manejo só comportamental tende a fracassar — paciente não tolera o procedimento, reforça a fobia. Sedar quebra o ciclo. Use técnicas comportamentais (controle de respiração, presença, contrato verbal) como adjuvantes.',
      midazolam:
        'CORRETO. Amnésia anterógrada é o ponto chave em fóbico — a experiência negativa não vira memória consolidada, facilitando próximas sessões. Acompanhante obrigatório para alta.',
      lorazepam:
        'Lorazepam funciona mas tem início ~2h (menos prática) e menor efeito de amnésia anterógrada que o midazolam. É 2ª opção em adulto hígido.',
      n2o:
        'N2O é excelente em fóbico LEVE — relaxa, dá controle (pode tirar a máscara). Em fobia grave com FC já disparada, geralmente não basta. Combinar com BZD VO é uma estratégia.',
      encaminhar:
        'Sedação IV ou anestesia geral fica para casos refratários ou procedimento muito extenso. Em endo+restauração ambulatorial, midazolam VO costuma resolver.',
    },
    tags: ['fobia', 'midazolam', 'amnesia-anterograda'],
  },
  {
    id: 'cardiopata-controlado',
    patientTag: 'Cardiopata 58a',
    vignette:
      'Sr. Carlos, 58a, 90 kg, HAS controlada (PA 132/82 hoje), pós-IAM há 2 anos, em AAS. Ansioso por causa do histórico cardíaco. Sem alergias. Jejum 6h.',
    procedure: 'Exodontia de 1º molar',
    question: 'Manejo da ansiedade?',
    correct: 'n2o',
    why:
      'N2O/O2 é excelente em cardiopata estável: ansiolítico + ligeira analgesia, recuperação em 5-15 min (não acumula), preserva via aérea, baixo impacto hemodinâmico. Combina bem com técnica anestésica usando mepivacaína 2% c/ epi (limitando vasoconstritor a 2 tubetes).',
    feedbackByOption: {
      'nao-medicar':
        'Em paciente ansioso após IAM, controlar a ansiedade reduz pico de catecolaminas endógenas — protege o miocárdio. Não é safe ignorar.',
      midazolam:
        'Midazolam é seguro em cardiopata estável, mas tem recuperação mais lenta. N2O dá efeito imediato e rápida recuperação — melhor para ambulatorial em cardiopata.',
      lorazepam:
        'Lorazepam funciona, mas duração longa (8h) é exagero para um procedimento curto. Risco de sedação residual no caminho de casa.',
      n2o:
        'CORRETO. Em ASA II-III estável, N2O é a escolha mais elegante. Cuidado: ajustar concentração 30-50%, manter O2 100% por 5 min antes de retirar a máscara (evitar hipóxia de difusão).',
      encaminhar:
        'IAM HÁ 2 anos, com PA controlada, sem angina ativa = ambulatorial é seguro. Encaminhar é overtreatment.',
    },
    tags: ['cardiopata', 'n2o'],
  },
  {
    id: 'gestante-ansiosa',
    patientTag: 'Gestante 28sem',
    vignette:
      'Mariana, 30a, gestante 28 semanas, sem comorbidades, ansiosa pela primeira consulta odontológica na gravidez. Bem orientada, coopera. Sem alergias. Jejum 4h.',
    procedure: 'Profilaxia + restauração leve',
    question: 'Manejo da ansiedade?',
    correct: 'nao-medicar',
    why:
      'Manejo comportamental (tell-show-do, decúbito lateral esquerdo, sessões curtas, presença do acompanhante) resolve a maioria. Gestação NÃO contraindica tratamento, e procedimento leve não justifica risco fetal de qualquer sedativo. Reservar farmaco se ansiedade extrema com falha do manejo.',
    feedbackByOption: {
      'nao-medicar':
        'CORRETO. Em gestante hígida com ansiedade comum (não fobia grave), procedimento leve, manejo comportamental + posicionamento lateral esquerdo (evita compressão da veia cava) + sessões curtas resolve.',
      midazolam:
        'BZD na gestação: 1º trimestre risco de fenda labial (controverso), 3º trimestre risco de síndrome de abstinência neonatal e hipotonia. Categoria D do FDA. Evitar se possível.',
      lorazepam:
        'Mesma classe, mesmas preocupações. Não há benzodiazepínico safe na gestação — todos atravessam a placenta.',
      n2o:
        'N2O é categoria C — risco descrito em uso prolongado (interfere na metilação da B12, teratogênico em animais). No 1º trimestre tradicionalmente evitado. Em emergência ambulatorial, exposição curta tem sido considerada, mas NÃO é 1ª linha em procedimento eletivo leve.',
      encaminhar:
        'Pré-natal odontológico de rotina é responsabilidade do generalista — não precisa especialista. Encaminhar é abandonar a paciente.',
    },
    tags: ['gestante', 'manejo-comportamental'],
  },
  {
    id: 'down-adolescente',
    patientTag: 'Adolescente com S. Down',
    vignette:
      'Lucas, 14 anos, 55 kg, síndrome de Down, cardiopatia congênita corrigida há 10 anos sem sequelas (acompanhamento normal), agitado e não-cooperativo (já tentou tratamento ambulatorial 2x sem sucesso). Mãe relata recusa firme.',
    procedure: 'Restaurações múltiplas + raspagem',
    question: 'Conduta?',
    correct: 'encaminhar',
    why:
      'Falha de sedação ambulatorial em paciente com necessidades especiais → indicação formal de tratamento sob anestesia geral em centro cirúrgico com equipe multidisciplinar (anestesista, monitorização, cardio se necessário). Não é "desistir" — é a conduta correta após falha do consciente.',
    feedbackByOption: {
      'nao-medicar':
        'Já houve 2 tentativas frustradas — insistir traumatiza paciente, família e equipe. Escalar para próxima etapa.',
      midazolam:
        'Midazolam VO em paciente que já rejeitou abordagem ambulatorial 2x tem alta chance de falha (cooperação parcial é necessária para dose oral e para colaborar mesmo sedado). Em peso 55 kg, dose 0,5 mg/kg = 27 mg > teto de 15-20 mg — não é dose adequada.',
      lorazepam:
        'Mesma limitação do midazolam — depende de cooperação básica que esse paciente não tem.',
      n2o:
        'N2O exige paciente que aceita a máscara nasal — em paciente não-cooperativo é inviável.',
      encaminhar:
        'CORRETO. Falha de sedação consciente em paciente com necessidades especiais = anestesia geral ambulatorial ou hospitalar com equipe própria. Documente as tentativas anteriores e a justificativa.',
    },
    tags: ['necessidades-especiais', 'encaminhamento'],
  },
];

export function pickRandomCase(): CadeiraCase {
  return CADEIRA_CASES[Math.floor(Math.random() * CADEIRA_CASES.length)];
}

export function getCadeiraCase(id: string): CadeiraCase | undefined {
  return CADEIRA_CASES.find((c) => c.id === id);
}
