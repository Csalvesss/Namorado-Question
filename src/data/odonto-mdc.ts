// Mapa de Decisão Clínica — versão ODONTO.
// Mesma estrutura do farmaco-mdc.ts (medicina) mas com classes,
// fármacos e cenários do consultório odontológico.

export type OdontoSystem =
  | 'anestesico'
  | 'antiinflamatorio'
  | 'analgesico'
  | 'antibiotico'
  | 'sedativo'
  | 'hemostatico';

export const ODONTO_SYSTEM_LABEL: Record<OdontoSystem, string> = {
  anestesico: 'Anestésicos locais',
  antiinflamatorio: 'Anti-inflamatórios',
  analgesico: 'Analgésicos',
  antibiotico: 'Antibióticos',
  sedativo: 'Sedativos',
  hemostatico: 'Hemostáticos',
};

export interface OdontoDrugClass {
  id: string;
  name: string;
  system: OdontoSystem;
  short: string;
}

export interface OdontoDrug {
  id: string;
  name: string;
  classId: string;
  mechanism: string;
  anchorIndication: string;
  doseAnchor: string;
  redFlag: string;
  mnemonic?: string;
}

export interface OdontoScenario {
  id: string;
  system: OdontoSystem;
  vignette: string;
  question: string;
  correctClassId: string;
  classDistractors: string[]; // 3 IDs de classe (com a correta vira 4 opções)
  correctDrugId: string;
  drugDistractors: string[]; // fallback se classe tiver poucos drugs
  teaching: string;
}

// ============================================================
// CLASSES
// ============================================================

export const ODONTO_CLASSES: OdontoDrugClass[] = [
  // Anestésicos
  {
    id: 'al-amida-curta',
    name: 'AL amida de curta duração',
    system: 'anestesico',
    short: 'lidocaína, mepivacaína — bloqueio Na⁺',
  },
  {
    id: 'al-amida-difusao',
    name: 'AL amida de alta difusão',
    system: 'anestesico',
    short: 'articaína — penetra melhor o osso',
  },
  {
    id: 'al-sem-vaso',
    name: 'AL sem vasoconstritor',
    system: 'anestesico',
    short: 'mepi 3% — pra cardiopata',
  },
  {
    id: 'al-felipressina',
    name: 'AL com felipressina',
    system: 'anestesico',
    short: 'prilo 3% — pra gestante',
  },
  {
    id: 'al-longa',
    name: 'AL de longa duração',
    system: 'anestesico',
    short: 'bupi 0,5% — pós-op de cirurgia',
  },

  // Anti-inflamatórios
  { id: 'aine-naoselet', name: 'AINE não seletivo', system: 'antiinflamatorio', short: 'COX-1 e COX-2' },
  { id: 'aine-cox2', name: 'AINE preferencial COX-2', system: 'antiinflamatorio', short: 'menor lesão GI' },
  { id: 'aine-potente', name: 'AINE de alta potência', system: 'antiinflamatorio', short: 'cetorolaco — dor intensa' },
  { id: 'corticoide', name: 'Corticoide', system: 'antiinflamatorio', short: 'inibe fosfolipase A2' },

  // Analgésicos
  { id: 'analg-central', name: 'Analgésico central', system: 'analgesico', short: 'paracetamol — COX no SNC' },
  { id: 'analg-pirazol', name: 'Analgésico pirazolônico', system: 'analgesico', short: 'dipirona' },
  { id: 'opioide-leve', name: 'Opioide leve', system: 'analgesico', short: 'codeína, tramadol' },

  // Antibióticos
  { id: 'penicilina', name: 'Penicilina', system: 'antibiotico', short: 'inibe PBP (parede)' },
  { id: 'amox-clav', name: 'Amox + clavulanato', system: 'antibiotico', short: 'cobre β-lactamases' },
  { id: 'cefalosporina', name: 'Cefalosporina', system: 'antibiotico', short: 'β-lactâmico, geração varia' },
  { id: 'lincosamida', name: 'Lincosamida', system: 'antibiotico', short: 'clindamicina — alérgico a pen' },
  { id: 'macrolideo', name: 'Macrolídeo', system: 'antibiotico', short: 'azitro, claritro — 50S' },
  { id: 'nitroimi', name: 'Nitroimidazólico', system: 'antibiotico', short: 'metronidazol — anaeróbios' },

  // Sedativos
  { id: 'bzd-curta', name: 'BZD de início rápido', system: 'sedativo', short: 'midazolam — pré-medicação' },
  { id: 'bzd-3oh', name: 'BZD 3-OH (conjugação direta)', system: 'sedativo', short: 'lorazepam — idoso/hepatopata' },
  { id: 'bzd-longa', name: 'BZD de longa duração', system: 'sedativo', short: 'diazepam — trismo/ATM' },
  { id: 'sed-inalatorio', name: 'Sedativo inalatório', system: 'sedativo', short: 'óxido nitroso — recuperação rápida' },

  // Hemostáticos
  { id: 'antifibrinolitico', name: 'Antifibrinolítico', system: 'hemostatico', short: 'ác. tranexâmico — preserva coágulo' },
  { id: 'hemost-local', name: 'Hemostático local', system: 'hemostatico', short: 'gelatina, celulose oxidada' },
  { id: 'vit-k', name: 'Vitamina K', system: 'hemostatico', short: 'fitomenadiona — reverte cumarínico' },
];

