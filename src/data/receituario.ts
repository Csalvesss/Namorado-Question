// Receituário Guiado — usuária constrói uma receita estruturada e a engine
// valida campo a campo contra o que seria a prescrição correta pro cenário.
//
// Princípio: output-based retrieval + erro produtivo. Ela não escolhe "a"
// resposta certa entre 4 — ela MONTA a receita inteira e descobre, campo
// a campo, o que acertou e o que precisa rever.

export type Medicamento =
  | 'amoxicilina'
  | 'amoxicilina-clavulanato'
  | 'cefalexina'
  | 'clindamicina'
  | 'azitromicina'
  | 'metronidazol'
  | 'ibuprofeno'
  | 'paracetamol'
  | 'dipirona'
  | 'nimesulida'
  | 'diclofenaco-k'
  | 'cetorolaco'
  | 'dexametasona'
  | 'codeina-paracet'
  | 'tramadol'
  | 'omeprazol';

export const MEDICAMENTO_LABEL: Record<Medicamento, string> = {
  amoxicilina: 'Amoxicilina',
  'amoxicilina-clavulanato': 'Amoxicilina + clavulanato',
  cefalexina: 'Cefalexina',
  clindamicina: 'Clindamicina',
  azitromicina: 'Azitromicina',
  metronidazol: 'Metronidazol',
  ibuprofeno: 'Ibuprofeno',
  paracetamol: 'Paracetamol',
  dipirona: 'Dipirona',
  nimesulida: 'Nimesulida',
  'diclofenaco-k': 'Diclofenaco potássico',
  cetorolaco: 'Cetorolaco trometamol',
  dexametasona: 'Dexametasona',
  'codeina-paracet': 'Codeína + paracetamol',
  tramadol: 'Tramadol',
  omeprazol: 'Omeprazol',
};

export type Intervalo = '6/6h' | '8/8h' | '12/12h' | '24/24h' | 'dose-unica';
export const INTERVALO_LABEL: Record<Intervalo, string> = {
  '6/6h': '6 em 6 horas',
  '8/8h': '8 em 8 horas',
  '12/12h': '12 em 12 horas',
  '24/24h': '1× ao dia',
  'dose-unica': 'dose única',
};

export type Via = 'VO' | 'IM' | 'IV' | 'SC' | 'topica';
export const VIA_LABEL: Record<Via, string> = {
  VO: 'Via oral',
  IM: 'Intramuscular',
  IV: 'Endovenosa',
  SC: 'Subcutânea',
  topica: 'Tópica',
};

export type Orientacao =
  | 'apos-refeicao'
  | 'jejum'
  | 'evitar-alcool'
  | 'tomar-agua'
  | 'horario-fixo'
  | 'antes-procedimento'
  | 'evitar-direcao'
  | 'monitorar-glicemia'
  | 'completar-curso';

export const ORIENTACAO_LABEL: Record<Orientacao, string> = {
  'apos-refeicao': 'tomar após refeição',
  jejum: 'tomar em jejum',
  'evitar-alcool': 'evitar álcool durante o tratamento',
  'tomar-agua': 'beber bastante água',
  'horario-fixo': 'tomar em horário fixo (não SOS)',
  'antes-procedimento': 'tomar 30-60 min antes do procedimento',
  'evitar-direcao': 'evitar dirigir/operar máquinas',
  'monitorar-glicemia': 'monitorar glicemia capilar',
  'completar-curso': 'completar todos os dias prescritos',
};

export interface ReceitaCorreta {
  medicamento: Medicamento;
  /** Dose em mg (mantém numérica para validação simples) */
  doseMg: number;
  intervalo: Intervalo;
  /** Duração em dias (0 = dose única) */
  duracaoDias: number;
  via: Via;
  orientacoes: Orientacao[];
}

export interface ReceitaScenario {
  id: string;
  patientTag: string;
  vignette: string;
  diagnosis: string;
  /** Medicamentos perigosos NESSE cenário — engine alerta se a aluna escolher */
  forbidden: Partial<Record<Medicamento, string>>;
  correct: ReceitaCorreta;
  teaching: string;
}

