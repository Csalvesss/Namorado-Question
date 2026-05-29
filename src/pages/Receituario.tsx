import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, FileSignature, Sparkles, X } from 'lucide-react';
import Eyebrow from '../components/ui/Eyebrow';
import IconChip from '../components/ui/IconChip';
import ReceitaArt from '../components/ReceitaArt';
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
import {
  listSimulacoes,
  pickRandomSimulacao,
  type ReceitaSimulacao,
} from '../data/simulacao';

type Modo = 'guiado' | 'simulacao';
type Stage =
  | 'intro'
  | 'prescrevendo'
  | 'validado'
  | 'simulando'
  | 'simulando-revelado';

const EMPTY_SUB: ReceitaSubmissao = {
  medicamento: null,
  doseMg: null,
  intervalo: null,
  duracaoDias: null,
  via: null,
  orientacoes: [],
};

interface SimulacaoResposta {
  identificacao: string;
  comoUsar: string;
  orientacoes: string;
  sinaisAlarme: string;
}

const EMPTY_RESP: SimulacaoResposta = {
  identificacao: '',
  comoUsar: '',
  orientacoes: '',
  sinaisAlarme: '',
};

const DOSE_OPTIONS = [100, 250, 300, 400, 500, 600, 750, 875, 1000, 1500, 2000];
const DURACAO_OPTIONS = [0, 1, 2, 3, 5, 7, 10, 14];

