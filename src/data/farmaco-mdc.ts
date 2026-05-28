// Mapa de Decisão Clínica — dados da v1.
//
// Estrutura proposital: classe é o "chunk" principal. Cenário entra por vinheta,
// pede a classe, depois a molécula. Fechamento traz dose-âncora + bandeira
// vermelha + um gancho mnemônico opcional.
//
// Expansão: adicionar mais entradas nestes arrays.

export type FarmacoSystem =
  | 'cardio'
  | 'infecto'
  | 'endo'
  | 'antiviral'
  | 'antiparasitario'
  | 'antineoplasico'
  | 'reprodutor';

export const SYSTEM_LABEL: Record<FarmacoSystem, string> = {
  cardio: 'Cardiologia',
  infecto: 'Infectologia',
  endo: 'Endocrinologia',
  antiviral: 'Antivirais',
  antiparasitario: 'Antiparasitários',
  antineoplasico: 'Antineoplásicos',
  reprodutor: 'Reprodutor',
};

export interface DrugClass {
  id: string;
  name: string;
  system: FarmacoSystem;
  short: string;
}

export interface Drug {
  id: string;
  name: string;
  classId: string;
  mechanism: string;
  anchorIndication: string;
  doseAnchor: string;
  redFlag: string;
  mnemonic?: string;
}

export interface Scenario {
  id: string;
  system: FarmacoSystem;
  vignette: string;
  question: string;
  correctClassId: string;
  classDistractors: string[]; // 3 IDs de classe pra montar opções (com a correta totaliza 4)
  correctDrugId: string;
  drugDistractors: string[]; // 2 IDs de droga (mesma classe da correta sempre que possível)
  teaching: string; // 1-2 linhas no fechamento
}

// ============================================================
// CLASSES
// ============================================================

