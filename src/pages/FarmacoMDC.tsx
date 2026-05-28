import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Heart, Pill, RotateCcw, X } from 'lucide-react';
import Eyebrow from '../components/ui/Eyebrow';
import IconChip from '../components/ui/IconChip';
import { useUser } from '../lib/useUser';
import { hasCardHistory, listDueCards, reviewCard, SRS_CHANGE_EVENT } from '../lib/srs';
import {
  CLASSES,
  SYSTEM_LABEL,
  SCENARIOS,
  getClass,
  getDrug,
  getScenario,
  mdcCardId,
  pickSameClassDrugs,
  pickScenarios,
  shuffle,
  type FarmacoSystem,
  type Scenario,
} from '../data/farmaco-mdc';

type Step = 'class' | 'drug' | 'closing';

interface SessionState {
  scenarios: Scenario[];
  index: number;
  step: Step;
  classChoice: string | null;
  drugChoice: string | null;
  /** ids de cenários onde ela errou pelo menos uma etapa */
  revisitTomorrow: string[];
  /** ids de cenários acertados em ambas as etapas, nesta sessão */
  cleared: string[];
  /** marcador "sessão de revisão" — afeta copy de saída */
  isReviewSession: boolean;
  startedAt: number;
  /** trava pra escrever no SRS uma única vez ao terminar */
  gradesWritten: boolean;
}

const SESSION_SIZE = 8;

