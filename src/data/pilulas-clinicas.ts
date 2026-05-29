// Micro-pílulas clínicas — uma frase concreta de farmaco odonto
// para acompanhar o bilhete. Princípio: spaced exposure passiva +
// reforço afetivo (o bilhete carinhoso "entrega" o conteúdo).

export interface PilulaClinica {
  id: string;
  /** Categoria para futura filtragem por curso/tópico */
  topic: string;
  /** A pílula em si — 1 frase, fato concreto, fácil de gravar */
  body: string;
  /** Mnemônico ou observação curta (opcional) */
  hint?: string;
}

export const PILULAS_CLINICAS: PilulaClinica[] = [
  {
    id: 'lido-dose',
    topic: 'Anestésicos locais',
    body: 'Lidocaína 2% c/ epi: 4,4 mg/kg, teto 300 mg. Tubete 1,8 mL = 36 mg.',
    hint: 'Adulto 60 kg → 8 tubetes máximo.',
  },
  {
    id: 'arti-dose',
    topic: 'Anestésicos locais',
    body: 'Articaína 4% c/ epi: 7 mg/kg, teto 500 mg. Tubete 1,8 mL = 72 mg.',
    hint: 'Excelente difusão óssea — preferir em infiltrativa.',
  },
  {
    id: 'arti-cri',
    topic: 'Anestésicos locais',
    body: 'Articaína 4%: contraindicada em criança <4 anos (bula brasileira).',
    hint: 'Usar lido 2% c/ epi 1:100.000 em pré-escolar.',
  },
  {
    id: 'epi-limite',
    topic: 'Vasoconstritor',
    body: 'Epinefrina 1:100.000 = 18 µg por tubete. Limite: 200 µg saudável, 40 µg cardiopata estável.',
    hint: '~11 tubetes em saudável, ~2 em cardiopata.',
  },
  {
    id: 'mepi3',
    topic: 'Anestésicos locais',
    body: 'Mepivacaína 3% SEM vaso: para cardiopata isquêmico recente e HAS descompensada.',
    hint: 'Duração curta (~20 min em mole) — replanejar para procedimento longo.',
  },
  {
    id: 'prilo-gest',
    topic: 'Anestésicos locais',
    body: 'Prilocaína 3% c/ felipressina: alternativa clássica em gestante.',
    hint: 'Cuidado com meta-hemoglobinemia em dose alta.',
  },
  {
    id: 'paracet-aine',
    topic: 'Analgésicos',
    body: 'Paracetamol NÃO é AINE — age na COX do SNC. Sem ação anti-inflamatória relevante.',
    hint: 'Ideal para gestante, úlcera, IRC.',
  },
  {
    id: 'dipi-ges',
    topic: 'Analgésicos',
    body: 'Dipirona 500-1000 mg 6/6h: permitida no 2º trim de gestação quando AINE está CI.',
    hint: 'Sem efeito antiplaquetário — não piora o sangramento do alvéolo.',
  },
  {
    id: 'codein-cri',
    topic: 'Analgésicos',
    body: 'Codeína: contraindicada em <12 anos (FDA). Metabolizador ultrarrápido CYP2D6 → depressão respiratória.',
    hint: 'Em ISRS, preferir codeína a tramadol (risco serotoninérgico).',
  },
  {
    id: 'cetoro-5d',
    topic: 'Anti-inflamatórios',
    body: 'Cetorolaco: AINE potente (≈ opioide leve em dor aguda). Máximo 5 dias por risco hemorrágico/renal.',
    hint: 'Evitar em risco de sangramento e gestante.',
  },
  {
    id: 'dexa-siso',
    topic: 'Anti-inflamatórios',
    body: 'Dexametasona 4-8 mg VO dose única 1h ANTES de exodontia de siso reduz edema e trismo.',
    hint: 'Bloqueia fosfolipase A2 (antes das PG).',
  },
  {
    id: 'amox-abscesso',
    topic: 'Antibióticos',
    body: 'Abscesso periapical leve-moderado: amoxicilina 500 mg 8/8h por 7 dias.',
    hint: 'ATB não substitui drenagem do foco.',
  },
  {
    id: 'clinda-alergia',
    topic: 'Antibióticos',
    body: 'Alérgico imediato à penicilina: clindamicina 300 mg 6/6h por 7d (ou 600 mg profilaxia EI).',
    hint: 'Sem reação cruzada com β-lactâmicos.',
  },
  {
    id: 'amox-clav-falha',
    topic: 'Antibióticos',
    body: 'Falha de amox em 72h → escalonar para amox+clav (875/125 mg 12/12h) ou adicionar metronidazol.',
    hint: 'Suspeitar de anaeróbio produtor de β-lactamase.',
  },
  {
    id: 'profilaxia-ei',
    topic: 'Antibióticos',
    body: 'Profilaxia endocardite: amoxicilina 2 g VO 30-60 min antes (criança 50 mg/kg, teto 2 g).',
    hint: 'Indicada em prótese valvar, EI prévia, cardiopatia cianótica não corrigida.',
  },
  {
    id: 'protese-ort',
    topic: 'Antibióticos',
    body: 'Prótese articular ortopédica: profilaxia ATB NÃO indicada de rotina (ADA/AAOS 2014).',
    hint: 'Exceções: imunossupressão, infecção peri-protética prévia.',
  },
  {
    id: 'aco-atb',
    topic: 'Antibióticos',
    body: 'Antibiótico odontológico de rotina NÃO derruba anticoncepcional oral. Só rifampicina/rifabutina têm evidência.',
    hint: 'Mito clínico repetido em bula.',
  },
  {
    id: 'midaz-cri',
    topic: 'Sedativos',
    body: 'Midazolam VO pediátrico: 0,5 mg/kg (teto 15 mg) 15-20 min antes. Antagonista: flumazenil.',
    hint: 'Sempre com oxímetro e jejum adequado.',
  },
  {
    id: 'lorazep-idoso',
    topic: 'Sedativos',
    body: 'Idoso e hepatopata: prefira lorazepam (BZD 3-OH, glicuronidação direta).',
    hint: 'Diazepam acumula via nordiazepam.',
  },
  {
    id: 'claritro-mid',
    topic: 'Sedativos',
    body: 'Claritromicina + midazolam = sedação prolongada (inibe CYP3A4). Adiar ou usar lorazepam.',
    hint: 'Mesma cilada com fluconazol e ritonavir.',
  },
  {
    id: 'n2o-obstr',
    topic: 'Sedativos',
    body: 'N2O contraindicado em obstrução nasal, otite recente, pneumotórax, 1º trim gestação.',
    hint: 'Sem nariz pérvio = sem N2O.',
  },
  {
    id: 'tranex-doac',
    topic: 'Hemostáticos',
    body: 'Paciente em DOAC + extração simples: MANTER o anticoagulante + bochecho de tranexâmico 4,8-5%.',
    hint: 'DOAC NÃO se monitora por INR.',
  },
  {
    id: 'gelatina-vs-celu',
    topic: 'Hemostáticos',
    body: 'Gelatina = mecânica passiva, pH neutro (perto de nervo OK). Celulose oxidada = ácida, neurotóxica.',
    hint: 'Gelatina é o curinga seguro.',
  },
  {
    id: 'mronj-vo',
    topic: 'Cirurgia',
    body: 'Bifosfonato oral >4 anos + exodontia: discutir drug holiday de ~2 meses com o médico.',
    hint: 'Risco baixo (<1%) mas real. Sutura primária + ATB profilática.',
  },
  {
    id: 'glibenc-aine',
    topic: 'Interações',
    body: 'Idoso em glibenclamida + AINE = risco de hipoglicemia (deslocamento da albumina).',
    hint: 'Preferir paracetamol ou dipirona.',
  },
];

export function pickPilulaForBucket(bucketIdx: number): PilulaClinica {
  return PILULAS_CLINICAS[bucketIdx % PILULAS_CLINICAS.length];
}