export const CLASSES: DrugClass[] = [
  // Cardio
  { id: 'ieca', name: 'IECA', system: 'cardio', short: 'Inibe ECA → ↓Ang II + ↑bradicinina' },
  { id: 'bra', name: 'BRA', system: 'cardio', short: 'Bloqueia receptor AT1 (sem tosse)' },
  { id: 'bb', name: 'Betabloqueador', system: 'cardio', short: 'Bloqueia β1 (e β2 se não seletivo)' },
  { id: 'bcc-dh', name: 'BCC di-hidropiridínico', system: 'cardio', short: 'Vasodilatação periférica' },
  { id: 'bcc-ndh', name: 'BCC não di-hidropiridínico', system: 'cardio', short: 'Cronotropismo e inotropismo negativos' },
  { id: 'tiazid', name: 'Tiazídico', system: 'cardio', short: 'Inibe Na/Cl no túbulo distal' },
  { id: 'alca', name: 'Diurético de alça', system: 'cardio', short: 'Inibe Na/K/2Cl na alça de Henle' },
  { id: 'pp-k', name: 'Poupador de K+', system: 'cardio', short: 'Antagoniza aldosterona ou ENaC' },
  { id: 'arni', name: 'ARNI', system: 'cardio', short: 'BRA + inibidor da neprilisina' },
  { id: 'isglt2', name: 'iSGLT2', system: 'cardio', short: 'Inibe reabsorção de glicose no túbulo proximal' },
  { id: 'estatina', name: 'Estatina', system: 'cardio', short: 'Inibe HMG-CoA redutase' },
  { id: 'avk', name: 'Antagonista de vit. K', system: 'cardio', short: 'Inibe carboxilação de fatores II, VII, IX, X' },
  { id: 'doac', name: 'DOAC', system: 'cardio', short: 'Anticoagulante oral direto (anti-Xa ou anti-IIa)' },
  { id: 'hbpm', name: 'Heparina de baixo peso', system: 'cardio', short: 'Anti-Xa predominante; SC' },

  // Infecto / Antibióticos
  { id: 'betalact-pen', name: 'Penicilina', system: 'infecto', short: 'β-lactâmico — inibe PBP' },
  { id: 'betalact-cef', name: 'Cefalosporina', system: 'infecto', short: 'β-lactâmico — inibe PBP, espectro por geração' },
  { id: 'glicop', name: 'Glicopeptídeo', system: 'infecto', short: 'Liga D-Ala-D-Ala (parede)' },
  { id: 'aminog', name: 'Aminoglicosídeo', system: 'infecto', short: 'Inibe subunidade 30S' },
  { id: 'macrol', name: 'Macrolídeo', system: 'infecto', short: 'Inibe subunidade 50S' },
  { id: 'quinol', name: 'Fluoroquinolona', system: 'infecto', short: 'Inibe DNA girase/topoisomerase IV' },
  { id: 'sulfa', name: 'Sulfa', system: 'infecto', short: 'Inibe síntese de folato' },

  // Endo
  { id: 'biguanida', name: 'Biguanida', system: 'endo', short: 'Reduz produção hepática de glicose' },
  { id: 'glp1', name: 'Agonista GLP-1', system: 'endo', short: 'Aumenta insulina glicose-dependente, ↓esvaziamento gástrico' },
  { id: 'su', name: 'Sulfonilureia', system: 'endo', short: 'Estimula secreção de insulina pelas ilhotas' },
  { id: 'dpp4', name: 'iDPP-4', system: 'endo', short: 'Inibe degradação de GLP-1 endógeno' },
  { id: 'insulina', name: 'Insulina', system: 'endo', short: 'Reposição exógena de insulina' },
  { id: 'levotir', name: 'Hormônio tireoidiano', system: 'endo', short: 'Reposição de T4' },

  // Antivirais
  { id: 'itrn', name: 'ITRN', system: 'antiviral', short: 'Inibidor da transcriptase reversa nucleosídeo' },
  { id: 'itrnn', name: 'ITRNN', system: 'antiviral', short: 'Inibidor não-nucleosídeo da transcriptase reversa' },
  { id: 'iinst', name: 'Inibidor da integrase', system: 'antiviral', short: 'Bloqueia integração viral no DNA do hospedeiro' },
  { id: 'aciclico', name: 'Análogo de nucleosídeo (HSV/VZV)', system: 'antiviral', short: 'Inibe DNA-polimerase viral após fosforilação pela timidina-quinase' },

  // Antiparasitários
  { id: 'azol', name: 'Antifúngico azólico', system: 'antiparasitario', short: 'Inibe 14α-demetilase (ergosterol)' },
  { id: 'benzimi', name: 'Benzimidazol', system: 'antiparasitario', short: 'Inibe polimerização de β-tubulina' },

  // Antineoplásicos / Reprodutor
  { id: 'aco', name: 'ACO combinado', system: 'reprodutor', short: 'Estrogênio + progestágeno → bloqueia ovulação' },
  { id: 'tamox', name: 'SERM', system: 'antineoplasico', short: 'Modulador seletivo do receptor de estrogênio' },
];

// ============================================================
// DRUGS — v1 cobrindo o miolo dos 156 da P2
// ============================================================

