// Blueprints sao resumos rapidos de 5-7 bullets por topico.
// Para usar antes da prova, como "passa-facil" do tema, nao substituem o material.
// Sao indexados por (titulo do curso + topico), para facilitar manutencao.

export interface TopicBlueprint {
  courseTitle: string;
  topic: string;
  bullets: string[];
  redFlag?: string;
  pearl?: string;
}

export const BLUEPRINTS: TopicBlueprint[] = [
  {
    courseTitle: 'HIV / AIDS',
    topic: 'Diagnóstico',
    bullets: [
      'Triagem inicial: imunoensaio de 4ª geração (Ag p24 + Ac), janela ~15 dias.',
      'Teste rápido com 2 marcas diferentes confirma diagnóstico em PS.',
      'Carga viral é obrigatória no diagnóstico e a cada 6 meses no seguimento.',
      'CD4 < 200 cels/μL define AIDS independente de doença oportunista.',
      'Profilaxia pré-exposição (PrEP): tenofovir + emtricitabina diária.',
    ],
    redFlag: 'Soroconversão (febre + faringite + linfonodomegalia) entra em DD com mononucleose.',
    pearl: 'Em criança < 18 meses, sorologia não vale (anticorpo materno) — pedir PCR.',
  },
  {
    courseTitle: 'HIV / AIDS',
    topic: 'TARV',
    bullets: [
      'Esquema preferencial atual: TDF + 3TC + DTG (1 cp ao dia).',
      'Iniciar o quanto antes, independente do CD4 (estudo START 2015).',
      'Resistência primária: pedir genotipagem antes de iniciar se vier de outra cidade/país.',
      'Falha virológica = carga > 50 cópias após 6 meses de TARV adequada.',
      'Síndrome de reconstituição imune (IRIS): piora paradoxal nas primeiras semanas.',
    ],
    redFlag: 'Dolutegravir + carbamazepina/rifampicina perde nível sérico — ajustar dose ou trocar.',
    pearl: 'A meta da TARV não é curar (não cura), é carga indetectável → intransmissível (U=U).',
  },
  {
    courseTitle: 'Insuficiência Cardíaca',
    topic: 'Diagnóstico',
    bullets: [
      'Quadro: dispneia aos esforços, ortopneia, edema vespertino, fadiga.',
      'Critérios de Framingham (2 maiores ou 1 maior + 2 menores).',
      'BNP > 100 pg/mL e NT-proBNP > 300 sugerem IC; valores baixos descartam.',
      'Eco é exame chave: define FE (preservada > 50, reduzida < 40, intermediária 40-49).',
      'Classificação funcional NYHA I-IV pelo sintoma; estágio A-D pelo dano estrutural.',
    ],
    redFlag: 'IC com sopro novo + febre = endocardite até prova contrária.',
    pearl: 'Em paciente jovem, IC + ECG com QRS alargado = pensar em miocardiopatia genética.',
  },
  {
    courseTitle: 'Insuficiência Cardíaca',
    topic: 'Tratamento',
    bullets: [
      'IC com FE reduzida: pilares são BB + IECA/BRA-i (sacubitril/valsartana) + espironolactona + iSGLT2.',
      'Diuréticos (furosemida) tratam congestão, NÃO mudam mortalidade.',
      'IC com FE preservada: tratar comorbidades (HAS, FA, obesidade); iSGLT2 também tem benefício.',
      'Reabilitação cardíaca é classe I; dieta hipossódica < 2g/dia.',
      'CDI em FE ≤ 35% após 3 meses de terapia otimizada e expectativa > 1 ano.',
    ],
    redFlag: 'IC descompensada com hipotensão e oligúria = choque cardiogênico, NÃO usar BB agudamente.',
    pearl: 'Cuidado com a "polifarmácia inteligente": começar com 4 drogas em doses baixas é melhor do que 1 em dose alta.',
  },
  {
    courseTitle: 'Meningites',
    topic: 'Conduta inicial',
    bullets: [
      'Tríade clássica (febre + cefaleia + rigidez de nuca) só em ~45% dos casos.',
      'TC de crânio antes da punção se: imunossuprimido, sinal focal, papiledema, convulsão, Glasgow rebaixado.',
      'Antibiótico empírico em até 1h: ceftriaxona ± vancomicina ± ampicilina (idoso/imunossuprimido).',
      'Corticoide (dexa) ANTES ou JUNTO com 1ª dose ATB se pneumococo provável.',
      'Notificação compulsória imediata em qualquer suspeita.',
    ],
    redFlag: 'Lesão purpúrica que não some à digitopressão = meningococcemia, profilaxia para contatos.',
    pearl: 'LCR turvo + neutrófilos + glicose baixa = bacteriana; LCR claro + linfócitos + glicose normal = viral.',
  },
  {
    courseTitle: 'Hipertensão Arterial',
    topic: 'Diagnóstico e classificação',
    bullets: [
      'Diagnóstico: PA ≥ 140x90 em consultório (2 medidas, 2 visitas) ou MAPA/MRPA.',
      'Estágio 1: 140-159 / 90-99 · Estágio 2: ≥ 160 / 100.',
      'PA ≥ 180/110 com sintoma de órgão-alvo = emergência hipertensiva, internar.',
      'Investigar causa secundária se: jovem < 30a, refratária a 3 drogas, HipoK, sopro abdominal.',
      'Risco cardiovascular global guia agressividade do tratamento.',
    ],
    redFlag: 'PA muito alta + dor lombar súbita + assimetria de pulsos = dissecção de aorta.',
    pearl: 'Hipertensão do "jaleco branco" e mascarada são reais — MAPA é o padrão-ouro.',
  },
  {
    courseTitle: 'Hipertensão Arterial',
    topic: 'Tratamento',
    bullets: [
      'Início duplo (combinação fixa) em todo paciente estágio 2 ou alto risco.',
      'Pilares: IECA/BRA + diurético tiazídico + bloqueador de canal de cálcio.',
      'Idoso: começar com BCC ou tiazídico; evitar BB como 1ª linha.',
      'Gestante: metildopa, nifedipina, hidralazina (NUNCA IECA/BRA).',
      'Meta usual: < 130x80 mmHg em diabético, idoso frágil aceita até 140x90.',
    ],
    redFlag: 'IECA + espironolactona em paciente com clearance baixo = hipercalemia grave.',
    pearl: 'Adesão é metade da batalha — combinações fixas em 1 cp aumentam adesão em ~30%.',
  },
  {
    courseTitle: 'Dengue',
    topic: 'Classificação e manejo',
    bullets: [
      'Suspeita: febre + 2 (mialgia, cefaleia, dor retro-orbital, exantema, leucopenia) em área endêmica.',
      'Sinais de alarme: dor abdominal intensa, vômitos persistentes, sangramento, letargia, hepatomegalia > 2 cm.',
      'Grupo A: sem alarme, sem condição especial → casa, hidratação VO 60 mL/kg/dia.',
      'Grupo B: comorbidade ou < 2/> 65a → observação + hidratação.',
      'Grupo C/D: alarme/choque → SF 20 mL/kg em 20 min, internar.',
    ],
    redFlag: 'Período crítico é dia 3-7 da febre (queda do hematócrito = recuperação, alta).',
    pearl: 'AAS e AINE são contraindicados (risco de sangramento) — só dipirona ou paracetamol.',
  },
];

export function findBlueprint(courseTitle: string, topic: string): TopicBlueprint | null {
  return BLUEPRINTS.find(
    (b) => b.courseTitle === courseTitle && b.topic.toLowerCase() === topic.toLowerCase(),
  ) ?? null;
}

export function blueprintsForCourse(courseTitle: string): TopicBlueprint[] {
  return BLUEPRINTS.filter((b) => b.courseTitle === courseTitle);
}