export default function FarmacoMDC() {
  const { user } = useUser();
  const isNamorado = user?.displayMode !== 'doutora';
  const [system, setSystem] = useState<FarmacoSystem | 'mix' | 'review' | null>(null);
  const [state, setState] = useState<SessionState | null>(null);
  const [now, setNow] = useState(Date.now());
  const [srsTick, setSrsTick] = useState(0);

  useEffect(() => {
    if (!state) return;
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, [state]);

  // Sincroniza com SRS_CHANGE_EVENT (quando gravamos grades no fim da sessão,
  // o badge "revisar pendentes" deve recalcular sem reload).
  useEffect(() => {
    function bump() {
      setSrsTick((t) => t + 1);
    }
    window.addEventListener(SRS_CHANGE_EVENT, bump);
    return () => window.removeEventListener(SRS_CHANGE_EVENT, bump);
  }, []);

  /** Cenários que já têm card no SRS e estão vencidos (due ≤ now).
   *  Cenários NUNCA estudados não entram aqui — eles vêm via botões de sistema.
   *  Isso evita que "revisar pendentes" mostre o catálogo inteiro no primeiro dia. */
  const dueScenarios = useMemo<Scenario[]>(() => {
    if (!user) return [];
    const allCardIds = SCENARIOS.map((s) => mdcCardId(s.id));
    const dueIds = new Set(listDueCards(user.uid, allCardIds));
    // raw map cards → scenarios, filtrando os que NÃO são "novos"
    // (listDueCards trata ausência como due=0, então cenários novos vêm também;
    //  para a fila de revisão queremos apenas os que JÁ foram vistos antes).
    return SCENARIOS.filter((s) => {
      const cardId = mdcCardId(s.id);
      if (!dueIds.has(cardId)) return false;
      return hasCardHistory(user.uid, cardId);
    });
  }, [user, srsTick]);

  // CRÍTICO: useMemos têm que vir ANTES de qualquer early return, senão
  // a ordem dos hooks muda entre renders (home → sessão) e o React quebra
  // com Minified Error #310. Cálculo é safe quando state é null.
  const activeScenario = state ? state.scenarios[state.index] : undefined;
  const classOptions = useMemo(
    () => (activeScenario ? classOptionsFor(activeScenario) : []),
    [activeScenario?.id],
  );
  const drugOptions = useMemo(
    () => (activeScenario ? drugOptionsFor(activeScenario) : []),
    [activeScenario?.id],
  );

  function startSession(sys: FarmacoSystem | 'mix' | 'review') {
    let scenarios: Scenario[];
    if (sys === 'review') {
      scenarios = shuffle(dueScenarios).slice(0, SESSION_SIZE);
    } else {
      scenarios = pickScenarios(sys, SESSION_SIZE);
    }
    if (scenarios.length === 0) return;
    setSystem(sys);
    setState({
      scenarios,
      index: 0,
      step: 'class',
      classChoice: null,
      drugChoice: null,
      revisitTomorrow: [],
      cleared: [],
      isReviewSession: sys === 'review',
      startedAt: Date.now(),
      gradesWritten: false,
    });
  }

  function reset() {
    setSystem(null);
    setState(null);
    // força refetch da fila de pendentes
    setSrsTick((t) => t + 1);
  }

  // Tela inicial — seleção de sistema
  if (!state) {
    const systems: Array<FarmacoSystem | 'mix'> = [
      'mix',
      ...(Array.from(new Set(SCENARIOS.map((s) => s.system))) as FarmacoSystem[]),
    ];

    return (
      <section className="bg-paper">
        <div className="mx-auto w-full max-w-4xl px-6 py-14 sm:px-10 sm:py-20 lg:px-20">
          <Link
            to="/ferramentas"
            className="inline-flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.22em] text-mute transition hover:text-wine"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={2} /> voltar para ferramentas
          </Link>

          <div className="mt-6 flex items-baseline gap-5">
            <span className="font-display text-[2.5rem] italic font-light leading-none text-rose">
              Rx
            </span>
            <h1 className="font-display font-light text-ink text-[clamp(2rem,5vw,3rem)] leading-[1.05]">
              Mapa de Decisão Clínica
            </h1>
          </div>

          <p className="mt-4 max-w-xl font-body text-lg italic leading-relaxed text-mute">
            {isNamorado
              ? 'sem pressão, amor. a gente decora pela situação, não pelo nome.'
              : 'cenário, classe, molécula. 5 a 8 minutos por sessão.'}
          </p>

          <div className="card mt-10 p-8 sm:p-10">
            <Eyebrow>como funciona</Eyebrow>
            <ol className="mt-5 space-y-3 font-body text-[15px] leading-relaxed text-txt/85">
              <li>
                <strong className="font-display not-italic text-ink">1.</strong> Você vê um caso
                clínico curto.
              </li>
              <li>
                <strong className="font-display not-italic text-ink">2.</strong> Escolhe a{' '}
                <em className="not-italic text-wine">classe</em> certa.
              </li>
              <li>
                <strong className="font-display not-italic text-ink">3.</strong> Escolhe a{' '}
                <em className="not-italic text-wine">molécula</em> dentro da classe.
              </li>
              <li>
                <strong className="font-display not-italic text-ink">4.</strong> Recebe dose-âncora,
                bandeira vermelha e o porquê em 5s.
              </li>
            </ol>
            <p className="mt-5 font-body text-sm italic text-mute">
              Sem pontuação. Sem streak. O que escapar volta amanhã.
            </p>
          </div>

          {dueScenarios.length > 0 && (
            <button
              type="button"
              onClick={() => startSession('review')}
              className="card mt-8 flex w-full items-center justify-between gap-5 border-[var(--blush-stroke)] bg-blush p-7 text-left shadow-lift transition hover:-translate-y-0.5 active:scale-[0.99]"
            >
              <div className="flex items-center gap-5">
                <IconChip icon={RotateCcw} tone="wine" size="lg" />
                <div>
                  <h3 className="font-display text-xl italic text-ink">
                    {isNamorado ? 'tem coisa te esperando, amor' : 'pendências de revisão'}
                  </h3>
                  <p className="mt-1 font-body text-[14px] italic text-mute">
                    {dueScenarios.length} {dueScenarios.length === 1 ? 'caso' : 'casos'} marcado
                    {dueScenarios.length === 1 ? '' : 's'} pra hoje. abre primeiro.
                  </p>
                </div>
              </div>
              <span className="hidden font-display text-sm italic text-wine sm:inline">
                revisar
              </span>
            </button>
          )}

          <div className="mt-8">
            <Eyebrow>escolha o sistema</Eyebrow>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {systems.map((sys) => {
                const count =
                  sys === 'mix'
                    ? SCENARIOS.length
                    : SCENARIOS.filter((s) => s.system === sys).length;
                const label = sys === 'mix' ? 'Mistura do dia' : SYSTEM_LABEL[sys];
                const desc =
                  sys === 'mix'
                    ? '8 cenários sorteados entre todos os sistemas'
                    : `${count} ${count === 1 ? 'cenário disponível' : 'cenários disponíveis'}`;
                const featured = sys === 'mix';
                return (
                  <button
                    key={sys}
                    type="button"
                    onClick={() => startSession(sys)}
                    disabled={count === 0}
                    className={`group rounded-3xl border p-6 text-left transition hover:-translate-y-0.5 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${
                      featured
                        ? 'bg-wine border-wine text-[#FBEFEC] shadow-lift'
                        : 'border-line bg-card shadow-soft hover:shadow-lift'
                    }`}
                  >
                    <IconChip
                      icon={Pill}
                      tone={featured ? 'white' : 'blush'}
                      size="sm"
                      className="mb-4"
                    />
                    <h3
                      className={`font-display text-xl italic ${
                        featured ? 'text-[#FBEFEC]' : 'text-ink'
                      }`}
                    >
                      {label}
                    </h3>
                    <p
                      className={`mt-2 font-body text-[13px] italic ${
                        featured ? 'text-[#FBEFEC]/80' : 'text-mute'
                      }`}
                    >
                      {desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Sessão em andamento ou tela de fechamento
  const scenario = state.scenarios[state.index];

  // Fim de sessão
  if (!scenario) {
    return (
      <EndOfSession
        state={state}
        isNamorado={isNamorado}
        onRestart={reset}
        onGradesWritten={() =>
          setState((s) => (s ? { ...s, gradesWritten: true } : s))
        }
        uid={user?.uid}
      />
    );
  }

  // Etapa: classe
  if (state.step === 'class') {
    return (
      <SessionLayout state={state} now={now} systemLabel={systemLabelOf(system)}>
        <Vignette scenario={scenario} />

        <div className="mt-8">
          <Eyebrow>qual classe?</Eyebrow>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {classOptions.map((classId) => {
              const cls = getClass(classId);
              if (!cls) return null;
              return (
                <button
                  key={classId}
                  type="button"
                  onClick={() => answerClass(classId)}
                  className="group flex flex-col items-start gap-1 rounded-2xl border border-line bg-card p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.99]"
                >
                  <span className="font-display text-lg italic text-ink">{cls.name}</span>
                  <span className="font-body text-[13px] italic text-mute">{cls.short}</span>
                </button>
              );
            })}
          </div>
        </div>
      </SessionLayout>
    );

    function answerClass(classId: string) {
      setState((s) =>
        s
          ? {
              ...s,
              step: 'drug',
              classChoice: classId,
              revisitTomorrow:
                classId === scenario.correctClassId
                  ? s.revisitTomorrow
                  : Array.from(new Set([...s.revisitTomorrow, scenario.id])),
            }
          : s,
      );
    }
  }

  // Etapa: droga
  if (state.step === 'drug') {
    const classCorrect = state.classChoice === scenario.correctClassId;
    const correctClass = getClass(scenario.correctClassId);

    return (
      <SessionLayout state={state} now={now} systemLabel={systemLabelOf(system)}>
        <Vignette scenario={scenario} />

        {!classCorrect && correctClass && (
          <div className="mt-6 rounded-2xl border border-line bg-blush/60 p-4 font-body text-sm italic text-txt/85">
            classe que entra aqui:{' '}
            <strong className="font-display not-italic text-wine">{correctClass.name}</strong>. sem
            problema — segue.
          </div>
        )}

        <div className="mt-8">
          <Eyebrow>qual molécula?</Eyebrow>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {drugOptions.map((drugId) => {
              const d = getDrug(drugId);
              if (!d) return null;
              return (
                <button
                  key={drugId}
                  type="button"
                  onClick={() => answerDrug(drugId)}
                  className="group flex items-center gap-4 rounded-full border border-line bg-card px-5 py-4 text-left transition hover:border-wine/40 hover:bg-blush/40 active:scale-[0.99]"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush font-display text-sm italic text-wine">
                    <Pill className="h-4 w-4" strokeWidth={1.6} />
                  </span>
                  <span className="font-display text-base italic text-ink">{d.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </SessionLayout>
    );

    function answerDrug(drugId: string) {
      setState((s) => {
        if (!s) return s;
        const drugWrong = drugId !== scenario.correctDrugId;
        const classWrong = s.classChoice !== scenario.correctClassId;
        const errored = drugWrong || classWrong;
        return {
          ...s,
          step: 'closing',
          drugChoice: drugId,
          revisitTomorrow: errored
            ? Array.from(new Set([...s.revisitTomorrow, scenario.id]))
            : s.revisitTomorrow,
          cleared: errored
            ? s.cleared
            : Array.from(new Set([...s.cleared, scenario.id])),
        };
      });
    }
  }

  // Etapa: fechamento
  const correctDrug = getDrug(scenario.correctDrugId);
  const correctClass = getClass(scenario.correctClassId);
  const userPickedDrugRight = state.drugChoice === scenario.correctDrugId;
  const userPickedClassRight = state.classChoice === scenario.correctClassId;
  const both = userPickedClassRight && userPickedDrugRight;

  return (
    <SessionLayout state={state} now={now} systemLabel={systemLabelOf(system)}>
      <Vignette scenario={scenario} compact />

      <div className="card mt-6 border-[var(--blush-stroke)] bg-blush p-7 shadow-lift">
        <div className="flex items-center gap-3">
          {isNamorado && (
            <Heart
              className={`h-5 w-5 ${both ? 'fill-wine text-wine' : 'text-wine'}`}
              strokeWidth={1.6}
            />
          )}
          <h3 className="font-display text-xl italic text-ink">
            {both
              ? isNamorado
                ? 'mandou bem, amor'
                : 'correto'
              : isNamorado
                ? 'sem pressão — só ficar com isso'
                : 'observe'}
          </h3>
        </div>

        {correctDrug && correctClass && (
          <div className="mt-5 space-y-4 font-body text-[15px] leading-relaxed text-txt">
            <div>
              <div className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">
                molécula
              </div>
              <div className="mt-1 font-display text-xl italic text-ink">
                {correctDrug.name}{' '}
                <span className="font-body not-italic text-mute">· {correctClass.name}</span>
              </div>
            </div>

            <div>
              <div className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">
                mecanismo
              </div>
              <div className="mt-1">{correctDrug.mechanism}</div>
            </div>

            <div>
              <div className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">
                dose-âncora
              </div>
              <div className="mt-1">{correctDrug.doseAnchor}</div>
            </div>

            <div>
              <div className="font-display text-[11px] uppercase tracking-[0.22em] text-wine">
                bandeira vermelha
              </div>
              <div className="mt-1 text-txt">{correctDrug.redFlag}</div>
            </div>

            {correctDrug.mnemonic && (
              <div className="rounded-2xl border border-[var(--blush-stroke)] bg-card/70 px-4 py-3 font-body text-sm italic text-wine">
                {correctDrug.mnemonic}
              </div>
            )}

            <div className="border-t border-[var(--blush-stroke)] pt-4 font-body text-sm italic text-txt/85">
              {scenario.teaching}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end">
        <button type="button" onClick={advance} className="btn-primary">
          {state.index + 1 < state.scenarios.length ? 'próximo caso' : 'terminar sessão'}
        </button>
      </div>
    </SessionLayout>
  );

  function advance() {
    setState((s) =>
      s
        ? {
            ...s,
            index: s.index + 1,
            step: 'class',
            classChoice: null,
            drugChoice: null,
          }
        : s,
    );
  }

  function systemLabelOf(sys: FarmacoSystem | 'mix' | 'review' | null): string {
    if (sys === null) return '';
    if (sys === 'mix') return 'Mistura';
    if (sys === 'review') return 'Revisão';
    return SYSTEM_LABEL[sys];
  }
}

// ============================================================
// Subcomponentes
// ============================================================

function Vignette({ scenario, compact = false }: { scenario: Scenario; compact?: boolean }) {
  return (
    <div className={`card ${compact ? 'p-6' : 'p-7 sm:p-9'}`}>
      <div className="font-display text-[11px] uppercase tracking-[0.22em] text-gold">
        {SYSTEM_LABEL[scenario.system]}
      </div>
      <p
        className={`mt-3 font-body leading-relaxed text-txt ${
          compact ? 'text-[15px]' : 'text-[17px] sm:text-[18px]'
        }`}
      >
        {scenario.vignette}
      </p>
      <p
        className={`mt-3 font-display italic text-ink ${
          compact ? 'text-base' : 'text-xl'
        }`}
      >
        {scenario.question}
      </p>
    </div>
  );
}

function SessionLayout({
  state,
  now,
  systemLabel,
  children,
}: {
  state: SessionState;
  now: number;
  systemLabel: string;
  children: React.ReactNode;
}) {
  const elapsedSec = Math.floor((now - state.startedAt) / 1000);
  const mm = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
  const ss = String(elapsedSec % 60).padStart(2, '0');
  const pct = ((state.index) / state.scenarios.length) * 100;

  return (
    <section className="bg-paper pb-20">
      <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10 sm:py-16 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full bg-blush px-4 py-1.5 font-display text-[11px] uppercase tracking-[0.22em] text-wine">
            {systemLabel}
          </span>
          <div className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">
            caso {String(state.index + 1).padStart(2, '0')} de{' '}
            {String(state.scenarios.length).padStart(2, '0')} · {mm}:{ss}
          </div>
        </div>
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-blush">
          <div
            className="h-full rounded-full bg-wine transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function EndOfSession({
  state,
  isNamorado,
  onRestart,
  onGradesWritten,
  uid,
}: {
  state: SessionState;
  isNamorado: boolean;
  onRestart: () => void;
  onGradesWritten: () => void;
  uid: string | undefined;
}) {
  // Grava as grades no SRS uma única vez ao montar este componente.
  // Cenário errado vira 'hard' (≈ 1 dia); acertado vira 'good' (1d na 1ª rep,
  // depois 3d, depois ~7d). Não-respondidos ficam de fora — sessão pode ter
  // sido interrompida; respeito isso.
  useEffect(() => {
    if (state.gradesWritten || !uid) return;
    for (const id of state.cleared) {
      reviewCard(uid, mdcCardId(id), 'good');
    }
    for (const id of state.revisitTomorrow) {
      reviewCard(uid, mdcCardId(id), 'hard');
    }
    onGradesWritten();
  }, [state.gradesWritten, state.cleared, state.revisitTomorrow, uid, onGradesWritten]);

  const elapsedSec = Math.floor((Date.now() - state.startedAt) / 1000);
  const mm = Math.max(1, Math.round(elapsedSec / 60));
  const revisitCount = state.revisitTomorrow.length;
  const revisitScenarios = state.revisitTomorrow
    .map((id) => getScenario(id))
    .filter((s): s is Scenario => Boolean(s));

  // Coletar classes únicas das classes corretas dos cenários problemáticos pra mostrar
  const classesToReview = Array.from(
    new Set(revisitScenarios.map((s) => s.correctClassId)),
  )
    .map((id) => getClass(id))
    .filter((c): c is NonNullable<ReturnType<typeof getClass>> => Boolean(c));

  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-10 sm:py-24 lg:px-12">
        <Eyebrow>{state.isReviewSession ? 'revisão' : 'sessão'}</Eyebrow>
        <h1 className="mt-4 font-display font-light leading-[1.05] text-ink text-[clamp(2.25rem,6vw,3.5rem)]">
          {isNamorado ? 'você fez bonito, amor' : 'sessão concluída'}
        </h1>
        <p className="mt-4 max-w-lg font-body text-lg italic leading-relaxed text-mute">
          {mm} {mm === 1 ? 'minuto' : 'minutos'} de estudo.{' '}
          {revisitCount === 0
            ? isNamorado
              ? 'nada ficou pendente. respira.'
              : 'todos os casos respondidos corretamente.'
            : `${revisitCount} ${
                revisitCount === 1 ? 'caso volta' : 'casos voltam'
              } amanhã, agendado${revisitCount === 1 ? '' : 's'} aqui mesmo.`}
        </p>

        {revisitCount > 0 && classesToReview.length > 0 && (
          <div className="card mt-10 p-8 sm:p-10">
            <Eyebrow>volta amanhã</Eyebrow>
            <ul className="mt-5 space-y-3">
              {classesToReview.map((c) => (
                <li
                  key={c.id}
                  className="flex items-start gap-3 border-b border-line/70 pb-3 last:border-b-0 last:pb-0"
                >
                  <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blush text-wine">
                    <X className="h-3 w-3" strokeWidth={2.2} />
                  </span>
                  <div>
                    <div className="font-display text-base italic text-ink">{c.name}</div>
                    <div className="font-body text-[13px] italic text-mute">{c.short}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {revisitCount === 0 && (
          <div className="card mt-10 flex items-center gap-4 p-7">
            <Check className="h-6 w-6 text-wine" strokeWidth={1.8} />
            <p className="font-body text-[15px] italic text-txt">
              {isNamorado
                ? 'tá fluindo. dorme tranquila.'
                : 'nada na fila de revisão.'}
            </p>
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <button type="button" onClick={onRestart} className="btn-primary">
            outra sessão
          </button>
          <Link to="/ferramentas" className="btn-ghost">
            voltar às ferramentas
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Lógica das opções (separa pra ficar testável)
// ============================================================

function classOptionsFor(scenario: Scenario): string[] {
  const ids = [scenario.correctClassId, ...scenario.classDistractors];
  return shuffle(ids);
}

function drugOptionsFor(scenario: Scenario): string[] {
  // Distractor preferido: drogas da MESMA classe da droga correta.
  // Isso é o que faz a etapa "qual molécula?" testar recall do nome,
  // não eliminação por classe. Fallback nos distractors manuais se a
  // classe não tiver drogas suficientes no catálogo.
  const sameClass = pickSameClassDrugs(scenario.correctDrugId, 2);
  const distractors =
    sameClass.length >= 2
      ? sameClass.map((d) => d.id)
      : scenario.drugDistractors;
  const ids = [scenario.correctDrugId, ...distractors];
  // dedup defensivo (se classe pequena pode haver colisão com manual)
  return shuffle(Array.from(new Set(ids)));
}

// Suprime warning de "CLASSES não usado" se vier — está sendo usado via getClass
void CLASSES;
