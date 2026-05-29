import type { ReceitaSimulacao } from './simulacao-medicina';
import { SIMULACAO_MEDICINA } from './simulacao-medicina';
import { SIMULACAO_ODONTO } from './simulacao-odonto';

export type { ReceitaSimulacao, PrescritorFicticio, ItemReceita } from './simulacao-medicina';

export function listSimulacoes(track: 'medicina' | 'odonto'): ReceitaSimulacao[] {
  return track === 'odonto' ? SIMULACAO_ODONTO : SIMULACAO_MEDICINA;
}

export function pickRandomSimulacao(
  track: 'medicina' | 'odonto',
  excludeId?: string,
): ReceitaSimulacao {
  const all = listSimulacoes(track);
  if (all.length === 0) throw new Error(`Nenhuma simulação disponível para o track ${track}`);
  if (all.length === 1) return all[0];
  let pick = all[Math.floor(Math.random() * all.length)];
  let safety = 0;
  while (excludeId && pick.id === excludeId && safety < 10) {
    pick = all[Math.floor(Math.random() * all.length)];
    safety++;
  }
  return pick;
}