export const DRUGS: Drug[] = [
  // IECA
  { id: 'enalapril', name: 'Enalapril', classId: 'ieca',
    mechanism: 'Inibe ECA',
    anchorIndication: 'HAS, IC com FE reduzida, nefropatia diabética',
    doseAnchor: '5–20 mg VO 12/12h',
    redFlag: 'Tosse seca, angioedema, K+↑, IRA em estenose bilateral, contraindicado na gestação',
    mnemonic: '"-pril" = pressão pra baixo' },
  { id: 'captopril', name: 'Captopril', classId: 'ieca',
    mechanism: 'Inibe ECA (meia-vida curta)',
    anchorIndication: 'Emergência hipertensiva por VO; HAS',
    doseAnchor: '25 mg VO sublingual em urgência',
    redFlag: 'Mesmas do enalapril; risco de hipotensão na 1ª dose' },

  // BRA
  { id: 'losartana', name: 'Losartana', classId: 'bra',
    mechanism: 'Bloqueia AT1',
    anchorIndication: 'HAS, IC, nefropatia diabética, intolerantes a IECA',
    doseAnchor: '50–100 mg VO 1×/dia',
    redFlag: 'Hipercalemia, IRA em estenose bilateral, teratogênica',
    mnemonic: '"-sartana" = sem tosse' },

  // BB
  { id: 'metoprolol', name: 'Succinato de metoprolol', classId: 'bb',
    mechanism: 'Cardiosseletivo β1 (formulação succinato XR)',
    anchorIndication: 'IC com FE reduzida, pós-IAM',
    doseAnchor: '25–200 mg VO 1×/dia (titular lento)',
    redFlag: 'Iniciar só com paciente euvolêmico; bradicardia, broncoespasmo' },
  { id: 'carvedilol', name: 'Carvedilol', classId: 'bb',
    mechanism: 'Não seletivo β + bloqueio α1 (vasodilatador)',
    anchorIndication: 'IC com FE reduzida',
    doseAnchor: '3,125 mg VO 12/12h, dobrar a cada 2 sem',
    redFlag: 'Hipotensão (pelo α1), bradicardia' },
  { id: 'propranolol', name: 'Propranolol', classId: 'bb',
    mechanism: 'Não seletivo β1+β2',
    anchorIndication: 'Tremor, profilaxia de enxaqueca, hipertireoidismo sintomático',
    doseAnchor: '40 mg VO 8/8h',
    redFlag: 'Broncoespasmo, mascara hipoglicemia' },
  { id: 'esmolol', name: 'Esmolol', classId: 'bb',
    mechanism: 'β1 seletivo EV, meia-vida ~9 min',
    anchorIndication: 'Taqui supraventricular peri-op, emergência hipertensiva',
    doseAnchor: 'Bolus 0,5 mg/kg + BIC',
    redFlag: 'Reverte rápido ao suspender — é por isso que é escolhido em UTI',
    mnemonic: 'esmolol = es-mol-OL-curto' },

  // BCC
  { id: 'anlodipino', name: 'Anlodipino', classId: 'bcc-dh',
    mechanism: 'Bloqueia canal de Ca²⁺ tipo L vascular',
    anchorIndication: 'HAS, angina',
    doseAnchor: '5–10 mg VO 1×/dia',
    redFlag: 'Edema de MMII (vasodilatação), cefaleia',
    mnemonic: '"-dipino" = dilata' },
  { id: 'verapamil', name: 'Verapamil', classId: 'bcc-ndh',
    mechanism: 'Bloqueia Ca²⁺ no nó AV (efeito cronotrópico negativo)',
    anchorIndication: 'Controle de FC em FA, taqui supraventricular',
    doseAnchor: '80 mg VO 8/8h ou 5 mg EV',
    redFlag: 'NUNCA com BB (bradiarritmia grave). Contraindicado em IC com FE reduzida.' },

  // Tiazídico / alça / poupador
  { id: 'hctz', name: 'Hidroclorotiazida', classId: 'tiazid',
    mechanism: 'Inibe Na/Cl no túbulo distal',
    anchorIndication: 'HAS (1ª linha em monoterapia ou combinação)',
    doseAnchor: '12,5–25 mg VO 1×/dia',
    redFlag: 'Hipocalemia, hiponatremia, hiperuricemia (gota), perda de eficácia se ClCr < 30' },
  { id: 'furosemida', name: 'Furosemida', classId: 'alca',
    mechanism: 'Inibe Na/K/2Cl na alça de Henle',
    anchorIndication: 'Congestão (IC descompensada, edema)',
    doseAnchor: '20–40 mg EV, titular pela diurese',
    redFlag: 'Hipocalemia, ototoxicidade em bolus rápido, depleção volêmica' },
  { id: 'espironolactona', name: 'Espironolactona', classId: 'pp-k',
    mechanism: 'Antagonista da aldosterona',
    anchorIndication: 'IC com FE reduzida, HAS resistente, hiperaldosteronismo',
    doseAnchor: '25 mg VO 1×/dia',
    redFlag: 'Hipercalemia (cuidar com IECA/BRA), ginecomastia' },

  // Novos cardio
  { id: 'sacubitril', name: 'Sacubitril/valsartana', classId: 'arni',
    mechanism: 'Valsartana (BRA) + sacubitril (inibe neprilisina)',
    anchorIndication: 'IC com FE reduzida em substituição a IECA/BRA',
    doseAnchor: '49/51 mg VO 12/12h',
    redFlag: 'Trocar 36h após o IECA (risco de angioedema)' },
  { id: 'dapaglif', name: 'Dapagliflozina', classId: 'isglt2',
    mechanism: 'Inibe SGLT2 no túbulo proximal',
    anchorIndication: 'DM2, IC (independente de DM), nefroproteção',
    doseAnchor: '10 mg VO 1×/dia',
    redFlag: 'Cetoacidose euglicêmica, ITU/genital, depleção volêmica' },
  { id: 'atorvast', name: 'Atorvastatina', classId: 'estatina',
    mechanism: 'Inibe HMG-CoA redutase',
    anchorIndication: 'Prevenção cardiovascular (alta intensidade)',
    doseAnchor: '40–80 mg VO à noite',
    redFlag: 'Mialgia/rabdomiólise (raro), ↑transaminases' },

  // Anticoagulantes
  { id: 'varfarina', name: 'Varfarina', classId: 'avk',
    mechanism: 'Antagonista de vit. K',
    anchorIndication: 'FA com estenose mitral, prótese valvar mecânica',
    doseAnchor: '5 mg VO 1×/dia, ajustar pelo INR (alvo 2–3)',
    redFlag: 'Janela estreita, várias interações, monitor com INR' },
  { id: 'rivarox', name: 'Rivaroxabana', classId: 'doac',
    mechanism: 'Inibidor direto do fator Xa',
    anchorIndication: 'FA não valvar, TEV',
    doseAnchor: '20 mg VO 1×/dia (FA), 15 mg 12/12h por 21d (TEV)',
    redFlag: 'Sem antídoto rotineiro disponível em todo hospital; ajustar pela função renal' },
  { id: 'enoxap', name: 'Enoxaparina', classId: 'hbpm',
    mechanism: 'Anti-Xa por HBPM',
    anchorIndication: 'Profilaxia e tratamento de TEV/SCA',
    doseAnchor: '1 mg/kg SC 12/12h (tto) ou 40 mg SC 1×/dia (prof.)',
    redFlag: 'Reduzir em ClCr < 30; HIT (raro mas grave)' },

  // Antibióticos
  { id: 'amox', name: 'Amoxicilina', classId: 'betalact-pen',
    mechanism: 'Inibe PBP (síntese de parede)',
    anchorIndication: 'PAC leve, ITU não complicada, faringite estrep.',
    doseAnchor: '500–875 mg VO 8/8h',
    redFlag: 'Alergia, rash típico com EBV' },
  { id: 'ceftri', name: 'Ceftriaxone', classId: 'betalact-cef',
    mechanism: '3ª geração, espectro amplo Gram-negativo',
    anchorIndication: 'Pneumonia grave, meningite, pielonefrite, gonorreia',
    doseAnchor: '1–2 g EV/IM 1×/dia (2g 12/12h em meningite)',
    redFlag: 'Não usar em RN com hiperbilirrubinemia (desloca a bilirrubina)' },
  { id: 'vanco', name: 'Vancomicina', classId: 'glicop',
    mechanism: 'Liga D-Ala-D-Ala (parede)',
    anchorIndication: 'MRSA, infecção grave por Gram+ resistente',
    doseAnchor: '15–20 mg/kg EV 12/12h (monitorar vale)',
    redFlag: 'Síndrome do homem vermelho se infusão rápida, nefro-/ototoxicidade' },
  { id: 'gent', name: 'Gentamicina', classId: 'aminog',
    mechanism: 'Inibe 30S',
    anchorIndication: 'Sinergismo em endocardite, pielo grave',
    doseAnchor: '5–7 mg/kg EV 1×/dia',
    redFlag: 'Nefro- e ototoxicidade (cumulativas, irreversíveis)' },
  { id: 'azitro', name: 'Azitromicina', classId: 'macrol',
    mechanism: 'Inibe 50S',
    anchorIndication: 'PAC ambulatorial (atípicos), uretrite/cervicite',
    doseAnchor: '500 mg VO 1×/dia × 3–5 dias',
    redFlag: 'Prolongamento de QT' },
  { id: 'cipro', name: 'Ciprofloxacino', classId: 'quinol',
    mechanism: 'Inibe DNA girase',
    anchorIndication: 'ITU complicada, Pseudomonas, diarreia bacteriana',
    doseAnchor: '500 mg VO 12/12h',
    redFlag: 'Tendinopatia (Aquiles), QT longo, disglicemia' },
  { id: 'smxtmp', name: 'Sulfametoxazol-trimetoprima', classId: 'sulfa',
    mechanism: 'Inibe síntese de folato em 2 passos',
    anchorIndication: 'Cistite, Pneumocystis (PCP)',
    doseAnchor: '800/160 mg VO 12/12h',
    redFlag: 'Hipersensibilidade, Stevens-Johnson, hipercalemia' },

  // Antidiabéticos
  { id: 'metformina', name: 'Metformina', classId: 'biguanida',
    mechanism: 'Reduz neoglicogênese hepática',
    anchorIndication: 'DM2 — 1ª linha sempre que possível',
    doseAnchor: '500 mg VO 12/12h, subir até 2 g/dia',
    redFlag: 'Acidose láctica (raro); suspender se ClCr < 30 ou em contraste iodado' },
  { id: 'liraglut', name: 'Liraglutida', classId: 'glp1',
    mechanism: 'Agonista GLP-1',
    anchorIndication: 'DM2 com obesidade, redução de eventos CV',
    doseAnchor: '0,6 → 1,8 mg SC 1×/dia',
    redFlag: 'Náusea, pancreatite (raro), contraindicado em CMT/MEN2' },
  { id: 'glibenc', name: 'Glibenclamida', classId: 'su',
    mechanism: 'Fecha canal de K-ATP nas células β',
    anchorIndication: 'DM2 quando metformina insuficiente',
    doseAnchor: '5 mg VO 1×/dia, até 20 mg',
    redFlag: 'Hipoglicemia (especialmente no idoso e renal crônico)' },
  { id: 'insreg', name: 'Insulina regular', classId: 'insulina',
    mechanism: 'Insulina humana de ação curta',
    anchorIndication: 'CAD, controle agudo, ajuste pré-prandial',
    doseAnchor: 'Bolus + BIC em CAD; SC pré-refeição',
    redFlag: 'Hipoglicemia, hipocalemia ao corrigir CAD' },
  { id: 'levotir', name: 'Levotiroxina', classId: 'levotir',
    mechanism: 'Reposição de T4',
    anchorIndication: 'Hipotireoidismo',
    doseAnchor: '1,6 µg/kg/dia VO em jejum',
    redFlag: 'Excesso → tireotoxicose iatrogênica; tomar em jejum, longe de cálcio/ferro' },

  // HIV / Antivirais
  { id: 'tdf', name: 'Tenofovir (TDF)', classId: 'itrn',
    mechanism: 'ITRN — análogo de nucleotídeo',
    anchorIndication: 'Backbone da TARV; PrEP/PEP',
    doseAnchor: '300 mg VO 1×/dia',
    redFlag: 'Nefrotoxicidade, perda de DMO' },
  { id: 'dtg', name: 'Dolutegravir', classId: 'iinst',
    mechanism: 'Inibidor da integrase',
    anchorIndication: 'TARV de 1ª linha (no Brasil)',
    doseAnchor: '50 mg VO 1×/dia',
    redFlag: 'Ganho de peso; interação com cátions (cálcio/ferro)' },
  { id: 'aciclo', name: 'Aciclovir', classId: 'aciclico',
    mechanism: 'Análogo de guanosina ativado por timidina-quinase viral',
    anchorIndication: 'HSV (encefalite, genital grave), VZV',
    doseAnchor: '10 mg/kg EV 8/8h em encefalite herpética',
    redFlag: 'Nefrotoxicidade por cristalúria — hidratar' },

  // Antifúngico / antiparasitário
  { id: 'fluco', name: 'Fluconazol', classId: 'azol',
    mechanism: 'Inibe 14α-demetilase',
    anchorIndication: 'Candidíase (oral, esofágica, vaginal), criptococose',
    doseAnchor: '150 mg VO dose única (vaginal); 400 mg/dia em meningite',
    redFlag: 'Hepatotoxicidade, QT longo' },
  { id: 'albend', name: 'Albendazol', classId: 'benzimi',
    mechanism: 'Inibe polimerização de β-tubulina',
    anchorIndication: 'Helmintos intestinais, neurocisticercose',
    doseAnchor: '400 mg VO dose única (geo-helminto)',
    redFlag: 'Hepatotoxicidade em uso prolongado' },

  // Reprodutor / oncologia
  { id: 'aco-le', name: 'Etinilestradiol + levonorgestrel', classId: 'aco',
    mechanism: 'Bloqueia eixo HHO + altera muco/endométrio',
    anchorIndication: 'Contracepção; controle de ciclo',
    doseAnchor: '30 µg + 150 µg VO 1×/dia',
    redFlag: 'Trombose (CI: tabagismo > 35a, enxaqueca com aura, TEV prévio)' },
  { id: 'tamoxif', name: 'Tamoxifeno', classId: 'tamox',
    mechanism: 'SERM — antagonista mamário, agonista endometrial',
    anchorIndication: 'CA de mama RH+ (pré-menopausa)',
    doseAnchor: '20 mg VO 1×/dia',
    redFlag: 'Risco de TEV e Ca de endométrio' },
];