export const RECEITA_SCENARIOS: ReceitaScenario[] = [
  {
    id: 'abscesso-adulto',
    patientTag: 'Adulto 70 kg s/ alergia',
    vignette:
      'Homem 38 anos, 70 kg, ASA I, sem alergias. Apresenta abscesso periapical com celulite leve no 26, sem febre, sem disfagia.',
    diagnosis: 'Infecção odontogênica leve-moderada',
    forbidden: {},
    correct: {
      medicamento: 'amoxicilina',
      doseMg: 500,
      intervalo: '8/8h',
      duracaoDias: 7,
      via: 'VO',
      orientacoes: ['apos-refeicao', 'completar-curso'],
    },
    teaching:
      'Amoxicilina 500 mg VO 8/8h por 7 dias é a 1ª linha em infecção odontogênica leve-moderada em paciente sem alergia. SEMPRE associada à remoção da causa (drenagem, endo ou exo). Tomar após refeição reduz dispepsia.',
  },
  {
    id: 'pos-siso',
    patientTag: 'Adulto pós-siso',
    vignette:
      'Mulher 24 anos, 60 kg, ASA I, sem alergias, sem gestação. Pós-exodontia de 38 incluso há 1 hora. Dor moderada esperada.',
    diagnosis: 'Dor inflamatória pós-cirúrgica',
    forbidden: {
      cetorolaco: 'AINE potente reservado para dor refratária — risco hemorrágico desnecessário em pós-op de rotina',
      tramadol: 'Opioide só após falha de AINE + paracetamol; começar com isso é overtreatment',
    },
    correct: {
      medicamento: 'ibuprofeno',
      doseMg: 600,
      intervalo: '8/8h',
      duracaoDias: 3,
      via: 'VO',
      orientacoes: ['apos-refeicao', 'horario-fixo'],
    },
    teaching:
      'Ibuprofeno 600 mg VO 8/8h por 3-5 dias é o padrão em pós-op de siso. CRÍTICO: HORÁRIO FIXO nas primeiras 48-72h (não "se dor") — analgesia preemptiva impede o pico. Pode associar paracetamol 750 mg 6/6h para cobertura adicional.',
  },
  {
    id: 'gestante-dor',
    patientTag: 'Gestante 22sem',
    vignette:
      'Gestante 22 semanas, 65 kg, ASA II por gravidez. Pós-exodontia de 46. Sem alergia. Dor moderada.',
    diagnosis: 'Dor pós-cirúrgica em gestante (AINE contraindicado)',
    forbidden: {
      ibuprofeno: 'AINE em gestação 3ºT (e idealmente todo o ciclo em extração) — risco renal fetal',
      'diclofenaco-k': 'AINE — mesma preocupação',
      nimesulida: 'AINE — mesma preocupação',
      cetorolaco: 'AINE potente CI absoluta em gestação',
      'codeina-paracet': 'Codeína — risco de depressão respiratória neonatal via CYP2D6',
      tramadol: 'Opioide com componente serotoninérgico, evitar em gestação',
    },
    correct: {
      medicamento: 'dipirona',
      doseMg: 500,
      intervalo: '6/6h',
      duracaoDias: 3,
      via: 'VO',
      orientacoes: ['horario-fixo'],
    },
    teaching:
      'Dipirona 500-1000 mg 6/6h é permitida no 2ºT quando AINE está CI. Sem efeito antiplaquetário relevante (não piora o sangramento do alvéolo). Paracetamol 500 mg 6/6h é alternativa de menor potência. CI: 1º e 3º trimestre.',
  },
  {
    id: 'alergico-abscesso',
    patientTag: 'Alérgica imediata a pen',
    vignette:
      'Mulher 32 anos, 65 kg, ASA I. História de urticária generalizada com penicilina há 5 anos. Abscesso periapical no 16 com indicação de antibiótico.',
    diagnosis: 'Infecção odontogênica em alérgica IMEDIATA à penicilina',
    forbidden: {
      amoxicilina: 'Alergia IMEDIATA à penicilina — CI absoluta',
      'amoxicilina-clavulanato': 'Mesmo motivo — clavulanato não neutraliza alergia',
      cefalexina: 'Cefalosporina tem ~1-3% de reação cruzada em alergia IMEDIATA — evitar',
    },
    correct: {
      medicamento: 'clindamicina',
      doseMg: 300,
      intervalo: '6/6h',
      duracaoDias: 7,
      via: 'VO',
      orientacoes: ['apos-refeicao', 'completar-curso', 'tomar-agua'],
    },
    teaching:
      'Clindamicina 300 mg VO 6/6h por 7d é a 1ª escolha em alérgico imediato à penicilina. Cobre Gram+ e anaeróbios orais, sem reação cruzada. Atenção: risco de colite por C. difficile — orientar paciente a relatar diarreia profusa. Azitromicina 500 mg 1×/dia é alternativa.',
  },
  {
    id: 'idoso-diabetico',
    patientTag: 'Idoso DM em glibenclamida',
    vignette:
      'Sr. José, 76 anos, 72 kg, DM2 em glibenclamida 5 mg/dia, HAS controlada. Pós-exodontia de 36 hoje. Dor moderada esperada.',
    diagnosis: 'Dor pós-cirúrgica em idoso com risco de hipoglicemia',
    forbidden: {
      ibuprofeno: 'AINE + glibenclamida em idoso = hipoglicemia (deslocamento da albumina) — CI relativa',
      'diclofenaco-k': 'AINE — mesmo risco',
      nimesulida: 'AINE — mesmo risco; hepatotox adicional',
      cetorolaco: 'AINE potente em idoso — risco hemorrágico e renal',
    },
    correct: {
      medicamento: 'paracetamol',
      doseMg: 750,
      intervalo: '6/6h',
      duracaoDias: 3,
      via: 'VO',
      orientacoes: ['horario-fixo', 'monitorar-glicemia'],
    },
    teaching:
      'Paracetamol 750 mg VO 6/6h é a 1ª escolha em idoso com glibenclamida. AINE desloca a sulfa da albumina e reduz clearance renal → hipoglicemia clinicamente relevante. Dipirona é alternativa válida. Monitorar glicemia mais frequente nas 48h pelo estresse cirúrgico.',
  },
  {
    id: 'profilaxia-ei',
    patientTag: 'Prótese valvar p/ extração',
    vignette:
      'Adulta 55 anos, 70 kg, prótese valvar mitral mecânica há 8 anos, em uso de varfarina (INR 2.5). Sem alergia. Vai fazer exodontia de 26.',
    diagnosis: 'Profilaxia de endocardite (AHA 2021)',
    forbidden: {},
    correct: {
      medicamento: 'amoxicilina',
      doseMg: 2000,
      intervalo: 'dose-unica',
      duracaoDias: 0,
      via: 'VO',
      orientacoes: ['antes-procedimento'],
    },
    teaching:
      'Amoxicilina 2 g VO em DOSE ÚNICA, 30-60 min antes do procedimento. Em criança: 50 mg/kg (teto 2 g). Em alérgico imediato a pen: clindamicina 600 mg ou azitromicina 500 mg. CONTRADITÓRIO comum: prescrever 500 mg 8/8h por 7d como se fosse infecção — em profilaxia é dose alta única.',
  },
];

