import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Laugh, Stethoscope } from 'lucide-react';
import DayChip from '../components/DayChip';
import Eyebrow from '../components/ui/Eyebrow';
import Field from '../components/ui/Field';
import RomanNumeral from '../components/ui/RomanNumeral';
import { logout } from '../lib/auth';
import { db } from '../lib/db';
import { useUser } from '../lib/useUser';

const GOAL_PRESETS = [5, 10, 15, 20, 30, 50];

export default function Profile() {
  const navigate = useNavigate();
  const { user, refresh, updateUser } = useUser();
  const [name, setName] = useState(user?.name ?? '');
  const [partner, setPartner] = useState(user?.partnerName ?? '');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  useEffect(() => {
    if (typeof user?.partnerName === 'string') setPartner(user.partnerName);
  }, [user?.partnerName]);

  if (!user) return null;

  async function saveName() {
    if (!name.trim()) return;
    setSaveError(null);
    setSavingName(true);
    try {
      await updateUser({ name: name.trim(), partnerName: partner.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Falha ao salvar.';
      setSaveError(message);
      console.error('saveName falhou:', e);
    } finally {
      setSavingName(false);
    }
  }

  async function setDisplayMode(mode: 'namorado' | 'doutora' | 'irmao') {
    if (!user || user.displayMode === mode) return;
    try {
      await updateUser({ displayMode: mode });
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Falha ao trocar o modo.');
      console.error('setDisplayMode falhou:', e);
    }
  }

  async function setDailyGoal(goal: number) {
    if (!user || user.dailyGoal === goal) return;
    try {
      await updateUser({ dailyGoal: goal });
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Falha ao salvar a meta.');
      console.error('setDailyGoal falhou:', e);
    }
  }

  function handleLogout() {
    logout();
    refresh();
    navigate('/login');
  }

  async function resetEverything() {
    if (!confirm('Isso apaga TUDO (cursos, questões, histórico, login). Tem certeza?')) return;
    db.reset();
    logout();
    refresh();
    navigate('/login');
  }

  const currentMode = user.displayMode;
  const dirty =
    name.trim() !== user.name || partner.trim() !== (user.partnerName ?? '');

  const modeLabel: Record<'namorado' | 'doutora' | 'irmao', string> = {
    namorado: 'modo namorado',
    doutora: 'modo doutora',
    irmao: 'modo irmão',
  };

  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-4xl px-6 py-14 sm:px-10 sm:py-20 lg:px-20">
        <Eyebrow>conta</Eyebrow>
        <h1 className="mt-4 font-display font-light leading-[1.05] text-ink text-[clamp(2.5rem,7vw,4.5rem)]">
          Perfil
        </h1>

        {/* I — Seus dados */}
        <div className="card mt-10 p-8 sm:p-10">
          <div className="flex items-baseline gap-4">
            <RomanNumeral value="I" />
            <h2 className="font-display text-2xl italic text-ink">Seus dados</h2>
          </div>

          <div className="mt-6 space-y-5">
            <Field
              id="name"
              label="nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Field id="email" label="e-mail" readonlyValue={user.email} />
            <Field
              id="partner"
              label="nome do seu namorado(a)"
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              placeholder="quem assina os bilhetes (ex: César)"
              hint="aparece como assinatura nos bilhetes no modo namorado. No modo irmão a assinatura é sempre 'irmão'."
            />
          </div>

          {saveError && (
            <div className="mt-4 rounded-2xl border-l-2 border-red bg-red-soft px-4 py-3 font-body text-sm text-txt">
              {saveError}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            {saved && (
              <span className="font-display text-sm italic text-wine">salvo</span>
            )}
            <button
              type="button"
              onClick={saveName}
              disabled={savingName || !name.trim() || !dirty}
              className="btn-primary disabled:cursor-not-allowed"
            >
              {savingName ? 'salvando…' : 'salvar'}
            </button>
          </div>
        </div>

        {/* II — Modo de mensagens */}
        <div className="card mt-6 p-8 sm:p-10">
          <div className="flex items-baseline gap-4">
            <RomanNumeral value="II" />
            <h2 className="font-display text-2xl italic text-ink">Modo de mensagens</h2>
          </div>

          <p className="mt-5 font-body text-[15px] leading-relaxed text-txt/85">
            No <strong className="text-ink">modo namorado</strong> as frases são carinhosas. No{' '}
            <strong className="text-ink">modo doutora</strong> ficam neutras (bom para estudar em
            público). No <strong className="text-ink">modo irmão</strong> tem carinho + zoeira de
            quem te conhece desde criança.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            <ModeOption
              active={currentMode === 'namorado'}
              Icon={Heart}
              label="modo namorado"
              sample="boa, amor, mandou bem demais"
              onClick={() => setDisplayMode('namorado')}
            />
            <ModeOption
              active={currentMode === 'irmao'}
              Icon={Laugh}
              label="modo irmão"
              sample="olha, se eu fosse seu paciente eu confiava"
              onClick={() => setDisplayMode('irmao')}
            />
            <ModeOption
              active={currentMode === 'doutora'}
              Icon={Stethoscope}
              label="modo doutora"
              sample="resposta correta. continue."
              onClick={() => setDisplayMode('doutora')}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-blush/60 px-5 py-4">
            <span className="font-display italic text-wine">
              Atualmente: {modeLabel[currentMode]}
            </span>
          </div>
        </div>

        {/* III — Meta diária */}
        <div className="card mt-6 p-8 sm:p-10">
          <div className="flex items-baseline gap-4">
            <RomanNumeral value="III" />
            <h2 className="font-display text-2xl italic text-ink">Meta diária</h2>
          </div>
          <p className="mt-5 font-body text-[15px] leading-relaxed text-txt/85">
            Quantas questões você quer responder por dia. A meta aparece no Início com um anel de
            progresso e marca a sequência de dias seguidos.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {GOAL_PRESETS.map((n) => (
              <DayChip
                key={n}
                value={n}
                active={(user.dailyGoal ?? 15) === n}
                onClick={() => setDailyGoal(n)}
              />
            ))}
          </div>
        </div>

        {/* IV — Sessão */}
        <div className="card mt-6 p-8 sm:p-10">
          <div className="flex items-baseline gap-4">
            <RomanNumeral value="IV" />
            <h2 className="font-display text-2xl italic text-ink">Sessão</h2>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={handleLogout} className="btn-ghost">
              sair
            </button>
            <button
              type="button"
              onClick={resetEverything}
              className="inline-flex min-h-touch items-center justify-center rounded-full border border-red px-7 py-3 font-display text-[14px] italic text-red transition active:scale-[0.98] hover:bg-red-soft"
            >
              apagar tudo
            </button>
          </div>
        </div>
      </div>
    </section>
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
      className={`min-h-touch rounded-2xl border p-5 text-left transition active:scale-[0.99] ${
        active
          ? 'bg-blush border-[var(--blush-stroke)] shadow-soft'
          : 'border-line bg-card hover:border-wine/40'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
            active ? 'bg-wine text-[#FBEFEC]' : 'bg-blush text-wine'
          }`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.6} />
        </span>
        <span className="font-display text-lg italic text-ink">{label}</span>
      </div>
      <p className="mt-3 font-body text-[14px] italic leading-relaxed text-mute">
        &ldquo;{sample}&rdquo;
      </p>
    </button>
  );
}
