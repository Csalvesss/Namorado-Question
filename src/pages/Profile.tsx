import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  function toggleMode() {
    updateUser({ displayMode: user!.displayMode === 'namorado' ? 'doutora' : 'namorado' });
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

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="text-center">
        <div className="mb-2 font-serif text-2xl tracking-[0.5em] text-rose opacity-70">· · ·</div>
        <h1 className="font-serif text-4xl italic text-wine-deep sm:text-5xl">Perfil</h1>
      </header>

      <section className="card space-y-4 p-6">
        <h2 className="font-serif text-xl italic text-wine-deep">Seus dados</h2>
        <div>
          <label htmlFor="name" className="mb-1 block text-xs uppercase tracking-[0.2em] text-muted">
            Nome
          </label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="input-elegant" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-muted">E-mail</label>
          <div className="text-base text-ink">{user.email}</div>
        </div>
        <div className="flex justify-end gap-3">
          {saved && <span className="self-center text-xs italic text-green">salvo</span>}
          <button onClick={saveName} className="btn-primary">Salvar</button>
        </div>
      </section>

      <section className="card space-y-3 p-6">
        <h2 className="font-serif text-xl italic text-wine-deep">Modo de mensagens</h2>
        <p className="text-sm text-ink-soft">
          No <strong>modo namorado</strong> aparecem as frases carinhosas. No <strong>modo doutora</strong> elas
          ficam neutras e profissionais (bom pra estudar em público).
        </p>
        <div className="flex items-center justify-between rounded-xl bg-bg-soft px-4 py-3">
          <span className="font-serif italic text-wine-deep">
            Atualmente: {user.displayMode === 'namorado' ? 'modo namorado' : 'modo doutora'}
          </span>
          <button onClick={toggleMode} className="btn-secondary">
            Trocar para {user.displayMode === 'namorado' ? 'doutora' : 'namorado'}
          </button>
        </div>
      </section>

      <section className="card space-y-3 p-6">
        <h2 className="font-serif text-xl italic text-wine-deep">Sessão</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleLogout} className="btn-secondary">Sair</button>
          <button
            onClick={resetEverything}
            className="rounded-full border border-red px-7 py-3 text-sm font-semibold uppercase tracking-wider text-red transition hover:bg-red-soft"
          >
            Apagar tudo
          </button>
        </div>
      </section>
    </div>
  );
}
