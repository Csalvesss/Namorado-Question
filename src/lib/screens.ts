// Tradução de rota → nome amigável de tela, pro log de auditoria ("qual tela
// acessou"). Rotas com parâmetro dinâmico (ex: /curso/:id) são normalizadas pra
// um rótulo estável, mas o path bruto completo continua indo no log.

interface ScreenRule {
  // Testa contra o pathname. Ordem importa: a primeira regra que casar vence.
  match: RegExp;
  label: string;
}

const RULES: ScreenRule[] = [
  { match: /^\/app\/?$/, label: 'Início' },
  { match: /^\/cursos\/?$/, label: 'Cursos' },
  { match: /^\/curso\/[^/]+$/, label: 'Curso' },
  { match: /^\/quiz\/[^/]+$/, label: 'Quiz' },
  { match: /^\/intercalado\/?$/, label: 'Quiz intercalado' },
  { match: /^\/ferramentas\/?$/, label: 'Ferramentas' },
  { match: /^\/calculadoras\/?$/, label: 'Calculadoras' },
  { match: /^\/farmaco-mdc\/?$/, label: 'Farmaco MDC' },
  { match: /^\/cadeira-ansiosa\/?$/, label: 'Cadeira ansiosa' },
  { match: /^\/calculo-tubetes\/?$/, label: 'Cálculo de tubetes' },
  { match: /^\/bilhete-bancada\/?$/, label: 'Bilhete de bancada' },
  { match: /^\/receituario\/?$/, label: 'Receituário' },
  { match: /^\/simulacoes-odonto\/?$/, label: 'Simulações odonto' },
  { match: /^\/algoritmos-odonto\/?$/, label: 'Algoritmos odonto' },
  { match: /^\/passa-facil\/?$/, label: 'Passa fácil' },
  { match: /^\/casos\/[^/]+$/, label: 'Caso clínico' },
  { match: /^\/casos\/?$/, label: 'Casos' },
  { match: /^\/erros\/?$/, label: 'Erros' },
  { match: /^\/algoritmos\/[^/]+$/, label: 'Algoritmo' },
  { match: /^\/algoritmos\/?$/, label: 'Algoritmos' },
  { match: /^\/historico\/prova\/[^/]+$/, label: 'Revisão de prova' },
  { match: /^\/historico\/?$/, label: 'Histórico' },
  { match: /^\/revisar\/?$/, label: 'Revisar' },
  { match: /^\/plano\/?$/, label: 'Plano de estudo' },
  { match: /^\/bilhetes\/?$/, label: 'Bilhetes' },
  { match: /^\/autor\/?$/, label: 'Autor' },
  { match: /^\/perfil\/?$/, label: 'Perfil' },
  { match: /^\/prova-integrada\/?$/, label: 'Prova Integrada' },
  { match: /^\/admin\/?$/, label: 'Painel Admin' },
  { match: /^\/aguardando\/?$/, label: 'Aguardando liberação' },
  { match: /^\/login\/?$/, label: 'Login' },
  { match: /^\/\??$/, label: 'Boas-vindas' },
];

/**
 * Devolve um nome legível pra tela a partir do pathname. Cai em 'Outra tela'
 * (com o path) se nenhuma regra casar — assim nada fica sem registro.
 */
export function screenLabelForPath(pathname: string): string {
  const clean = (pathname || '/').split('?')[0].split('#')[0];
  for (const rule of RULES) {
    if (rule.match.test(clean)) return rule.label;
  }
  return 'Outra tela';
}