// ============================================================
// DRUGS
// ============================================================

export const ODONTO_DRUGS: OdontoDrug[] = [
  // AL amida curta
  {
    id: 'lido2',
    name: 'Lidocaína 2% c/ epi',
    classId: 'al-amida-curta',
    mechanism: 'Amida, bloqueio Na⁺',
    anchorIndication: 'Padrão pra infiltração e bloqueio do alveolar inferior',
    doseAnchor: '4,4 mg/kg, teto 300 mg adulto (8 tubetes em 60 kg)',
    redFlag: 'Tosse seca, parestesia rara em bloqueio mandibular',
    mnemonic: 'tubete 1,8 mL = 36 mg',
  },
  {
    id: 'mepi2',
    name: 'Mepivacaína 2% c/ epi',
    classId: 'al-amida-curta',
    mechanism: 'Amida — início rápido, sem vasodilatação intrínseca',
    anchorIndication: 'Pulpar curta, infiltração',
    doseAnchor: '4,4 mg/kg, teto 300 mg',
    redFlag: 'Mesma janela da lido',
  },

  // AL articaína
  {
    id: 'arti4',
    name: 'Articaína 4% c/ epi',
    classId: 'al-amida-difusao',
    mechanism: 'Amida atípica c/ grupo éster → 90% metabolizada por esterase plasmática',
    anchorIndication: 'Infiltrativa em molar inferior (excelente difusão óssea)',
    doseAnchor: '7 mg/kg, teto 500 mg. Tubete 1,8 mL = 72 mg',
    redFlag: 'Risco aumentado de parestesia em bloqueio mandibular — preferir infiltrativa',
    mnemonic: 'articaína — Atravessa o osso',
  },

  // AL sem vaso
  {
    id: 'mepi3',
    name: 'Mepivacaína 3% SEM vaso',
    classId: 'al-sem-vaso',
    mechanism: 'Amida sem vasoconstritor — duração ~20 min em tecido mole',
    anchorIndication: 'Cardiopata isquêmico recente, hipertenso descompensado, hipertireoideo',
    doseAnchor: '4,4 mg/kg, teto 300 mg. Tubete 1,8 mL = 54 mg',
    redFlag: 'Curta duração — replanejar pra procedimento longo',
  },

  // AL felipressina
  {
    id: 'prilo3',
    name: 'Prilocaína 3% c/ felipressina',
    classId: 'al-felipressina',
    mechanism: 'Amida + felipressina (sem efeito uterotônico)',
    anchorIndication: 'Gestante, situações em que vasoconstritor adrenérgico é evitado',
    doseAnchor: '6 mg/kg, teto 400 mg',
    redFlag: 'Meta-hemoglobinemia em dose alta (>600 mg) ou em G6PD',
  },

  // AL longa
  {
    id: 'bupi05',
    name: 'Bupivacaína 0,5% c/ epi',
    classId: 'al-longa',
    mechanism: 'Amida de alta lipossolubilidade — longa duração',
    anchorIndication: 'Pós-op de siso, implante, cirurgia periodontal (analgesia pulpar 6-8h)',
    doseAnchor: '1,3 mg/kg, teto 90 mg (5 tubetes em 70 kg)',
    redFlag: 'Cardiotoxicidade grave em sobredose — respeitar teto',
  },

  // AINEs
  {
    id: 'ibuprofeno',
    name: 'Ibuprofeno',
    classId: 'aine-naoselet',
    mechanism: 'Inibe COX-1 e COX-2 reversível',
    anchorIndication: 'Dor e edema pós-op leves a moderados (ex: extração simples)',
    doseAnchor: '400-600 mg VO 8/8h por 3-5 dias, máx 2,4 g/dia',
    redFlag: 'Úlcera, IRC, gestante 3ºT, ICC descompensada — evitar',
  },
  {
    id: 'diclofenaco-k',
    name: 'Diclofenaco potássico',
    classId: 'aine-naoselet',
    mechanism: 'AINE com leve preferência COX-2, início rápido',
    anchorIndication: 'Dor moderada a intensa pós-cirurgia oral',
    doseAnchor: '50 mg VO 8/8h por 3-5 dias',
    redFlag: 'Cardiovascular (trombose/IAM em uso prolongado), GI',
  },
  {
    id: 'nimesulida',
    name: 'Nimesulida',
    classId: 'aine-cox2',
    mechanism: 'Preferencial COX-2, menor lesão gástrica',
    anchorIndication: 'Inflamação pós-op em paciente sensível ao GI',
    doseAnchor: '100 mg VO 12/12h, máx 7-10 dias',
    redFlag: 'Hepatotoxicidade — evitar uso prolongado',
  },
  {
    id: 'cetorolaco',
    name: 'Cetorolaco trometamol',
    classId: 'aine-potente',
    mechanism: 'AINE não seletivo de alta potência analgésica (≈ opioide leve)',
    anchorIndication: 'Dor intensa aguda — cirurgia de siso complexa',
    doseAnchor: '10 mg VO 6/6h, máx 5 dias',
    redFlag: 'Sangramento e nefrotoxicidade — NÃO usar em risco hemorrágico ou gestante',
  },

  // Corticoide
  {
    id: 'dexa',
    name: 'Dexametasona',
    classId: 'corticoide',
    mechanism: 'Inibe fosfolipase A2 — bloqueia AA antes das PG',
    anchorIndication: 'Pré-op pra reduzir edema e trismo em siso incluso',
    doseAnchor: '4-8 mg VO/IM dose única, 1h antes',
    redFlag: 'Hiperglicemia em diabético; CI relativa em úlcera ativa',
  },

  // Analgésicos
  {
    id: 'paracet',
    name: 'Paracetamol',
    classId: 'analg-central',
    mechanism: 'Inibe COX no SNC (não é AINE)',
    anchorIndication: 'Dor leve, paciente com CI a AINE (gestante, úlcera, IRC)',
    doseAnchor: '750-1000 mg VO 6/6h, máx 4 g/dia (3 g em hepatopata)',
    redFlag: 'Hepatotoxicidade em sobredose via NAPQI',
  },
  {
    id: 'dipirona',
    name: 'Dipirona',
    classId: 'analg-pirazol',
    mechanism: 'Pirazolônico — analgesia e antipirexia, sem efeito antiplaquetário',
    anchorIndication: 'Dor moderada pós-extração, especialmente em gestante 2ºT',
    doseAnchor: '500-1000 mg VO 6/6h, máx 4 g/dia',
    redFlag: 'Agranulocitose idiossincrásica (raríssima); hipotensão em IV rápida',
  },
  {
    id: 'codeina',
    name: 'Codeína (ou paracetamol+codeína)',
    classId: 'opioide-leve',
    mechanism: 'Pró-fármaco → morfina via CYP2D6',
    anchorIndication: 'Dor moderada-intensa que não responde a AINE+paracetamol',
    doseAnchor: '30 mg VO 4-6/6h (ou paracetamol 500 + codeína 30)',
    redFlag: 'CI em <12 anos (FDA): metabolizadores ultrarrápidos → depressão respiratória',
  },

  // Antibióticos
  {
    id: 'amox',
    name: 'Amoxicilina',
    classId: 'penicilina',
    mechanism: 'Inibe PBP (síntese de parede)',
    anchorIndication: 'Infecção odontogênica leve-moderada, profilaxia de endocardite',
    doseAnchor: '500 mg VO 8/8h por 7d (50 mg/kg em criança). Profilaxia: 2 g dose única',
    redFlag: 'Alergia, rash com EBV',
  },
  {
    id: 'amox-clav-d',
    name: 'Amoxicilina + clavulanato',
    classId: 'amox-clav',
    mechanism: 'β-lactâmico + inibidor de β-lactamase',
    anchorIndication: 'Infecção grave, falha de amox em 72h, imunossupressão',
    doseAnchor: '875/125 mg VO 12/12h por 7d',
    redFlag: 'Diarreia (clavulanato), hepatotoxicidade',
  },
  {
    id: 'cefalex',
    name: 'Cefalexina',
    classId: 'cefalosporina',
    mechanism: '1ª geração — cobertura Gram+',
    anchorIndication: 'Profilaxia endocardite em alérgico TARDIO a pen, infecção pele/anexos',
    doseAnchor: '2 g VO dose única (profilaxia); 500 mg 6/6h por 7d',
    redFlag: 'Alergia cruzada com pen ~1% — evitar em alergia IMEDIATA',
  },
  {
    id: 'clinda',
    name: 'Clindamicina',
    classId: 'lincosamida',
    mechanism: 'Inibe 50S — cobre Gram+ e anaeróbios orais',
    anchorIndication: 'Infecção odontogênica em alérgico imediato à penicilina; profilaxia EI',
    doseAnchor: '300 mg VO 6/6h por 7d. Profilaxia: 600 mg dose única',
    redFlag: 'Colite por C. difficile (sinal: diarreia profusa após início)',
  },
  {
    id: 'azitro',
    name: 'Azitromicina',
    classId: 'macrolideo',
    mechanism: 'Inibe 50S, meia-vida longa',
    anchorIndication: 'Alternativa em alérgico, profilaxia de endocardite (500 mg)',
    doseAnchor: '500 mg VO 1×/dia × 3-5 dias',
    redFlag: 'Prolongamento de QT',
  },
  {
    id: 'metro',
    name: 'Metronidazol',
    classId: 'nitroimi',
    mechanism: 'Geração de radicais que lesam DNA bacteriano (anaeróbios)',
    anchorIndication: 'Associado à amox em periodontite agressiva (esquema clássico)',
    doseAnchor: '400 mg VO 8/8h por 7d',
    redFlag: 'Efeito antabuse com álcool, gosto metálico, evitar em hepatopata',
  },

  // Sedativos
  {
    id: 'midazolam',
    name: 'Midazolam',
    classId: 'bzd-curta',
    mechanism: 'BZD imidazo (GABA-A), início 30-60 min VO, metab CYP3A4',
    anchorIndication: 'Pré-medicação ansiolítica em adulto e criança',
    doseAnchor: 'Adulto 7,5-15 mg VO 30-60 min antes; criança 0,3-0,5 mg/kg',
    redFlag: 'Interação com claritromicina/fluconazol (↑níveis). Antagonista: flumazenil',
  },
  {
    id: 'lorazepam',
    name: 'Lorazepam',
    classId: 'bzd-3oh',
    mechanism: 'BZD 3-OH — conjugação direta, sem fase oxidativa',
    anchorIndication: 'Idoso, hepatopata — efeito previsível, sem metabólito ativo',
    doseAnchor: '1-2 mg VO 1-2h antes',
    redFlag: 'Início lento (~2h) — não usar pra procedimento de última hora',
  },
  {
    id: 'diazepam',
    name: 'Diazepam',
    classId: 'bzd-longa',
    mechanism: 'BZD clássico, metabólito ativo (nordiazepam) com meia-vida longa',
    anchorIndication: 'Trismo, disfunção da ATM, ansiedade prolongada',
    doseAnchor: '5-10 mg VO 1h antes',
    redFlag: 'Acumulação em idoso (sedação prolongada — preferir lorazepam)',
  },
  {
    id: 'n2o',
    name: 'Óxido nitroso',
    classId: 'sed-inalatorio',
    mechanism: 'Inalatório (NMDA), início 2-5 min, recuperação ≤15 min',
    anchorIndication: 'Ansiedade em procedimentos curtos, paciente cooperativo',
    doseAnchor: 'Titulação 30-50% N₂O / O₂',
    redFlag: 'CI em obstrução nasal, pneumotórax, cirurgia oftalmo recente',
  },

  // Hemostáticos
  {
    id: 'tranex',
    name: 'Ácido tranexâmico (bochecho)',
    classId: 'antifibrinolitico',
    mechanism: 'Inibe conversão de plasminogênio em plasmina (preserva coágulo)',
    anchorIndication: 'Paciente anticoagulado (varfarina/DOAC), pós-extração',
    doseAnchor: 'Solução 4,8-5% (250 mg/5 mL), 5 mL bochecho por 2 min, 4×/dia por 2d',
    redFlag: 'CI em trombose ativa ou hipersensibilidade',
  },
  {
    id: 'gelatina',
    name: 'Esponja de gelatina hemostática',
    classId: 'hemost-local',
    mechanism: 'Matriz porosa retém coágulo + favorece agregação plaquetária',
    anchorIndication: 'Padrão local pós-extração em anticoagulado',
    doseAnchor: 'Aplicar no alvéolo + sutura + compressão 30 min',
    redFlag: 'Reabsorvida em 4-6 semanas — não precisa remover',
  },
  {
    id: 'fitomena',
    name: 'Vitamina K (fitomenadiona)',
    classId: 'vit-k',
    mechanism: 'Cofator da carboxilação dos fatores II, VII, IX, X',
    anchorIndication: 'Reversão de varfarina com INR muito alto + sangramento — sempre com médico',
    doseAnchor: '1-5 mg VO (lento); IV se sangramento grave',
    redFlag: 'Não usar de rotina em odonto; ação efetiva em 6-24h (não é imediata)',
  },
];

