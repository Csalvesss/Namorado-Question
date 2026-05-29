import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, FileSignature, X } from 'lucide-react';
import Eyebrow from '../components/ui/Eyebrow';
import IconChip from '../components/ui/IconChip';
import { useUser } from '../lib/useUser';
import {
  INTERVALO_LABEL,
  MEDICAMENTO_LABEL,
  ORIENTACAO_LABEL,
  RECEITA_SCENARIOS,
  VIA_LABEL,
  pickRandomScenario,
  validarReceita,
  type Intervalo,
  type Medicamento,
  type Orientacao,
  type ReceitaScenario,
  type ReceitaSubmissao,
  type Via,
} from '../data/receituario';

type Stage = 'intro' | 'prescrevendo' | 'validado';

const EMPTY_SUB: ReceitaSubmissao = {
  medicamento: null,
  doseMg: null,
  intervalo: null,
  duracaoDias: null,
  via: null,
  orientacoes: [],
};

const DOSE_OPTIONS = [100, 250, 300, 400, 500, 600, 750, 875, 1000, 1500, 2000];
const DURACAO_OPTIONS = [0, 1, 2, 3, 5, 7, 10, 14];

export default function Receituario() {
  const { user } = useUser();
  const displayMode = user?.displayMode ?? 'namorado';
  const isNamorado = displayMode === 'namorado';
  const isIrmao = displayMode === 'irmao';
  const [stage, setStage] = useState<Stage>('intro');
  const [scenario, setScenario] = useState<ReceitaScenario | null>(null);
  const [sub, setSub] = useState<ReceitaSubmissao>(EMPTY_SUB);
  const [validation, setValidation] = useState<ReturnType<typeof validarReceita> | null>(null);

  function startScenario() {
    let next = pickRandomScenario();
    if (scenario && RECEITA_SCENARIOS.length > 1) {
      let safety = 0;
      while (next.id === scenario.id && safety < 10) {
        next = pickRandomScenario();
        safety++;
      }
    }
    setScenario(next);
    setSub(EMPTY_SUB);
    setValidation(null);
    setStage('prescrevendo');
  }

  function validar() {
    if (!scenario) return;
    const r = validarReceita(sub, scenario);
    setValidation(r);
    setStage('validado');
  }

  function tryAgain() {
    setSub(EMPTY_SUB);
    setValidation(null);
    setStage('prescrevendo');
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
            <IconChip icon={FileSignature} size="lg" />
            <h1 className="font-display font-light text-ink text-[clamp(2rem,5vw,3rem)] leading-[1.05]">
              Receituário Guiado
            </h1>
          </div>

          <p className="mt-4 max-w-xl font-body text-lg italic leading-relaxed text-mute">
            {isNamorado
              ? 'você monta a receita, doutora. eu vou checando campo a campo o que precisa rever.'
              : isIrmao
                ? 'monta a receita aí. eu fico de olho e aponto onde escapou — sem drama.'
                : 'construção estruturada de prescrição com validação clínica campo a campo.'}
          </p>

          <div className="card mt-10 p-8 sm:p-10">
            <Eyebrow>como funciona</Eyebrow>
            <ol className="mt-5 space-y-3 font-body text-[15px] leading-relaxed text-txt/85">
              <li>
                <strong className="font-display not-italic text-ink">1.</strong> Você vê o
                paciente e o diagnóstico.
              </li>
              <li>
                <strong className="font-display not-italic text-ink">2.</strong> Escolhe{' '}
                <em className="not-italic text-wine">medicamento, dose, intervalo, duração, via</em>{' '}
                e <em className="not-italic text-wine">orientações</em>.
              </li>
              <li>
                <strong className="font-display not-italic text-ink">3.</strong> Toca em "validar
                receita" — a engine confere campo a campo.
              </li>
              <li>
                <strong className="font-display not-italic text-ink">4.</strong> Recebe feedback
                clínico por campo: o que tá certo, o que precisa rever e{' '}
                <em className="not-italic text-wine">por quê</em>.
              </li>
            </ol>
            <p className="mt-5 font-body text-sm italic text-mute">
              Diferente do MDC (que escolhe entre opções), aqui você monta a receita inteira como
              prescreveria na real. {RECEITA_SCENARIOS.length} cenários no banco v1.
            </p>
          </div>

          <div className="mt-10">
            <button type="button" onClick={startScenario} className="btn-primary">
              começar
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!scenario) return null;

  return (
    <section className="bg-paper pb-20">
      <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10 sm:py-16 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full bg-blush px-4 py-1.5 font-display text-[11px] uppercase tracking-[0.22em] text-wine">
            receituário guiado
          </span>
          <div className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">
            {scenario.patientTag}
          </div>
        </div>

        {/* Vinheta */}
        <div className="card mt-6 p-7 sm:p-9">
          <Eyebrow>paciente</Eyebrow>
          <p className="mt-3 font-body text-[16px] leading-relaxed text-txt sm:text-[17px]">
            {scenario.vignette}
          </p>
          <div className="mt-5 border-t border-line pt-4">
            <div className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">
              diagnóstico
            </div>
            <p className="mt-1 font-display italic text-ink">{scenario.diagnosis}</p>
          </div>
        </div>

        {/* Form da receita */}
        <div className="card mt-6 p-7 sm:p-9">
          <Eyebrow>sua prescrição</Eyebrow>

          <div className="mt-5 space-y-5">
            {/* Medicamento */}
            <FieldBlock label="medicamento">
              <select
                value={sub.medicamento ?? ''}
                onChange={(e) =>
                  setSub({
                    ...sub,
                    medicamento: e.target.value ? (e.target.value as Medicamento) : null,
                  })
                }
                disabled={stage === 'validado'}
                className="input-elegant"
              >
                <option value="">— escolha —</option>
                {(Object.keys(MEDICAMENTO_LABEL) as Medicamento[]).map((m) => (
                  <option key={m} value={m}>
                    {MEDICAMENTO_LABEL[m]}
                  </option>
                ))}
              </select>
            </FieldBlock>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Dose */}
              <FieldBlock label="dose (mg)">
                <select
                  value={sub.doseMg ?? ''}
                  onChange={(e) =>
                    setSub({ ...sub, doseMg: e.target.value ? Number(e.target.value) : null })
                  }
                  disabled={stage === 'validado'}
                  className="input-elegant"
                >
                  <option value="">—</option>
                  {DOSE_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d} mg
                    </option>
                  ))}
                </select>
              </FieldBlock>

              {/* Intervalo */}
              <FieldBlock label="intervalo">
                <select
                  value={sub.intervalo ?? ''}
                  onChange={(e) =>
                    setSub({
                      ...sub,
                      intervalo: e.target.value ? (e.target.value as Intervalo) : null,
                    })
                  }
                  disabled={stage === 'validado'}
                  className="input-elegant"
                >
                  <option value="">—</option>
                  {(Object.keys(INTERVALO_LABEL) as Intervalo[]).map((i) => (
                    <option key={i} value={i}>
                      {INTERVALO_LABEL[i]}
                    </option>
                  ))}
                </select>
              </FieldBlock>

              {/* Duração */}
              <FieldBlock label="duração">
                <select
                  value={sub.duracaoDias ?? ''}
                  onChange={(e) =>
                    setSub({
                      ...sub,
                      duracaoDias: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  disabled={stage === 'validado'}
                  className="input-elegant"
                >
                  <option value="">—</option>
                  {DURACAO_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d === 0 ? 'dose única' : `${d} dias`}
                    </option>
                  ))}
                </select>
              </FieldBlock>

              {/* Via */}
              <FieldBlock label="via">
                <select
                  value={sub.via ?? ''}
                  onChange={(e) =>
                    setSub({ ...sub, via: e.target.value ? (e.target.value as Via) : null })
                  }
                  disabled={stage === 'validado'}
                  className="input-elegant"
                >
                  <option value="">—</option>
                  {(Object.keys(VIA_LABEL) as Via[]).map((v) => (
                    <option key={v} value={v}>
                      {VIA_LABEL[v]}
                    </option>
                  ))}
                </select>
              </FieldBlock>
            </div>

            {/* Orientações */}
            <FieldBlock label="orientações ao paciente (marque as relevantes)">
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {(Object.keys(ORIENTACAO_LABEL) as Orientacao[]).map((o) => {
                  const checked = sub.orientacoes.includes(o);
                  return (
                    <label
                      key={o}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 transition ${
                        checked
                          ? 'border-wine bg-blush/60'
                          : 'border-line bg-card hover:border-wine/40'
                      } ${stage === 'validado' ? 'cursor-default opacity-80' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={stage === 'validado'}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSub({ ...sub, orientacoes: [...sub.orientacoes, o] });
                          } else {
                            setSub({
                              ...sub,
                              orientacoes: sub.orientacoes.filter((x) => x !== o),
                            });
                          }
                        }}
                        className="h-4 w-4 accent-wine"
                      />
                      <span className="font-body text-[13px] italic text-txt">
                        {ORIENTACAO_LABEL[o]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </FieldBlock>
          </div>
        </div>

        {/* Validação */}
        {stage === 'prescrevendo' && (
          <div className="mt-6 flex items-center justify-end">
            <button
              type="button"
              onClick={validar}
              disabled={!sub.medicamento}
              className="btn-primary"
            >
              validar receita
            </button>
          </div>
        )}

        {stage === 'validado' && validation && (
          <>
            <div className="card mt-6 border-[var(--blush-stroke)] bg-blush p-7 shadow-lift">
              <Eyebrow>conferência da receita</Eyebrow>
              <ul className="mt-4 space-y-3">
                {validation.results.map((r, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {r.ok ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-wine" strokeWidth={2.2} />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-mute" strokeWidth={2.2} />
                    )}
                    <p className="font-body text-[14px] leading-relaxed text-txt">{r.message}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card mt-6 p-7">
              <Eyebrow>por quê</Eyebrow>
              <p className="mt-3 font-body text-[15px] leading-relaxed text-txt/85">
                {scenario.teaching}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={tryAgain} className="btn-ghost">
                refazer essa
              </button>
              <button type="button" onClick={startScenario} className="btn-primary">
                próximo paciente
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1.5 block font-display text-[11px] uppercase tracking-[0.22em] text-mute">
        {label}
      </span>
      {children}
    </div>
  );
}
