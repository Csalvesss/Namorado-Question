import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Heart, Stethoscope, X } from 'lucide-react';
import Eyebrow from '../components/ui/Eyebrow';
import IconChip from '../components/ui/IconChip';
import { useUser } from '../lib/useUser';
import {
  CADEIRA_CASES,
  SEDACAO_LABEL,
  pickRandomCase,
  type CadeiraCase,
  type SedacaoChoice,
} from '../data/cadeira-ansiosa';

type Stage = 'intro' | 'case' | 'review';

interface ReviewState {
  case: CadeiraCase;
  chosen: SedacaoChoice;
  correct: boolean;
}

export default function CadeiraAnsiosa() {
  const { user } = useUser();
  const isNamorado = user?.displayMode !== 'doutora';
  const [stage, setStage] = useState<Stage>('intro');
  const [currentCase, setCurrentCase] = useState<CadeiraCase | null>(null);
  const [chosen, setChosen] = useState<SedacaoChoice | null>(null);
  const [history, setHistory] = useState<ReviewState[]>([]);

  function startCase() {
    let next = pickRandomCase();
    // Evita repetir o último caso se houver mais de um
    if (currentCase && CADEIRA_CASES.length > 1) {
      let safety = 0;
      while (next.id === currentCase.id && safety < 10) {
        next = pickRandomCase();
        safety++;
      }
    }
    setCurrentCase(next);
    setChosen(null);
    setStage('case');
  }

  function answer(choice: SedacaoChoice) {
    if (!currentCase) return;
    const correct = choice === currentCase.correct;
    setChosen(choice);
    setHistory((h) => [...h, { case: currentCase, chosen: choice, correct }]);
    setStage('review');
  }

  function reset() {
    setStage('intro');
    setCurrentCase(null);
    setChosen(null);
  }

  if (stage === 'intro') {
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
            <IconChip icon={Heart} size="lg" />
            <h1 className="font-display font-light text-ink text-[clamp(2rem,5vw,3rem)] leading-[1.05]">
              Cadeira Ansiosa
            </h1>
          </div>

          <p className="mt-4 max-w-xl font-body text-lg italic leading-relaxed text-mute">
            {isNamorado
              ? 'um paciente ansioso senta na sua cadeira. o que você faz, doutora?'
              : 'microssimulação de manejo farmacológico e comportamental do paciente ansioso.'}
          </p>

          <div className="card mt-10 p-8 sm:p-10">
            <Eyebrow>como funciona</Eyebrow>
            <ol className="mt-5 space-y-3 font-body text-[15px] leading-relaxed text-txt/85">
              <li>
                <strong className="font-display not-italic text-ink">1.</strong> Você vê o perfil
                do paciente (idade, comorbidade, ansiedade, jejum) e o procedimento previsto.
              </li>
              <li>
                <strong className="font-display not-italic text-ink">2.</strong> Escolhe entre 5
                condutas: não medicar, midazolam, lorazepam, N2O, encaminhar.
              </li>
              <li>
                <strong className="font-display not-italic text-ink">3.</strong> Recebe feedback
                educacional pra cada opção — não só "errou", mas{' '}
                <em className="not-italic text-wine">por que</em> cada escolha foi boa ou ruim.
              </li>
              <li>
                <strong className="font-display not-italic text-ink">4.</strong> Mesmo paciente
                amanhã pode vir com variável trocada (peso, jejum, comorbidade nova).
              </li>
            </ol>
            <p className="mt-5 font-body text-sm italic text-mute">
              Sem nota, sem ranking. O objetivo é treinar a decisão clínica em ambiente seguro.
            </p>
          </div>

          {history.length > 0 && (
            <div className="card mt-6 p-6">
              <Eyebrow>histórico desta sessão</Eyebrow>
              <ul className="mt-4 space-y-2 font-body text-sm">
                {history.map((h, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {h.correct ? (
                      <Check className="mt-1 h-4 w-4 shrink-0 text-wine" strokeWidth={2} />
                    ) : (
                      <X className="mt-1 h-4 w-4 shrink-0 text-mute" strokeWidth={2} />
                    )}
                    <span className="text-txt/85">
                      <span className="font-display italic text-ink">{h.case.patientTag}</span> —
                      você escolheu: <em className="not-italic">{SEDACAO_LABEL[h.chosen]}</em>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10">
            <button type="button" onClick={startCase} className="btn-primary">
              {history.length > 0 ? 'próximo paciente' : 'começar'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (stage === 'case' && currentCase) {
    return (
      <SessionLayout caseData={currentCase}>
        <div className="card mt-6 p-7 sm:p-9">
          <div className="font-display text-[11px] uppercase tracking-[0.22em] text-gold">
            paciente
          </div>
          <p className="mt-3 font-body text-[17px] leading-relaxed text-txt sm:text-[18px]">
            {currentCase.vignette}
          </p>
          <div className="mt-5 border-t border-line pt-4">
            <div className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">
              procedimento previsto
            </div>
            <p className="mt-1 font-body italic text-ink">{currentCase.procedure}</p>
          </div>
          <p className="mt-5 font-display text-xl italic text-ink">{currentCase.question}</p>
        </div>

        <div className="mt-8">
          <Eyebrow>sua escolha</Eyebrow>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {(Object.keys(SEDACAO_LABEL) as SedacaoChoice[]).map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => answer(choice)}
                className="group flex items-start gap-4 rounded-2xl border border-line bg-card p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.99]"
              >
                <span className="font-display text-base italic text-ink">
                  {SEDACAO_LABEL[choice]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </SessionLayout>
    );
  }

  // review stage
  if (stage === 'review' && currentCase && chosen) {
    const correct = chosen === currentCase.correct;
    return (
      <SessionLayout caseData={currentCase}>
        {/* Resumo */}
        <div
          className={`card mt-6 p-7 ${
            correct ? 'border-[var(--blush-stroke)] bg-blush' : 'bg-card'
          }`}
        >
          <div className="flex items-center gap-3">
            {correct ? (
              <Check className="h-5 w-5 text-wine" strokeWidth={1.8} />
            ) : (
              <Stethoscope className="h-5 w-5 text-mute" strokeWidth={1.8} />
            )}
            <h3 className="font-display text-lg italic text-ink">
              {correct
                ? isNamorado
                  ? 'boa, doutora — manejo certo'
                  : 'conduta correta'
                : isNamorado
                  ? 'olha só, ia ter uma armadilha aqui'
                  : 'conduta não ideal — reveja'}
            </h3>
          </div>
          <p className="mt-3 font-body text-[15px] leading-relaxed text-txt">
            <strong className="font-display not-italic text-ink">
              Conduta de escolha: {SEDACAO_LABEL[currentCase.correct]}.
            </strong>
            <br />
            {currentCase.why}
          </p>
        </div>

        {/* Feedback por opção */}
        <div className="card mt-6 p-7">
          <Eyebrow>por que cada opção</Eyebrow>
          <ul className="mt-4 space-y-4">
            {(Object.keys(SEDACAO_LABEL) as SedacaoChoice[]).map((choice) => {
              const isCorrectOpt = choice === currentCase.correct;
              const wasChosen = choice === chosen;
              return (
                <li
                  key={choice}
                  className={`rounded-2xl border p-4 ${
                    isCorrectOpt
                      ? 'border-wine bg-blush/60'
                      : wasChosen && !isCorrectOpt
                        ? 'border-mute/40 bg-card'
                        : 'border-line bg-card'
                  }`}
                >
                  <div className="font-display text-sm italic text-ink">
                    {SEDACAO_LABEL[choice]}
                    {isCorrectOpt && (
                      <span className="ml-2 font-display text-[10px] uppercase tracking-[0.2em] text-wine">
                        (escolha certa)
                      </span>
                    )}
                    {wasChosen && !isCorrectOpt && (
                      <span className="ml-2 font-display text-[10px] uppercase tracking-[0.2em] text-mute">
                        (você escolheu)
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-body text-[14px] leading-relaxed text-txt/85">
                    {currentCase.feedbackByOption[choice]}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={startCase} className="btn-primary">
            próximo paciente
          </button>
          <button type="button" onClick={reset} className="btn-ghost">
            voltar ao começo
          </button>
        </div>
      </SessionLayout>
    );
  }

  return null;
}

function SessionLayout({
  caseData,
  children,
}: {
  caseData: CadeiraCase;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-paper pb-20">
      <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10 sm:py-16 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full bg-blush px-4 py-1.5 font-display text-[11px] uppercase tracking-[0.22em] text-wine">
            cadeira ansiosa
          </span>
          <div className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">
            {caseData.patientTag}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