// ============================================================
// CENÁRIOS — v1 (12, cobrindo os 8 sistemas)
// ============================================================

export const SCENARIOS: Scenario[] = [
  {
    id: 'cardio-has-dm-rim',
    system: 'cardio',
    vignette: 'Mulher 62a, HAS recém-diagnosticada, DM2, ClCr 38, sem edema.',
    question: '1ª escolha anti-hipertensiva?',
    correctClassId: 'ieca',
    classDistractors: ['bcc-dh', 'tiazid', 'bb'],
    correctDrugId: 'enalapril',
    drugDistractors: ['captopril', 'losartana'],
    teaching: 'IECA é 1ª linha em HAS + nefropatia diabética: protege o rim e o miocárdio. Tiazídico perderia eficácia com ClCr baixo; BCC seria 2ª opção.',
  },
  {
    id: 'cardio-ic-fe-reduzida',
    system: 'cardio',
    vignette: 'Homem 70a, IC com FE 28%, euvolêmico, FC 92, PA 118/72. Já está em IECA e furosemida.',
    question: 'Próximo fármaco a adicionar?',
    correctClassId: 'bb',
    classDistractors: ['bcc-ndh', 'pp-k', 'bcc-dh'],
    correctDrugId: 'carvedilol',
    drugDistractors: ['metoprolol', 'propranolol'],
    teaching: 'IC com FEr: IECA/BRA + BB com benefício de mortalidade (carvedilol, succinato de metoprolol ou bisoprolol). Iniciar SÓ se euvolêmico, dose baixa, titular a cada 2 sem.',
  },
  {
    id: 'cardio-fa-controle',
    system: 'cardio',
    vignette: 'Mulher 68a, FA permanente, FC em repouso 124, FE preservada. Sem IC descompensada.',
    question: 'Fármaco para controle de FC?',
    correctClassId: 'bcc-ndh',
    classDistractors: ['bcc-dh', 'bb', 'ieca'],
    correctDrugId: 'verapamil',
    drugDistractors: ['anlodipino', 'metoprolol'],
    teaching: 'BCC não di-hidropiridínicos (verapamil, diltiazem) controlam FC no nó AV. Em IC com FEr seriam CONTRAINDICADOS — aí o BB assume.',
  },
  {
    id: 'cardio-anticoag-fa',
    system: 'cardio',
    vignette: 'Mulher 74a, FA não valvar, CHA₂DS₂-VASc 4, função renal preservada, sem prótese.',
    question: 'Anticoagulante de escolha?',
    correctClassId: 'doac',
    classDistractors: ['avk', 'hbpm', 'pp-k'],
    correctDrugId: 'rivarox',
    drugDistractors: ['varfarina', 'enoxap'],
    teaching: 'DOAC é preferido em FA não valvar (menos AVC hemorrágico que varfarina, sem monitorização). Varfarina entra em estenose mitral ou prótese mecânica.',
  },
  {
    id: 'infecto-pneumonia-amb',
    system: 'infecto',
    vignette: 'Homem 35a, PAC ambulatorial sem comorbidades, sem critérios de gravidade.',
    question: 'Antibiótico de 1ª escolha?',
    correctClassId: 'betalact-pen',
    classDistractors: ['macrol', 'quinol', 'betalact-cef'],
    correctDrugId: 'amox',
    drugDistractors: ['ceftri', 'azitro'],
    teaching: 'PAC ambulatorial sem comorbidade: amoxicilina cobre pneumococo. Em alérgico, macrolídeo. Quinolona respiratória entra em outpatient com comorbidade.',
  },
  {
    id: 'infecto-meningite',
    system: 'infecto',
    vignette: 'Adulto 28a, meningite bacteriana com líquor turvo e Gram + diplococos.',
    question: 'Antibiótico empírico?',
    correctClassId: 'betalact-cef',
    classDistractors: ['betalact-pen', 'glicop', 'macrol'],
    correctDrugId: 'ceftri',
    drugDistractors: ['amox', 'vanco'],
    teaching: 'Empírico em meningite do adulto: ceftriaxona 2 g 12/12h (cobre pneumococo, meningococo). Adicionar vanco se suspeita de pneumo resistente; ampi se > 50a ou imunossupressão (Listeria).',
  },
  {
    id: 'infecto-mrsa',
    system: 'infecto',
    vignette: 'Paciente UTI com bacteremia, hemocultura positiva para S. aureus oxacilina-resistente (MRSA).',
    question: 'Antibiótico de escolha?',
    correctClassId: 'glicop',
    classDistractors: ['betalact-pen', 'aminog', 'macrol'],
    correctDrugId: 'vanco',
    drugDistractors: ['amox', 'gent'],
    teaching: 'MRSA não responde a β-lactâmicos. Vancomicina é o pilar; monitorar vale 15–20 µg/mL. Evitar infusão rápida (síndrome do homem vermelho).',
  },
  {
    id: 'endo-dm2-1linha',
    system: 'endo',
    vignette: 'Mulher 52a, DM2 nova, HbA1c 8,1%, IMC 31, sem nefropatia, sem IC.',
    question: '1ª linha farmacológica?',
    correctClassId: 'biguanida',
    classDistractors: ['su', 'glp1', 'isglt2'],
    correctDrugId: 'metformina',
    drugDistractors: ['glibenc', 'liraglut'],
    teaching: 'Metformina é 1ª linha em DM2 sempre que tolerada e ClCr ≥ 30. iSGLT2 e GLP-1 entram cedo se há DCV, IC ou DRC.',
  },
  {
    id: 'endo-dm2-ic',
    system: 'endo',
    vignette: 'Homem 65a, DM2 + IC com FE 35%, em metformina + IECA + BB.',
    question: 'Próxima classe a adicionar?',
    correctClassId: 'isglt2',
    classDistractors: ['su', 'dpp4', 'glp1'],
    correctDrugId: 'dapaglif',
    drugDistractors: ['glibenc', 'liraglut'],
    teaching: 'iSGLT2 reduz mortalidade e hospitalização em IC com FEr, independe da glicemia. Cuidar com cetoacidose euglicêmica.',
  },
  {
    id: 'antiviral-hiv-1linha',
    system: 'antiviral',
    vignette: 'Paciente recém-diagnosticado HIV, sem coinfecção tuberculosa, sem gestação, função renal normal.',
    question: 'TARV de 1ª linha no Brasil?',
    correctClassId: 'iinst',
    classDistractors: ['itrn', 'itrnn', 'aciclico'],
    correctDrugId: 'dtg',
    drugDistractors: ['tdf', 'aciclo'],
    teaching: 'Esquema preferencial é TDF + 3TC + DTG (dois ITRN + inibidor da integrase). Dolutegravir tem alta barreira genética e potência rápida.',
  },
  {
    id: 'antiparasit-helminto',
    system: 'antiparasitario',
    vignette: 'Criança 7a, dor abdominal e geo-helmintíase confirmada (Ascaris).',
    question: 'Medicamento de escolha?',
    correctClassId: 'benzimi',
    classDistractors: ['azol', 'macrol', 'quinol'],
    correctDrugId: 'albend',
    drugDistractors: ['fluco', 'azitro'],
    teaching: 'Benzimidazois (albendazol, mebendazol) são a 1ª linha para geo-helmintos. Albendazol 400 mg dose única resolve a maioria.',
  },
  {
    id: 'reprodutor-aco',
    system: 'reprodutor',
    vignette: 'Mulher 24a, saudável, não fumante, busca contracepção combinada oral.',
    question: 'O que prescrever?',
    correctClassId: 'aco',
    classDistractors: ['tamox', 'levotir', 'insulina'],
    correctDrugId: 'aco-le',
    drugDistractors: ['tamoxif', 'levotir'],
    teaching: 'ACO combinado de baixa dose (etinilestradiol + levonorgestrel) é o padrão. CI absolutas: tabagismo > 35a, enxaqueca com aura, TEV prévio, CA de mama.',
  },
];

// ============================================================
// HELPERS
// ============================================================

export function getDrug(id: string): Drug | undefined {
  return DRUGS.find((d) => d.id === id);
}

export function getClass(id: string): DrugClass | undefined {
  return CLASSES.find((c) => c.id === id);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickScenarios(system: FarmacoSystem | 'mix', count: number): Scenario[] {
  const pool = system === 'mix' ? SCENARIOS : SCENARIOS.filter((s) => s.system === system);
  return shuffle(pool).slice(0, count);
}

/** Prefixo único pros IDs do MDC dentro do SRS — evita colisão com flashcards. */
export function mdcCardId(scenarioId: string): string {
  return `mdc:${scenarioId}`;
}

/** Reverte mdcCardId pra obter o scenario id. */
export function mdcScenarioIdFromCard(cardId: string): string | null {
  return cardId.startsWith('mdc:') ? cardId.slice('mdc:'.length) : null;
}

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