export interface ReceitaSubmissao {
  medicamento: Medicamento | null;
  doseMg: number | null;
  intervalo: Intervalo | null;
  duracaoDias: number | null;
  via: Via | null;
  orientacoes: Orientacao[];
}

export interface ValidacaoResultado {
  field: keyof ReceitaSubmissao;
  ok: boolean;
  message: string;
}

export function validarReceita(
  sub: ReceitaSubmissao,
  scenario: ReceitaScenario,
): { results: ValidacaoResultado[]; forbiddenAlert?: string } {
  const results: ValidacaoResultado[] = [];

  // Medicamento — checa se está na lista de forbidden ANTES do correto
  if (!sub.medicamento) {
    results.push({ field: 'medicamento', ok: false, message: 'Escolha um medicamento.' });
  } else if (sub.medicamento === scenario.correct.medicamento) {
    results.push({
      field: 'medicamento',
      ok: true,
      message: `${MEDICAMENTO_LABEL[sub.medicamento]} — escolha correta.`,
    });
  } else if (scenario.forbidden[sub.medicamento]) {
    results.push({
      field: 'medicamento',
      ok: false,
      message: `${MEDICAMENTO_LABEL[sub.medicamento]} — ${scenario.forbidden[sub.medicamento]}`,
    });
  } else {
    results.push({
      field: 'medicamento',
      ok: false,
      message: `Não é o ideal aqui. A escolha de 1ª linha seria ${MEDICAMENTO_LABEL[scenario.correct.medicamento]}.`,
    });
  }

  // Dose — só valida se medicamento certo
  if (sub.medicamento === scenario.correct.medicamento) {
    if (sub.doseMg === scenario.correct.doseMg) {
      results.push({ field: 'doseMg', ok: true, message: `${sub.doseMg} mg — dose correta.` });
    } else if (sub.doseMg) {
      results.push({
        field: 'doseMg',
        ok: false,
        message: `${sub.doseMg} mg não é a dose recomendada — o padrão é ${scenario.correct.doseMg} mg.`,
      });
    } else {
      results.push({ field: 'doseMg', ok: false, message: 'Defina a dose.' });
    }
  }

  // Intervalo
  if (sub.medicamento === scenario.correct.medicamento) {
    if (sub.intervalo === scenario.correct.intervalo) {
      results.push({
        field: 'intervalo',
        ok: true,
        message: `${INTERVALO_LABEL[sub.intervalo]} — intervalo correto.`,
      });
    } else if (sub.intervalo) {
      results.push({
        field: 'intervalo',
        ok: false,
        message: `${INTERVALO_LABEL[sub.intervalo]} não é o padrão. O esperado é ${INTERVALO_LABEL[scenario.correct.intervalo]}.`,
      });
    } else {
      results.push({ field: 'intervalo', ok: false, message: 'Defina o intervalo.' });
    }
  }

  // Duração
  if (sub.medicamento === scenario.correct.medicamento) {
    if (sub.duracaoDias === scenario.correct.duracaoDias) {
      const txt =
        scenario.correct.duracaoDias === 0
          ? 'dose única'
          : `${scenario.correct.duracaoDias} dias`;
      results.push({ field: 'duracaoDias', ok: true, message: `${txt} — duração correta.` });
    } else if (sub.duracaoDias !== null) {
      const txtCorr =
        scenario.correct.duracaoDias === 0
          ? 'dose única'
          : `${scenario.correct.duracaoDias} dias`;
      results.push({
        field: 'duracaoDias',
        ok: false,
        message: `Você marcou ${sub.duracaoDias === 0 ? 'dose única' : `${sub.duracaoDias} dias`}. O padrão é ${txtCorr}.`,
      });
    } else {
      results.push({ field: 'duracaoDias', ok: false, message: 'Defina a duração.' });
    }
  }

  // Via
  if (sub.medicamento === scenario.correct.medicamento) {
    if (sub.via === scenario.correct.via) {
      results.push({ field: 'via', ok: true, message: `${VIA_LABEL[sub.via]} — via correta.` });
    } else if (sub.via) {
      results.push({
        field: 'via',
        ok: false,
        message: `${VIA_LABEL[sub.via]} não é o padrão aqui. O esperado é ${VIA_LABEL[scenario.correct.via]}.`,
      });
    } else {
      results.push({ field: 'via', ok: false, message: 'Defina a via.' });
    }
  }

  // Orientações — checa cobertura mínima das essenciais
  if (sub.medicamento === scenario.correct.medicamento) {
    const missing = scenario.correct.orientacoes.filter((o) => !sub.orientacoes.includes(o));
    if (missing.length === 0) {
      results.push({
        field: 'orientacoes',
        ok: true,
        message: 'Orientações cobertas. Receita completa.',
      });
    } else {
      results.push({
        field: 'orientacoes',
        ok: false,
        message: `Faltou orientar: ${missing.map((m) => ORIENTACAO_LABEL[m]).join('; ')}.`,
      });
    }
  }

  return { results };
}

export function pickRandomScenario(): ReceitaScenario {
  return RECEITA_SCENARIOS[Math.floor(Math.random() * RECEITA_SCENARIOS.length)];
}
