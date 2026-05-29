// Wrapper que escolhe o dataset do MDC conforme a trilha do usuário.
// Mantém a interface estável pra pages/FarmacoMDC.tsx — só troca o conteúdo.

import {
  CLASSES as MED_CLASSES,
  DRUGS as MED_DRUGS,
  SCENARIOS as MED_SCENARIOS,
  SYSTEM_LABEL as MED_SYSTEM_LABEL,
  getClass as getMedClass,
  getDrug as getMedDrug,
  getScenario as getMedScenario,
  mdcCardId as medMdcCardId,
  pickSameClassDrugs as pickMedSameClass,
  pickScenarios as pickMedScenarios,
  type Drug as MedDrug,
  type DrugClass as MedClass,
  type FarmacoSystem,
  type Scenario as MedScenario,
} from './farmaco-mdc';
import {
  ODONTO_CLASSES,
  ODONTO_DRUGS,
  ODONTO_SCENARIOS,
  ODONTO_SYSTEM_LABEL,
  getOdontoClass,
  getOdontoDrug,
  getOdontoScenario,
  odontoMdcCardId,
  pickOdontoScenarios,
  pickSameClassOdontoDrugs,
  type OdontoDrug,
  type OdontoDrugClass,
  type OdontoScenario,
  type OdontoSystem,
} from './odonto-mdc';

export type MdcTrack = 'medicina' | 'odonto';

// Unified types — same shape em ambos os tracks
export interface MdcDrug {
  id: string;
  name: string;
  classId: string;
  mechanism: string;
  anchorIndication: string;
  doseAnchor: string;
  redFlag: string;
  mnemonic?: string;
}

export interface MdcClass {
  id: string;
  name: string;
  system: string;
  short: string;
}

export interface MdcScenario {
  id: string;
  system: string;
  vignette: string;
  question: string;
  correctClassId: string;
  classDistractors: string[];
  correctDrugId: string;
  drugDistractors: string[];
  teaching: string;
}

export interface MdcDataset {
  systemLabel: Record<string, string>;
  classes: MdcClass[];
  drugs: MdcDrug[];
  scenarios: MdcScenario[];
  getClass: (id: string) => MdcClass | undefined;
  getDrug: (id: string) => MdcDrug | undefined;
  getScenario: (id: string) => MdcScenario | undefined;
  mdcCardId: (scenarioId: string) => string;
  pickScenarios: (system: string | 'mix', count: number) => MdcScenario[];
  pickSameClassDrugs: (correctDrugId: string, count: number) => MdcDrug[];
  /** Rótulo curto da trilha pra UI (ex: "Mistura do dia", "Mistura clínica") */
  trackLabel: string;
  /** Suporte a `OdontoSystem | FarmacoSystem` ao percorrer scenarios */
  systems: string[];
}

const MED_DATASET: MdcDataset = {
  systemLabel: MED_SYSTEM_LABEL as Record<string, string>,
  classes: MED_CLASSES as MdcClass[],
  drugs: MED_DRUGS as MdcDrug[],
  scenarios: MED_SCENARIOS as MdcScenario[],
  getClass: (id) => getMedClass(id) as MdcClass | undefined,
  getDrug: (id) => getMedDrug(id) as MdcDrug | undefined,
  getScenario: (id) => getMedScenario(id) as MdcScenario | undefined,
  mdcCardId: medMdcCardId,
  pickScenarios: (system, count) =>
    pickMedScenarios(system as FarmacoSystem | 'mix', count) as MdcScenario[],
  pickSameClassDrugs: (id, count) => pickMedSameClass(id, count) as MdcDrug[],
  trackLabel: 'medicina',
  systems: Array.from(new Set(MED_SCENARIOS.map((s) => s.system))),
};

const ODONTO_DATASET: MdcDataset = {
  systemLabel: ODONTO_SYSTEM_LABEL as Record<string, string>,
  classes: ODONTO_CLASSES as MdcClass[],
  drugs: ODONTO_DRUGS as MdcDrug[],
  scenarios: ODONTO_SCENARIOS as MdcScenario[],
  getClass: (id) => getOdontoClass(id) as MdcClass | undefined,
  getDrug: (id) => getOdontoDrug(id) as MdcDrug | undefined,
  getScenario: (id) => getOdontoScenario(id) as MdcScenario | undefined,
  mdcCardId: odontoMdcCardId,
  pickScenarios: (system, count) =>
    pickOdontoScenarios(system as OdontoSystem | 'mix', count) as MdcScenario[],
  pickSameClassDrugs: (id, count) => pickSameClassOdontoDrugs(id, count) as MdcDrug[],
  trackLabel: 'odonto',
  systems: Array.from(new Set(ODONTO_SCENARIOS.map((s) => s.system))),
};

export function getMdcDataset(track: MdcTrack): MdcDataset {
  return track === 'odonto' ? ODONTO_DATASET : MED_DATASET;
}

// Re-export tipos auxiliares pra outros lugares
export type { MedDrug, MedClass, MedScenario, OdontoDrug, OdontoDrugClass, OdontoScenario };