// ============================================================
// SCENARIOS — v1 (10 casos cobrindo os 6 sistemas)
// ============================================================

export const ODONTO_SCENARIOS: OdontoScenario[] = [
  {
    id: 'anest-hipertenso',
    system: 'anestesico',
    vignette:
      'Homem 62a, hipertenso descompensado (PA 178/102 hoje), IAM há 4 meses. Precisa extração de molar superior.',
    question: 'Qual anestésico local você escolhe?',
    correctClassId: 'al-sem-vaso',
    classDistractors: ['al-amida-curta', 'al-amida-difusao', 'al-felipressina'],
    correctDrugId: 'mepi3',
    drugDistractors: ['lido2', 'arti4'],
    teaching:
      'Em cardiopata isquêmico recente (<6m) ou HAS descompensada: AL SEM vasoconstritor. Mepivacaína 3% é a clássica. Duração curta (~20 min) — replanejar pra procedimento longo.',
  },
  {
    id: 'anest-bloqueio',
    system: 'anestesico',
    vignette:
      'Mulher 35a, saudável, vai fazer exodontia do 46 (molar inferior). Sem alergia. Cortical óssea espessa.',
    question: 'Anestésico e técnica de escolha?',
    correctClassId: 'al-amida-curta',
    classDistractors: ['al-amida-difusao', 'al-sem-vaso', 'al-longa'],
    correctDrugId: 'lido2',
    drugDistractors: ['mepi2', 'arti4'],
    teaching:
      'Bloqueio do alveolar inferior (técnica de Halsted) com lidocaína 2% c/ epi. Articaína em bloqueio mandibular tem risco aumentado de parestesia — preferir lido pra essa técnica. Articaína fica reservada pra infiltrativa.',
  },
  {
    id: 'anest-gestante',
    system: 'anestesico',
    vignette: 'Gestante 24 semanas, hígida, dor por cárie profunda em 24 (necessita restauração).',
    question: 'Anestésico de escolha?',
    correctClassId: 'al-felipressina',
    classDistractors: ['al-amida-curta', 'al-sem-vaso', 'al-longa'],
    correctDrugId: 'prilo3',
    drugDistractors: ['mepi3', 'lido2'],
    teaching:
      'Prilocaína 3% c/ felipressina é a tradicional na gestante porque a felipressina não causa contração uterina nas doses clínicas. Lido c/ epi também é segura — opção do clínico. Atenção: dose alta de prilo → meta-hemoglobinemia.',
  },
  {
    id: 'aine-pos-siso',
    system: 'antiinflamatorio',
    vignette:
      'Adulto 28a, hígido, pós-exodontia complexa do siso (38 incluso). Dor moderada esperada, edema importante.',
    question: 'Esquema pra prevenir edema/trismo?',
    correctClassId: 'corticoide',
    classDistractors: ['aine-naoselet', 'aine-cox2', 'aine-potente'],
    correctDrugId: 'dexa',
    drugDistractors: ['ibuprofeno', 'nimesulida'],
    teaching:
      'Dexametasona 4-8 mg VO dose única 1h ANTES da cirurgia: inibe fosfolipase A2 (bloqueia AA antes das PG) → reduz edema e trismo significativamente. AINE entra DEPOIS pra dor. Cuidar em diabético.',
  },
  {
    id: 'analg-gestante',
    system: 'analgesico',
    vignette: 'Gestante 22 semanas, 65 kg, pós-exodontia de 46 com dor moderada. AINE contraindicado.',
    question: 'Analgésico de escolha?',
    correctClassId: 'analg-pirazol',
    classDistractors: ['analg-central', 'opioide-leve', 'aine-naoselet'],
    correctDrugId: 'dipirona',
    drugDistractors: ['paracet', 'codeina'],
    teaching:
      'Dipirona 500-1000 mg VO 6/6h é permitida no 2ºT e tem ação analgésica superior ao paracetamol (sem efeito antiplaquetário no alvéolo). Paracetamol é alternativa mais fraca. Codeína cai em CYP2D6 + risco de depressão respiratória neonatal.',
  },
  {
    id: 'atb-abscesso',
    system: 'antibiotico',
    vignette: 'Adulto 70 kg, abscesso periapical com celulite leve em molar superior. Sem alergia.',
    question: 'Antibiótico de escolha?',
    correctClassId: 'penicilina',
    classDistractors: ['lincosamida', 'macrolideo', 'cefalosporina'],
    correctDrugId: 'amox',
    drugDistractors: ['amox-clav-d', 'cefalex'],
    teaching:
      'Infecção odontogênica leve-moderada em paciente sem alergia: amoxicilina 500 mg 8/8h por 7d. SEMPRE associada a remoção da causa (drenagem, endo ou exodontia). Antibiótico isolado não resolve.',
  },
  {
    id: 'atb-alergico',
    system: 'antibiotico',
    vignette:
      'Paciente com história de urticária generalizada com penicilina (reação imediata). Abscesso periapical, indicação de antibiótico.',
    question: 'Antibiótico de escolha?',
    correctClassId: 'lincosamida',
    classDistractors: ['penicilina', 'amox-clav', 'cefalosporina'],
    correctDrugId: 'clinda',
    drugDistractors: ['amox', 'cefalex'],
    teaching:
      'Alergia IMEDIATA à penicilina (urticária, anafilaxia): clindamicina 300 mg VO 6/6h por 7d. Cefalexina tem ~1-3% de reação cruzada — evitar em alergia imediata. Azitromicina 500 mg é alternativa.',
  },
  {
    id: 'atb-perio',
    system: 'antibiotico',
    vignette: 'Periodontite agressiva localizada com Aggregatibacter actinomycetemcomitans documentado.',
    question: 'Esquema farmacológico (após raspagem)?',
    correctClassId: 'nitroimi',
    classDistractors: ['penicilina', 'macrolideo', 'lincosamida'],
    correctDrugId: 'metro',
    drugDistractors: ['amox', 'azitro'],
    teaching:
      'Esquema clássico em periodontite agressiva: amoxicilina 500 mg + metronidazol 400 mg, ambos 8/8h por 7d, sempre após raspagem subgengival. Metro cobre anaeróbios estritos (Bacteroides, Prevotella) complementando o espectro da amox.',
  },
  {
    id: 'sed-idoso',
    system: 'sedativo',
    vignette: 'Idoso 78a com hepatopatia leve, ansioso, vai fazer extração simples.',
    question: 'Sedativo de escolha pré-procedimento?',
    correctClassId: 'bzd-3oh',
    classDistractors: ['bzd-curta', 'bzd-longa', 'sed-inalatorio'],
    correctDrugId: 'lorazepam',
    drugDistractors: ['midazolam', 'diazepam'],
    teaching:
      'Lorazepam é BZD 3-OH: conjugação direta hepática (glicuronidação), sem metabólitos ativos — efeito previsível em idoso e hepatopata. Diazepam tem nordiazepam com meia-vida 50-100h → acumulação no idoso. Midazolam exige cuidado se houver inibidor de CYP3A4.',
  },
  {
    id: 'hemo-varfarina',
    system: 'hemostatico',
    vignette: 'Paciente em uso crônico de varfarina, INR 2,5 (dentro da faixa), vai fazer extração simples.',
    question: 'Conduta hemostática local de escolha?',
    correctClassId: 'antifibrinolitico',
    classDistractors: ['hemost-local', 'vit-k', 'corticoide'],
    correctDrugId: 'tranex',
    drugDistractors: ['gelatina', 'fitomena'],
    teaching:
      'MANTER varfarina se INR estável (<3,5). Extração com técnica atraumática + sutura + gelatina + BOCHECHO de ácido tranexâmico 4,8-5%, 4×/dia por 2 dias. Suspender varfarina não é recomendado — risco trombótico > hemorrágico. Vit K só pra reversão emergencial.',
  },
];