export default function Receituario() {
  const { user } = useUser();
  const displayMode = user?.displayMode ?? 'namorado';
  const userTrack = user?.track ?? 'medicina';
  const isNamorado = displayMode === 'namorado';
  const isIrmao = displayMode === 'irmao';

  const [modo, setModo] = useState<Modo>('guiado');
  const [stage, setStage] = useState<Stage>('intro');

  // --- modo guiado ---
  const [scenario, setScenario] = useState<ReceitaScenario | null>(null);
  const [sub, setSub] = useState<ReceitaSubmissao>(EMPTY_SUB);
  const [validation, setValidation] = useState<ReturnType<typeof validarReceita> | null>(null);

  // --- modo simulação ---
  const [simulacao, setSimulacao] = useState<ReceitaSimulacao | null>(null);
  const [resp, setResp] = useState<SimulacaoResposta>(EMPTY_RESP);

  const simulacoesDisponiveis = listSimulacoes(userTrack);

  function startGuiado() {
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

  function startSimulacao() {
    if (simulacoesDisponiveis.length === 0) return;
    const next = pickRandomSimulacao(userTrack, simulacao?.id);
    setSimulacao(next);
    setResp(EMPTY_RESP);
    setStage('simulando');
  }

  function comecar() {
    if (modo === 'simulacao') {
      startSimulacao();
    } else {
      startGuiado();
    }
  }

  function validar() {
    if (!scenario) return;
    const r = validarReceita(sub, scenario);
    setValidation(r);
    setStage('validado');
  }

  function tryAgainGuiado() {
    setSub(EMPTY_SUB);
    setValidation(null);
    setStage('prescrevendo');
  }

  function revelar() {
    if (!simulacao) return;
    setStage('simulando-revelado');
  }

  function tryAgainSimulacao() {
    setResp(EMPTY_RESP);
    setStage('simulando');
  }

  function voltarIntro() {
    setStage('intro');
    setScenario(null);
    setSimulacao(null);
    setSub(EMPTY_SUB);
    setValidation(null);
    setResp(EMPTY_RESP);
  }

  // ------------------- INTRO -------------------
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
              Receituário
            </h1>
          </div>

          <p className="mt-4 max-w-xl font-body text-lg italic leading-relaxed text-mute">
            {isNamorado
              ? 'dois jeitos de treinar receita, doutora. um você monta, o outro você lê e orienta o paciente.'
              : isIrmao
                ? 'dois modos: ou tu monta a receita do zero, ou tu pega uma pronta e orienta o paciente. escolhe.'
                : 'dois modos de treino: construção estruturada de receita ou interpretação clínica de prescrição.'}
          </p>

          {/* Seletor de modo */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ModoCard
              ativo={modo === 'guiado'}
              onClick={() => setModo('guiado')}
              eyebrow="modo guiado"
              titulo="você prescreve"
              descricao="recebe o paciente e o diagnóstico, monta a receita campo a campo. a engine confere medicamento, dose, intervalo, duração, via e orientações."
              icon={FileSignature}
              meta={`${RECEITA_SCENARIOS.length} cenários`}
            />
            <ModoCard
              ativo={modo === 'simulacao'}
              onClick={() => setModo('simulacao')}
              eyebrow="modo simulação"
              titulo="você interpreta"
              descricao="o paciente chega trazendo uma receita pronta. você lê, identifica o que é, explica como usar e aponta os sinais de alarme. mais perto da consulta real."
              icon={Sparkles}
              meta={`${simulacoesDisponiveis.length} casos · ${userTrack}`}
            />
          </div>

          {/* Como funciona — adapta ao modo */}
          <div className="card mt-8 p-8 sm:p-10">
            <Eyebrow>como funciona</Eyebrow>
            {modo === 'guiado' ? (
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
            ) : (
              <ol className="mt-5 space-y-3 font-body text-[15px] leading-relaxed text-txt/85">
                <li>
                  <strong className="font-display not-italic text-ink">1.</strong> Um paciente
                  fictício chega ao consultório com uma receita em mãos.
                </li>
                <li>
                  <strong className="font-display not-italic text-ink">2.</strong> Você lê a receita
                  como leria de verdade — nome do medicamento, posologia, observações.
                </li>
                <li>
                  <strong className="font-display not-italic text-ink">3.</strong> Escreve, em texto
                  livre, o que diria ao paciente: <em className="not-italic text-wine">identificação,
                  como usar, orientações essenciais e sinais de alarme</em>.
                </li>
                <li>
                  <strong className="font-display not-italic text-ink">4.</strong> Revela o gabarito
                  e compara sua orientação com a do especialista — onde acertou, o que ficou de
                  fora, qual armadilha o paciente costuma cair.
                </li>
              </ol>
            )}
            <p className="mt-5 font-body text-sm italic text-mute">
              {modo === 'guiado'
                ? `Você monta a receita inteira como prescreveria na real. ${RECEITA_SCENARIOS.length} cenários no banco.`
                : `Mais próximo da consulta real: leitura, identificação e comunicação. ${simulacoesDisponiveis.length} cenários de ${userTrack} no banco.`}
            </p>
          </div>

          <div className="mt-10">
            <button
              type="button"
              onClick={comecar}
              disabled={modo === 'simulacao' && simulacoesDisponiveis.length === 0}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              começar
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ------------------- MODO GUIADO -------------------
  if (stage === 'prescrevendo' || stage === 'validado') {
    if (!scenario) return null;
    return (
      <section className="bg-paper pb-20">
        <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10 sm:py-16 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center rounded-full bg-blush px-4 py-1.5 font-display text-[11px] uppercase tracking-[0.22em] text-wine">
              modo guiado
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

          {stage === 'prescrevendo' && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={voltarIntro} className="btn-ghost">
                trocar modo
              </button>
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
                <button type="button" onClick={tryAgainGuiado} className="btn-ghost">
                  refazer essa
                </button>
                <button type="button" onClick={startGuiado} className="btn-primary">
                  próximo paciente
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    );
  }

  // ------------------- MODO SIMULAÇÃO -------------------
  if (!simulacao) return null;

  const revelado = stage === 'simulando-revelado';

  return (
    <section className="bg-paper pb-20">
      <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10 sm:py-16 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full bg-wine px-4 py-1.5 font-display text-[11px] uppercase tracking-[0.22em] text-paper">
            modo simulação
          </span>
          <div className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">
            {simulacao.especialidade} · {simulacao.patientTag}
          </div>
        </div>

        {/* Contexto do paciente — quem chegou, com o quê */}
        <div className="card mt-6 p-7 sm:p-9">
          <Eyebrow>o paciente chegou</Eyebrow>
          <p className="mt-3 font-body text-[16px] italic leading-relaxed text-txt sm:text-[17px]">
            {simulacao.patientContext}
          </p>
        </div>

        {/* A receita (arte) */}
        <div className="mt-6">
          <div className="mb-3 text-center">
            <span className="font-display text-[11px] uppercase tracking-[0.32em] text-mute">
              — a receita em mãos —
            </span>
          </div>
          <ReceitaArt receita={simulacao} />
        </div>

        {/* Form de interpretação */}
        <div className="card mt-8 p-7 sm:p-9">
          <Eyebrow>sua orientação ao paciente</Eyebrow>
          <p className="mt-2 font-body text-[13px] italic text-mute">
            escreva como falaria com o paciente em consultório. é treino de comunicação clínica —
            ninguém vê, ninguém julga.
          </p>

          <div className="mt-5 space-y-5">
            <SimField
              label="o que é esse medicamento?"
              helper="identifique o fármaco e a classe (ou esquema)"
              value={resp.identificacao}
              disabled={revelado}
              onChange={(v) => setResp({ ...resp, identificacao: v })}
            />
            <SimField
              label="como o paciente deve usar?"
              helper="dose, intervalo, duração, via e horário"
              value={resp.comoUsar}
              disabled={revelado}
              onChange={(v) => setResp({ ...resp, comoUsar: v })}
            />
            <SimField
              label="orientações essenciais"
              helper="o que NÃO pode passar batido — interações, horário, alimentos, comportamento"
              value={resp.orientacoes}
              disabled={revelado}
              onChange={(v) => setResp({ ...resp, orientacoes: v })}
              rows={4}
            />
            <SimField
              label="sinais de alarme"
              helper="quando o paciente precisa voltar imediatamente"
              value={resp.sinaisAlarme}
              disabled={revelado}
              onChange={(v) => setResp({ ...resp, sinaisAlarme: v })}
              rows={3}
            />
          </div>
        </div>

        {!revelado && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={voltarIntro} className="btn-ghost">
              trocar modo
            </button>
            <button
              type="button"
              onClick={revelar}
              disabled={!resp.identificacao.trim() && !resp.comoUsar.trim()}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              revelar gabarito
            </button>
          </div>
        )}

        {revelado && (
          <>
            {/* Gabarito do especialista */}
            <div className="card mt-6 border-[var(--blush-stroke)] bg-blush p-7 shadow-lift sm:p-9">
              <Eyebrow>gabarito do especialista</Eyebrow>

              <div className="mt-5 space-y-5">
                <GabaritoBlock
                  label="identificação"
                  texto={simulacao.answerKey.identificacao}
                />
                <GabaritoBlock
                  label="posologia resumida"
                  texto={simulacao.answerKey.posologiaResumida}
                />
                <GabaritoLista
                  label="instruções-chave"
                  itens={simulacao.answerKey.instrucoesChave}
                  tone="ok"
                />
                <GabaritoLista
                  label="sinais de alarme"
                  itens={simulacao.answerKey.sinaisAlarme}
                  tone="alarm"
                />
                <GabaritoLista
                  label="armadilhas comuns"
                  itens={simulacao.answerKey.armadilhas}
                  tone="warn"
                />
              </div>
            </div>

            <div className="card mt-6 p-7">
              <Eyebrow>por quê — raciocínio clínico</Eyebrow>
              <p className="mt-3 font-body text-[15px] leading-relaxed text-txt/85">
                {simulacao.teaching}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={tryAgainSimulacao} className="btn-ghost">
                refazer essa
              </button>
              <button type="button" onClick={startSimulacao} className="btn-primary">
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

function ModoCard({
  ativo,
  onClick,
  eyebrow,
  titulo,
  descricao,
  icon: Icon,
  meta,
}: {
  ativo: boolean;
  onClick: () => void;
  eyebrow: string;
  titulo: string;
  descricao: string;
  icon: typeof FileSignature;
  meta: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-2xl border p-6 text-left transition active:scale-[0.99] sm:p-7 ${
        ativo
          ? 'border-wine bg-blush/60 shadow-lift'
          : 'border-line bg-card hover:border-wine/50 hover:bg-blush/30'
      }`}
      aria-pressed={ativo}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
            ativo ? 'bg-wine text-paper' : 'bg-blush text-wine'
          }`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.6} />
        </span>
        <span className="font-display text-[10px] uppercase tracking-[0.22em] text-mute">
          {meta}
        </span>
      </div>
      <div className="mt-4 font-display text-[11px] uppercase tracking-[0.22em] text-wine">
        {eyebrow}
      </div>
      <h3 className="mt-1 font-display text-2xl italic leading-tight text-ink">{titulo}</h3>
      <p className="mt-3 font-body text-[14px] leading-relaxed text-txt/80">{descricao}</p>
    </button>
  );
}

function SimField({
  label,
  helper,
  value,
  disabled,
  onChange,
  rows = 2,
}: {
  label: string;
  helper: string;
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <span className="block font-display text-[11px] uppercase tracking-[0.22em] text-mute">
        {label}
      </span>
      <span className="block font-body text-[12px] italic text-mute/80">{helper}</span>
      <textarea
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="input-elegant mt-2 w-full resize-none font-body text-[14px] leading-relaxed disabled:cursor-default disabled:opacity-75"
        placeholder={disabled ? '' : 'sua resposta aqui…'}
      />
    </div>
  );
}

function GabaritoBlock({ label, texto }: { label: string; texto: string }) {
  return (
    <div>
      <span className="block font-display text-[11px] uppercase tracking-[0.22em] text-wine">
        {label}
      </span>
      <p className="mt-1.5 font-body text-[15px] leading-relaxed text-txt">{texto}</p>
    </div>
  );
}

function GabaritoLista({
  label,
  itens,
  tone,
}: {
  label: string;
  itens: string[];
  tone: 'ok' | 'warn' | 'alarm';
}) {
  const bulletClass =
    tone === 'alarm'
      ? 'bg-red-500/80'
      : tone === 'warn'
        ? 'bg-gold'
        : 'bg-wine';
  return (
    <div>
      <span className="block font-display text-[11px] uppercase tracking-[0.22em] text-wine">
        {label}
      </span>
      <ul className="mt-2 space-y-1.5">
        {itens.map((it, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${bulletClass}`} />
            <span className="font-body text-[14px] leading-relaxed text-txt">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
