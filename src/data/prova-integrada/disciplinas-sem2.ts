/**
 * Inventário do material do "Sem 2" — na verdade, todos os cursos de Medicina já
 * presentes no app (seeds em /src/data/seeds). Usado pelas questões da Prova
 * Integrada pra referenciar conteúdo já estudado pelas alunas.
 */

export interface Sem2Discipline {
  id: string;
  title: string;
  area: string;
  /** Nome do arquivo seed correspondente. */
  seedFile: string;
  topics: string[];
}

export const SEM2_DISCIPLINES: Sem2Discipline[] = [
  // === Infectologia ===
  { id: 'inf-hiv', title: 'HIV / AIDS', area: 'Infectologia', seedFile: 'hiv-aids.json', topics: ['transmissão', 'estadiamento CD4', 'TARV', 'profilaxia'] },
  { id: 'inf-meningites', title: 'Meningites', area: 'Infectologia', seedFile: 'meningites.json', topics: ['bacteriana vs viral', 'líquor', 'ATB empírico'] },
  { id: 'inf-dengue', title: 'Dengue', area: 'Infectologia', seedFile: 'dengue.json', topics: ['fases', 'sinais de alarme', 'protocolo MS'] },
  { id: 'inf-chik', title: 'Chikungunya', area: 'Infectologia', seedFile: 'chikungunya.json', topics: ['artralgia', 'fase crônica'] },
  { id: 'inf-zika', title: 'Zika', area: 'Infectologia', seedFile: 'zika.json', topics: ['gestante', 'microcefalia', 'Guillain-Barré'] },
  { id: 'inf-febre-amarela', title: 'Febre Amarela', area: 'Infectologia', seedFile: 'febre-amarela.json', topics: ['silvestre vs urbana', 'vacinação'] },
  { id: 'inf-oropouche', title: 'Oropouche', area: 'Infectologia', seedFile: 'oropouche.json', topics: ['arbovirose emergente'] },

  // === Cardiologia ===
  { id: 'cardio-has', title: 'Hipertensão Arterial', area: 'Cardiologia', seedFile: 'hipertensao-arterial.json', topics: ['classificação BR 2020', 'MAPA', 'crise hipertensiva'] },
  { id: 'cardio-ic', title: 'Insuficiência Cardíaca', area: 'Cardiologia', seedFile: 'insuficiencia-cardiaca.json', topics: ['FE preservada/reduzida', 'NYHA', 'BNP', 'terapia quádrupla'] },
  { id: 'cardio-ecg', title: 'Eletrocardiograma: Fundamentos', area: 'Cardiologia', seedFile: 'eletro-basico.json', topics: ['ritmo', 'eixo', 'isquemia'] },

  // === Farmacologia P2 (todas as classes da prova final) ===
  { id: 'farmaco-anti-hta', title: 'Farmaco: Anti-hipertensivos e IC', area: 'Farmacologia', seedFile: 'farmaco-p2-cardio-has.json', topics: ['iECA', 'BRA', 'betabloq', 'BCC', 'diuréticos', 'iSGLT2/SRAA'] },
  { id: 'farmaco-coag', title: 'Farmaco: Antiagregantes/Anticoag/Hipolipemiantes', area: 'Farmacologia', seedFile: 'farmaco-p2-cardio-coag.json', topics: ['AAS', 'clopidogrel', 'heparina', 'DOACs', 'varfarina', 'estatina', 'ezetimiba', 'PCSK9'] },
  { id: 'farmaco-dm', title: 'Farmaco: Antidiabéticos e Insulinas', area: 'Farmacologia', seedFile: 'farmaco-p2-antidiabeticos.json', topics: ['metformina', 'sulfonilureia', 'GLP-1', 'iSGLT2', 'iDPP-4', 'NPH', 'regular', 'análogos'] },
  { id: 'farmaco-onco', title: 'Farmaco: Antineoplásicos', area: 'Farmacologia', seedFile: 'farmaco-p2-antineoplasicos.json', topics: ['alquilantes', 'antimetabólitos', 'alcaloides', 'taxanos', 'inibidores TK', 'imunoterapia'] },
  { id: 'farmaco-parasit', title: 'Farmaco: Antiparasitários', area: 'Farmacologia', seedFile: 'farmaco-p2-antiparasitarios.json', topics: ['antimaláricos', 'metronidazol', 'antiparasitários intestinais'] },
  { id: 'farmaco-virais', title: 'Farmaco: Antivirais', area: 'Farmacologia', seedFile: 'farmaco-p2-antivirais.json', topics: ['aciclovir', 'oseltamivir', 'TARV', 'antivirais HCV'] },
  { id: 'farmaco-reprod', title: 'Farmaco: Sistema Reprodutor', area: 'Farmacologia', seedFile: 'farmaco-p2-reprodutor.json', topics: ['contraceptivos', 'TRH', 'antiandrogênicos'] },
  { id: 'farmaco-mecanismo', title: 'Farmaco: Mecanismo e Efeito', area: 'Farmacologia', seedFile: 'farmaco-match.json', topics: ['MoA', 'receptores'] },

  // === Atbterapia / Flashcards ===
  { id: 'atb-antibioticos', title: 'Antibióticos (revisão)', area: 'Infectologia / Farmacologia', seedFile: 'flashcards-antibioticos.json', topics: ['beta-lactâmicos', 'macrolídeos', 'quinolonas', 'aminoglicosídeos', 'glicopeptídeos'] },
];

export function findSem2Discipline(id: string): Sem2Discipline | undefined {
  return SEM2_DISCIPLINES.find((d) => d.id === id);
}