// ============================================================
// HELPERS (mesma interface do farmaco-mdc.ts)
// ============================================================

export function getOdontoDrug(id: string): OdontoDrug | undefined {
  return ODONTO_DRUGS.find((d) => d.id === id);
}

export function getOdontoClass(id: string): OdontoDrugClass | undefined {
  return ODONTO_CLASSES.find((c) => c.id === id);
}

export function shuffleOdonto<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickOdontoScenarios(
  system: OdontoSystem | 'mix',
  count: number,
): OdontoScenario[] {
  const pool =
    system === 'mix' ? ODONTO_SCENARIOS : ODONTO_SCENARIOS.filter((s) => s.system === system);
  return shuffleOdonto(pool).slice(0, count);
}

/** Prefixo único pros IDs do MDC odonto dentro do SRS — evita colisão. */
export function odontoMdcCardId(scenarioId: string): string {
  return `mdc-odonto:${scenarioId}`;
}

export function getOdontoScenario(id: string): OdontoScenario | undefined {
  return ODONTO_SCENARIOS.find((s) => s.id === id);
}

export function pickSameClassOdontoDrugs(correctDrugId: string, count: number): OdontoDrug[] {
  const correct = ODONTO_DRUGS.find((d) => d.id === correctDrugId);
  if (!correct) return [];
  const pool = ODONTO_DRUGS.filter(
    (d) => d.classId === correct.classId && d.id !== correctDrugId,
  );
  return shuffleOdonto(pool).slice(0, count);
}
