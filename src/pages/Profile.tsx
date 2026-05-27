import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Stethoscope } from 'lucide-react';
import { logout } from '../lib/auth';
import { db } from '../lib/db';
import { useUser } from '../lib/useUser';

export default function Profile() {
  const navigate = useNavigate();
  const { user, refresh, updateUser } = useUser();
  const [name, setName] = useState(user?.name ?? '');
  const [saved, setSaved] = useState(false);

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
