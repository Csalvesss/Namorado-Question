import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Heart, Sparkles, Stethoscope } from 'lucide-react';
import { getAnthropicKey, setAnthropicKey } from '../lib/ai-client';
import { logout } from '../lib/auth';
import { db } from '../lib/db';
import { useUser } from '../lib/useUser';

const GOAL_PRESETS = [5, 10, 15, 20, 30, 50];

export default function Profile() {
  const navigate = useNavigate();
  const { user, refresh, updateUser } = useUser();
  const [name, setName] = useState(user?.name ?? '');
  const [saved, setSaved] = useState(false);
  const [aiKey, setAiKey] = useState(getAnthropicKey() ?? '');
  const [aiKeyVisible, setAiKeyVisible] = useState(false);
  const [aiKeySaved, setAiKeySaved] = useState(false);

  if (!user) return null;

  function saveName() {
    if (!name.trim()) return;
    updateUser({ name: name.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function setDisplayMode(mode: 'namorado' | 'doutora') {
    if (!user || user.displayMode === mode) return;
    updateUser({ displayMode: mode });
  }

  function setDailyGoal(goal: number) {
    if (!user || user.dailyGoal === goal) return;
    updateUser({ dailyGoal: goal });
  }

  function saveAiKey() {
    setAnthropicKey(aiKey.trim());
    setAiKeySaved(true);
    setTimeout(() => setAiKeySaved(false), 2000);
  }

  function handleLogout() {
    logout();
    refresh();
    navigate('/login');
  }

  function resetEverything() {
    if (!confirm('Isso apaga TUDO (cursos, questões, histórico, login). Tem certeza?')) return;
    db.reset();
    refresh();
    navigate('/login');
  }

  const isNamorado = user.displayMode === 'namorado';

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <header>
        <div className="eyebrow-gold mb-3">conta</div>
        <h1 className="display-title-sm">Perfil</h1>
      </header>

      <section className="card space-y-4 p-6 sm:p-7">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-2xl italic leading-none text-gold opacity-60">I</span>
          <h2 className="font-serif text-xl italic text-wine-deep">Seus dados</h2>
        </div>
        <div>
          <label htmlFor="name" className="mb-1 block text-[11px] uppercase tracking-[0.22em] text-muted">
            Nome
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-elegant"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-[0.22em] text-muted">E-mail</label>
          <div className="text-base text-ink">{user.email}</div>
        </div>
        <div className="flex justify-end gap-3">
          {saved && <span className="self-center text-xs italic text-green">salvo</span>}
          <button onClick={saveName} className="btn-primary">
            Salvar
          </button>
        </div>
      </section>

      <section className="card space-y-4 p-6 sm:p-7">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-2xl italic leading-none text-gold opacity-60">II</span>
          <h2 className="font-serif text-xl italic text-wine-deep">Modo de mensagens</h2>
        </div>
        <p className="text-sm leading-relaxed text-ink-soft">
          No <strong>modo namorado</strong> aparecem as frases carinhosas. No{' '}
          <strong>modo doutora</strong> elas ficam neutras e profissionais (bom para estudar em
          público).
        </p>

        <div className="grid grid-cols-2 gap-3">
          <ModeOption
            active={isNamorado}
            Icon={Heart}
            label="modo namorado"
            sample="boa, amor, mandou bem demais"
            onClick={() => setDisplayMode('namorado')}
          />
          <ModeOption
            active={!isNamorado}
            Icon={Stethoscope}
            label="modo doutora"
            sample="resposta correta. continue."
            onClick={() => setDisplayMode('doutora')}
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl bg-bg-soft px-4 py-3">
          <span className="font-serif italic text-wine-deep">
            Atualmente: {isNamorado ? 'modo namorado' : 'modo doutora'}
          </span>
          <button
            onClick={() => setDisplayMode(isNamorado ? 'doutora' : 'namorado')}
            className="btn-secondary text-xs"
          >
            Trocar para {isNamorado ? 'doutora' : 'namorado'}
          </button>
        </div>
      </section>

      <section className="card space-y-4 p-6 sm:p-7">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-2xl italic leading-none text-gold opacity-60">III</span>
          <h2 className="font-serif text-xl italic text-wine-deep">Meta diária</h2>
        </div>
        <p className="text-sm leading-relaxed text-ink-soft">
          Quantas questões você quer responder por dia. A meta aparece no Dashboard com um anel
          de progresso e marca a sequência de dias seguidos.
        </p>
        <div className="flex flex-wrap gap-2">
          {GOAL_PRESETS.map((n) => {
            const active = (user.dailyGoal ?? 15) === n;
            return (
              <button
                key={n}
                onClick={() => setDailyGoal(n)}
                className={`inline-flex min-h-touch items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition active:scale-[0.98] ${
                  active
                    ? 'border-wine bg-wine text-white'
                    : 'border-line bg-paper text-ink-soft hover:border-rose'
                }`}
              >
                <span className="font-serif font-semibold">{n}</span>
                <span className="text-[11px] uppercase tracking-[0.18em]">
                  {active ? 'questões/dia' : '/dia'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card space-y-4 p-6 sm:p-7">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-2xl italic leading-none text-gold opacity-60">IV</span>
          <h2 className="font-serif text-xl italic text-wine-deep">Geração com IA</h2>
        </div>
        <p className="text-sm leading-relaxed text-ink-soft">
          A geração automática de flashcards usa a API da Anthropic. Cole sua chave abaixo (começa
          com <code className="font-mono text-wine">sk-ant-</code>) para liberar o gerador no Modo
          Autor. A chave fica salva só no seu navegador.
        </p>
        <div>
          <label className="mb-1 block text-[11px] uppercase tracking-[0.22em] text-muted">
            Chave da Anthropic
          </label>
          <div className="flex gap-2">
            <input
              type={aiKeyVisible ? 'text' : 'password'}
              value={aiKey}
              onChange={(e) => setAiKey(e.target.value)}
              className="input-elegant font-mono text-sm"
              placeholder="sk-ant-..."
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => setAiKeyVisible((v) => !v)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-muted transition hover:border-wine hover:text-wine"
              aria-label={aiKeyVisible ? 'Esconder chave' : 'Mostrar chave'}
            >
              {aiKeyVisible ? (
                <EyeOff className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted transition hover:text-wine"
          >
            <Sparkles className="h-3 w-3" strokeWidth={1.75} />
            Onde pegar a chave
          </a>
          <div className="flex items-center gap-3">
            {aiKeySaved && <span className="text-xs italic text-green">salva</span>}
            <button onClick={saveAiKey} className="btn-primary">
              Salvar chave
            </button>
          </div>
        </div>
      </section>

      <section className="card space-y-4 p-6 sm:p-7">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-2xl italic leading-none text-gold opacity-60">V</span>
          <h2 className="font-serif text-xl italic text-wine-deep">Sessão</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleLogout} className="btn-secondary">
            Sair
          </button>
          <button
            onClick={resetEverything}
            className="inline-flex min-h-touch items-center justify-center rounded-full border border-red px-7 py-3 text-sm font-semibold uppercase tracking-wider text-red transition active:scale-[0.98] hover:bg-red-soft"
          >
            Apagar tudo
          </button>
        </div>
      </section>
    </div>
  );
}

interface ModeOptionProps {
  active: boolean;
  Icon: typeof Heart;
  label: string;
  sample: string;
  onClick: () => void;
}

function ModeOption({ active, Icon, label, sample, onClick }: ModeOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group min-h-touch rounded-xl border p-4 text-left transition active:scale-[0.99] ${
        active
          ? 'border-wine bg-rose-soft/40 shadow-soft'
          : 'border-line bg-paper hover:border-wine hover:bg-bg-soft'
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
            active ? 'bg-wine text-white' : 'bg-rose-soft text-wine-deep'
          }`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <span className="font-serif text-base italic text-wine-deep">{label}</span>
      </div>
      <p className="font-serif text-sm italic leading-snug text-ink-soft">"{sample}"</p>
    </button>
  );
}
