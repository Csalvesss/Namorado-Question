/**
 * Inventário do material do Sem 1 (UNINOVE Medicina, ciclo clínico — 5º M, conforme
 * PDFs lidos do Drive em jun/2026, pasta "Semestre 1" id 1d5ckcAPr4S44Wg9yBvHFMKFfRh1_60Ru).
 *
 * Usado pra (1) escolher referências fiéis nas questões e (2) mostrar no painel admin
 * de validação qual aula/professor cada questão referencia.
 *
 * Os professores nominados aqui aparecem nos slides — fonte primária dos casos.
 */

export interface Sem1Discipline {
  id: string;
  title: string;
  area: string;
  professor?: string;
  pdfFileId: string;
  pdfTitle: string;
  /** Tópicos centrais extraídos dos slides — usados pra checagem de cobertura. */
  topics: string[];
}

export const SEM1_DISCIPLINES: Sem1Discipline[] = [
  // === Endocrinologia ===
  {
    id: 'endo-diabetes',
    title: 'Diabetes Mellitus',
    area: 'Endocrinologia',
    professor: 'Prof. Matheus Salgado, Profa. Luciana Brito, Profa. Adriana Bosco',
    pdfFileId: '1V2c1URWBCdcK9iweCA9cXrYWoaJxFgor',
    pdfTitle: '2 Diabetes Mellitus_260330_204949 (12).pdf',
    topics: [
      'definição e prevalência (IDF, SBD)',
      'classificação DM1/DM2/MODY/LADA/DM gestacional',
      'diagnóstico (glicemia jejum, HbA1c, TOTG, sintomas + 200)',
      'rastreio DM2 e gestacional',
      'tratamento não-farmacológico',
      'metformina, sulfonilureia, glinida, glitazona, acarbose',
      'iDPP-4, análogos GLP-1, agonista GLP-1/GIP, iSGLT2',
      'insulinoterapia (NPH, regular, ultrarrápida, análogos basais)',
      'escolha por RCV, IMC, HbA1c, TFG',
      'meta HbA1c <7%, TIR',
    ],
  },
  {
    id: 'endo-tireoide',
    title: 'Doenças da Tireoide',
    area: 'Endocrinologia',
    pdfFileId: '1NLwbshFpiHdPtAkFBFvcrDkPJeiNH3R7',
    pdfTitle: '4 Doenças da Tireoide_260330_205632 (13).pdf',
    topics: ['hipotireoidismo', 'hipertireoidismo (Graves, BMNT)', 'nódulos', 'tireoidites', 'TSH, T4L, anti-TPO, TRAb', 'levotiroxina, tionamidas, iodo radioativo'],
  },
  {
    id: 'endo-hipofise',
    title: 'Hipófise',
    area: 'Endocrinologia',
    pdfFileId: '1o21nHAeJrdaPVc99RcHbVO4BJtaanGA4',
    pdfTitle: '5 Hipófise_260318_223015 (13).pdf',
    topics: ['adenomas hipofisários', 'prolactinoma', 'acromegalia', 'Cushing central', 'hipopituitarismo', 'diabetes insipidus'],
  },
  {
    id: 'endo-adrenal',
    title: 'Adrenal',
    area: 'Endocrinologia',
    pdfFileId: '1RVW9KjCPR9p8OZE82Mrj_7Q05m0no6VD',
    pdfTitle: '7 Adrenal_260331_082320 (12).pdf',
    topics: ['Cushing', 'Addison', 'hiperaldosteronismo primário (Conn)', 'feocromocitoma', 'incidentaloma', 'crise adrenal'],
  },
  {
    id: 'endo-paratireoide',
    title: 'Paratireoide, distúrbios do cálcio e osteoporose',
    area: 'Endocrinologia',
    pdfFileId: '1J-KMR_BzJePcuWzBgcM6pRtALdTb3WmX',
    pdfTitle: '9Paratireoide, distúrbios do cálcio e osteoporose_260329_165259 (13).pdf',
    topics: ['hiperparatireoidismo 1ário/2ário', 'hipoparatireoidismo', 'hipercalcemia da malignidade', 'osteoporose', 'DEXA', 'bisfosfonatos, denosumabe'],
  },

  // === Nefrologia / Urologia ===
  {
    id: 'nefro-glomerulopatias',
    title: 'Síndromes glomerulares',
    area: 'Nefrologia',
    pdfFileId: '1behklJi95F05wkyDp5f7VbXT4JQaJoYZ',
    pdfTitle: 'Síndromes glomerulares-2026_260301_152923 (11).pdf',
    topics: ['síndrome nefrótica', 'síndrome nefrítica', 'GN pós-estreptocócica', 'nefropatia por IgA', 'membranosa', 'segmentar focal', 'lúpus', 'biópsia renal'],
  },
  {
    id: 'nefro-drc',
    title: 'Avaliação da função renal e DRC',
    area: 'Nefrologia',
    pdfFileId: '1nugSOz4-jdvxqVypNF_fY5iHFExntl9F',
    pdfTitle: 'Avaliacao_da_funo_renal_e_DRC_260328_182736 (10).pdf',
    topics: ['TFG (CKD-EPI)', 'KDIGO', 'estadiamento DRC (G1-G5)', 'albuminúria (A1-A3)', 'manejo conservador', 'preparo TRS'],
  },
  {
    id: 'uro-itu',
    title: 'Infecção do Trato Urinário (ITU)',
    area: 'Infectologia / Urologia',
    professor: 'Mariana B. Pereira',
    pdfFileId: '1Eb6uDU1gCH91xP6xkvEGUndQ2_2kvPze',
    pdfTitle: 'Infecção Urinária_260301_095210 (11).pdf',
    topics: [
      'cistite vs pielonefrite vs urossepse',
      'ITU complicada vs não complicada',
      'E. coli e fatores de virulência (fimbrias)',
      'urocultura ≥10^5 UFC/mL',
      'nitrofurantoína, fosfomicina, SMZ-TMP, ceftriaxona',
      'ITU recorrente e profilaxia',
      'bacteriúria assintomática',
      'ITU em DM, sonda, gestante',
    ],
  },
  {
    id: 'uro-hpb',
    title: 'Hiperplasia Prostática Benigna (HPB)',
    area: 'Urologia',
    pdfFileId: '1F2PDZJDlMO0_9ga6arydIl-hesuG1RGb',
    pdfTitle: 'HPB 2025pdf_260501_122938.pdf',
    topics: ['LUTS', 'IPSS', 'PSA', 'alfa-bloqueadores', '5-alfa-redutase', 'RTUP'],
  },
  {
    id: 'uro-litiase',
    title: 'Litíase Urinária',
    area: 'Urologia',
    pdfFileId: '1e9O2yQxTidvLzbGxkP9dIqh2Byqsa9mf',
    pdfTitle: 'LITÍASE URINÁRIA 2025pdf_260531_124804.pdf',
    topics: ['composição do cálculo (oxalato cálcio, ácido úrico, estruvita)', 'cólica renal', 'TC sem contraste', 'LECO/URS/NLP', 'profilaxia'],
  },
  {
    id: 'uro-ca-prostata',
    title: 'Câncer de Próstata',
    area: 'Urologia / Oncologia',
    pdfFileId: '1LxTB2IYxImx1kbesTGfM0WPz2dcwmGpf',
    pdfTitle: '5 Câncer de Próstata_260508_164720.pdf',
    topics: ['rastreio PSA', 'biópsia', 'Gleason', 'prostatectomia', 'radioterapia', 'bloqueio androgênico', 'antagonistas GnRH'],
  },

  // === Cirurgia / Patologia geral ===
  {
    id: 'cir-resposta-neuroendocrina',
    title: 'Resposta neuroendócrina, metabólica e inflamatória',
    area: 'Cirurgia / Fisiologia',
    pdfFileId: '1gD7w2PNAdxdIy-22PwRDGhUJDyRbusku',
    pdfTitle: 'V6-2026 Resposta neuroEndócrina, Metabólica e Inflamatória_260319_194512 (4).pdf',
    topics: ['eixo HHA no trauma', 'catabolismo', 'ebb e flow', 'citocinas pró-inflamatórias', 'SIRS'],
  },
  {
    id: 'cir-cicatrizacao',
    title: 'Cicatrização Patológica',
    area: 'Cirurgia / Patologia',
    pdfFileId: '10nwzYTgza3t4YGxuSB6qnI2aCyt3BTuy',
    pdfTitle: 'Cicatrização Patológica_260212_161526 (3).pdf',
    topics: ['fases da cicatrização', 'cicatriz hipertrófica', 'queloide', 'deiscência', 'fatores que prejudicam (DM, desnutrição, corticoide)'],
  },
  {
    id: 'cir-infeccao',
    title: 'Infecção em Cirurgia',
    area: 'Cirurgia',
    pdfFileId: '1TEqxrZWg8Ia6AO98OOgQTo5-kUCPT2X3',
    pdfTitle: 'V4-2026 Infecção em Cirurgia_260326_152236 (3).pdf',
    topics: ['ISC (infecção do sítio cirúrgico)', 'classificação ferida (limpa/contaminada/infectada)', 'profilaxia antibiótica', 'cefazolina perioperatório'],
  },
  {
    id: 'cir-lesao-pressao',
    title: 'Lesão por Pressão',
    area: 'Geriatria / Enfermagem clínica',
    pdfFileId: '1WKAgeGTDQLWWkiwVgE0JF_QdfmylF7hK',
    pdfTitle: 'Lesão por pressão_260605_103942 (5).pdf',
    topics: ['estágios I-IV + LP suspeita de tecido profundo', 'escalas (Braden)', 'prevenção'],
  },

  // === Neurologia ===
  {
    id: 'neuro-cefaleias',
    title: 'Cefaleias',
    area: 'Neurologia',
    pdfFileId: '169hmhBE1_BfdBPOewOOEotte8z8wR1zF',
    pdfTitle: 'Aula_Cefaleias_Graduacao_Medicina_2h_Final_260308_172403 (7).pdf',
    topics: ['migrânea', 'tensional', 'salvas', 'sinais de alarme (red flags)', 'cefaleia secundária', 'tratamento agudo e profilático'],
  },
  {
    id: 'neuro-demencias',
    title: 'Demências',
    area: 'Neurologia / Geriatria',
    pdfFileId: '1SgbZ-7Uiaf5vJxcdS51W9DCZn3imeKSu',
    pdfTitle: 'Aula_Demencias_260327_134847 (7).pdf',
    topics: ['Alzheimer', 'vascular', 'corpos de Lewy', 'frontotemporal', 'MEEM', 'MoCA', 'anticolinesterásicos', 'memantina'],
  },

  // === Oftalmologia ===
  {
    id: 'oftalmo-anatomia',
    title: 'Anatomia do Olho e Anexos',
    area: 'Oftalmologia',
    pdfFileId: '1z4Z_2HoT9vwZeH3EfCkQ4qQGNoz4gfky',
    pdfTitle: 'Roteiro - Aula 1_Anatomia do Olho e Anexos_260313_095910.pdf',
    topics: ['órbita', 'pálpebras', 'aparelho lacrimal', 'músculos extraoculares'],
  },
  {
    id: 'oftalmo-fisiologia',
    title: 'Fisiologia da Visão e Neuro-oftalmologia',
    area: 'Oftalmologia',
    pdfFileId: '1e1eFX8f4HPJAfQGAUJYn7-B4fXUjXqzq',
    pdfTitle: 'Roteiro - Aula 2 Fisiologia da Visão / Neuro-oftalmo_260313_104000.pdf',
    topics: ['via óptica', 'reflexos pupilares', 'campo visual', 'edema de papila'],
  },

  // === Oncologia / Derm ===
  {
    id: 'derm-melanoma',
    title: 'Melanoma',
    area: 'Dermatologia / Oncologia',
    pdfFileId: '1iEnLgYW6jEJdr6lb2b03h2qaD6i-3LBV',
    pdfTitle: 'MELANOMA_260312_141510 (4).pdf',
    topics: ['ABCDE', 'Breslow', 'Clark', 'linfonodo sentinela', 'imunoterapia (anti-PD1, anti-CTLA-4)'],
  },
];

export function findSem1Discipline(id: string): Sem1Discipline | undefined {
  return SEM1_DISCIPLINES.find((d) => d.id === id);
}
