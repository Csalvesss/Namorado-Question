import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Eyebrow from '../components/ui/Eyebrow';
import { useUser } from '../lib/useUser';
import {
  adminBlockUser,
  adminDirectApprove,
  adminUnblockUser,
  listAccessLogs,
  listAllUsers,
  listMaterialsForUser,
  listSignupRequests,
} from '../lib/admin-queries';
import {
  approveSignupAndGenerateCode,
  createImpersonationToken,
  denySignup,
} from '../lib/cloud-functions';
import { signInWithCustomToken } from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase';
import { effectiveStatus } from '../lib/admin';
import ProvaValidationInner from '../components/admin/ProvaValidationInner';
import type { AccessLog, Material, SignupRequest, UserProfile } from '../types';

type Tab = 'users' | 'requests' | 'logs' | 'materials' | 'prova';

export default function Admin() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('requests');

  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-10 sm:py-20 lg:px-16">
        <Eyebrow>painel</Eyebrow>
        <h1 className="mt-4 font-display font-light leading-[1.05] text-ink text-[clamp(2.5rem,7vw,4.5rem)]">
          Admin
        </h1>
        <p className="mt-4 max-w-xl font-body text-base italic leading-relaxed text-mute">
          logada como <strong className="not-italic text-ink">{user?.email}</strong>.
          Tudo aqui é restrito por regras do Firestore + Cloud Functions.
        </p>

        <div className="mt-10 flex flex-wrap gap-2 border-b border-[var(--blush-stroke)]">
          {(
            [
              ['requests', 'solicitações'],
              ['users', 'usuárias'],
              ['logs', 'logs de acesso'],
              ['materials', 'conteúdos'],
              ['prova', 'validar prova integrada'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={
                'px-4 py-2 font-display text-sm italic ' +
                (tab === k
                  ? 'border-b-2 border-wine text-ink'
                  : 'text-mute hover:text-ink')
              }
            >
              {label}
            </button>
          ))}
          <div className="ml-auto py-2">
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="font-display text-sm italic text-mute underline-offset-4 hover:underline"
            >
              voltar ao app
            </button>
          </div>
        </div>

        <div className="mt-8">
          {tab === 'requests' && <RequestsTab />}
          {tab === 'users' && <UsersTab />}
          {tab === 'logs' && <LogsTab />}
          {tab === 'materials' && <MaterialsTab />}
          {tab === 'prova' && <ProvaValidationTab />}
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// Solicitações de cadastro
// ===========================================================================

function RequestsTab() {
  const { user } = useUser();
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedCodes, setGeneratedCodes] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listSignupRequests(filter === 'pending' ? 'pending' : undefined);
      setRequests(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleApproveWithCode(req: SignupRequest) {
    const res = await approveSignupAndGenerateCode(req.uid);
    if (!res.ok) {
      alert(res.error);
      return;
    }
    setGeneratedCodes((prev) => ({ ...prev, [req.uid]: res.code }));
    void refresh();
  }

  async function handleApproveDirect(req: SignupRequest) {
    if (!user) return;
    if (!confirm(`aprovar ${req.email} sem código (modo direto)?`)) return;
    try {
      await adminDirectApprove(req.uid, user.uid);
      void refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'falha ao aprovar');
    }
  }

  async function handleDeny(req: SignupRequest) {
    const reason = prompt(`negar ${req.email}. motivo (opcional):`) ?? '';
    const res = await denySignup(req.uid, reason || undefined);
    if (!res.ok) {
      alert(res.error);
      return;
    }
    void refresh();
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'pending' | 'all')}
          className="rounded-lg border border-[var(--blush-stroke)] bg-paper px-3 py-2 font-display text-sm text-ink"
        >
          <option value="pending">só pendentes</option>
          <option value="all">todas</option>
        </select>
        <button
          type="button"
          onClick={() => void refresh()}
          className="font-display text-sm italic text-mute underline-offset-4 hover:underline"
        >
          recarregar
        </button>
      </div>

      {loading && <p className="mt-6 font-display italic text-mute">carregando…</p>}
      {error && (
        <p className="mt-6 rounded-2xl border-l-2 border-red bg-red-soft px-4 py-3 font-body text-sm text-txt">
          {error}
        </p>
      )}
      {!loading && !error && requests.length === 0 && (
        <p className="mt-6 font-display italic text-mute">nada aqui.</p>
      )}

      <ul className="mt-6 space-y-4">
        {requests.map((r) => (
          <li key={r.id} className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-lg italic text-ink">{r.name}</p>
                <p className="font-body text-sm text-mute">{r.email}</p>
                <p className="mt-1 font-body text-xs text-mute">
                  pedido em {new Date(r.requestedAt).toLocaleString('pt-BR')}
                </p>
                <p className="mt-1 font-body text-xs text-mute">
                  status: <strong className="text-ink">{r.status}</strong>
                </p>
              </div>
              <div className="font-body text-xs text-mute sm:text-right">
                <p>
                  IP: <code className="text-ink">{r.ip ?? '—'}</code>
                </p>
                <p>{[r.geo?.city, r.geo?.region, r.geo?.country].filter(Boolean).join(', ') || '—'}</p>
                {r.geo?.org && <p>{r.geo.org}</p>}
                {r.userAgent && (
                  <p className="mt-1 max-w-xs truncate" title={r.userAgent}>
                    {r.userAgent}
                  </p>
                )}
              </div>
            </div>

            {generatedCodes[r.uid] && (
              <div className="mt-4 rounded-2xl border-l-2 border-emerald-600 bg-emerald-50 px-4 py-3">
                <p className="font-body text-xs text-mute">código gerado — copia e manda pra ela:</p>
                <code className="mt-1 block font-display text-2xl tracking-[0.2em] text-ink">
                  {generatedCodes[r.uid]}
                </code>
              </div>
            )}

            {r.status === 'pending' && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleApproveWithCode(r)}
                  className="rounded-full bg-wine px-4 py-2 font-display text-sm italic text-paper"
                >
                  aprovar com código
                </button>
                <button
                  type="button"
                  onClick={() => void handleApproveDirect(r)}
                  className="rounded-full border border-[var(--blush-stroke)] px-4 py-2 font-display text-sm italic text-ink"
                >
                  aprovar direto (sem código)
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeny(r)}
                  className="rounded-full border border-red px-4 py-2 font-display text-sm italic text-red"
                >
                  negar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ===========================================================================
// Usuárias
// ===========================================================================

function UsersTab() {
  const { user: adminUser } = useUser();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listAllUsers();
      setUsers(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'erro ao carregar.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q),
    );
  }, [users, search]);

  async function handleImpersonate(target: UserProfile) {
    if (!adminUser) return;
    if (!confirm(`logar como ${target.email}? Você vai precisar fazer login de novo pra voltar como admin.`)) {
      return;
    }
    const res = await createImpersonationToken(target.uid);
    if (!res.ok) {
      alert(res.error);
      return;
    }
    try {
      sessionStorage.setItem('guava:impersonatedBy', adminUser.email);
      await signInWithCustomToken(firebaseAuth, res.token);
      window.location.href = '/app';
    } catch (e) {
      alert(e instanceof Error ? e.message : 'erro ao trocar de sessão');
    }
  }

  async function handleBlock(u: UserProfile) {
    if (!confirm(`bloquear ${u.email}?`)) return;
    try {
      await adminBlockUser(u.uid);
      void refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'falha ao bloquear');
    }
  }

  async function handleUnblock(u: UserProfile) {
    try {
      await adminUnblockUser(u.uid);
      void refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'falha ao desbloquear');
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="filtrar por nome ou e-mail"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md rounded-lg border border-[var(--blush-stroke)] bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-rose"
      />
      {loading && <p className="mt-6 font-display italic text-mute">carregando…</p>}
      {error && (
        <p className="mt-6 rounded-2xl border-l-2 border-red bg-red-soft px-4 py-3 font-body text-sm text-txt">
          {error}
        </p>
      )}
      <ul className="mt-6 space-y-3">
        {filtered.map((u) => {
          const status = effectiveStatus(u);
          return (
            <li
              key={u.uid}
              className="card flex flex-wrap items-center justify-between gap-4 p-5"
            >
              <div>
                <p className="font-display text-base italic text-ink">{u.name}</p>
                <p className="font-body text-xs text-mute">{u.email}</p>
                <p className="mt-1 font-body text-xs text-mute">
                  {u.role === 'admin' && (
                    <span className="mr-2 rounded-full bg-wine px-2 py-0.5 text-paper">admin</span>
                  )}
                  status: <strong className="text-ink">{status}</strong> ·{' '}
                  criado em {new Date(u.createdAt).toLocaleDateString('pt-BR')} · trilha:{' '}
                  {u.track ?? 'medicina'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {u.role !== 'admin' && (
                  <button
                    type="button"
                    onClick={() => void handleImpersonate(u)}
                    className="rounded-full border border-[var(--blush-stroke)] px-3 py-1.5 font-display text-xs italic text-ink"
                  >
                    ver como
                  </button>
                )}
                {status === 'blocked' ? (
                  <button
                    type="button"
                    onClick={() => void handleUnblock(u)}
                    className="rounded-full border border-[var(--blush-stroke)] px-3 py-1.5 font-display text-xs italic text-ink"
                  >
                    desbloquear
                  </button>
                ) : (
                  u.role !== 'admin' && (
                    <button
                      type="button"
                      onClick={() => void handleBlock(u)}
                      className="rounded-full border border-red px-3 py-1.5 font-display text-xs italic text-red"
                    >
                      bloquear
                    </button>
                  )
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ===========================================================================
// Logs de acesso
// ===========================================================================

const KIND_LABELS: Record<AccessLog['kind'], string> = {
  signin: 'entrou',
  signup: 'cadastro',
  session: 'sessão',
  impersonate: 'acesso admin',
  pageview: 'tela',
  cadastro: 'conta criada',
};

type LogFilter = 'todos' | 'telas' | 'acessos';

function LogsTab() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LogFilter>('todos');
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);
    // Junta os logs REAIS (/access_logs) com o HISTÓRICO derivado de cada
    // usuária: quem entrou antes de existir o log de acesso não tem evento
    // gravado, então sintetizamos um "conta criada" a partir de users.createdAt
    // (enriquecido com IP/geo/hora do signup_request quando houver).
    Promise.all([listAccessLogs(500), listAllUsers(), listSignupRequests()])
      .then(([realLogs, users, requests]) => {
        if (!active) return;
        const reqByUid = new Map(requests.map((r) => [r.uid, r]));
        const synth: AccessLog[] = users.map((u) => {
          const r = reqByUid.get(u.uid);
          return {
            id: `cadastro-${u.uid}`,
            uid: u.uid,
            email: u.email,
            when: r?.requestedAt ?? u.createdAt,
            kind: 'cadastro',
            ip: r?.ip,
            geo: r?.geo,
            userAgent: r?.userAgent,
          };
        });
        setLogs([...realLogs, ...synth].sort((a, b) => b.when - a.when));
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'erro');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => load(), [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((l) => {
      if (filter === 'telas' && l.kind !== 'pageview') return false;
      if (filter === 'acessos' && l.kind === 'pageview') return false;
      if (q && !l.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [logs, filter, search]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-full border border-[var(--blush-stroke)] p-1">
          {(
            [
              ['todos', 'tudo'],
              ['telas', 'telas'],
              ['acessos', 'logins'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={
                'rounded-full px-3 py-1 font-display text-xs italic transition ' +
                (filter === k ? 'bg-wine text-paper' : 'text-mute hover:text-ink')
              }
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="filtrar por e-mail"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-[var(--blush-stroke)] bg-paper px-3 py-2 font-body text-sm text-ink outline-none focus:border-rose"
        />
        <button
          type="button"
          onClick={() => load()}
          className="font-display text-sm italic text-mute underline-offset-4 hover:underline"
        >
          recarregar
        </button>
        <span className="ml-auto font-body text-xs text-mute">
          {filtered.length} registro{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      {loading && <p className="mt-6 font-display italic text-mute">carregando…</p>}
      {error && (
        <p className="mt-6 rounded-2xl border-l-2 border-red bg-red-soft px-4 py-3 font-body text-sm text-txt">
          {error}
        </p>
      )}
      {!loading && !error && filtered.length === 0 && (
        <p className="mt-6 font-display italic text-mute">nada por aqui.</p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full font-body text-sm">
            <thead>
              <tr className="border-b border-[var(--blush-stroke)] text-left font-display text-[11px] uppercase tracking-[0.18em] text-mute">
                <th className="py-2 pr-4">quando</th>
                <th className="py-2 pr-4">quem</th>
                <th className="py-2 pr-4">evento</th>
                <th className="py-2 pr-4">tela</th>
                <th className="py-2 pr-4">IP</th>
                <th className="py-2 pr-4">localização</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-[var(--blush-stroke)] align-top">
                  <td className="whitespace-nowrap py-2 pr-4 text-mute">
                    {new Date(l.when).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-2 pr-4 text-ink">{l.email}</td>
                  <td className="whitespace-nowrap py-2 pr-4">
                    <span
                      className={
                        'rounded-full px-2 py-0.5 text-xs ' +
                        (l.kind === 'pageview' ? 'bg-blush text-ink' : 'bg-rose-soft text-wine')
                      }
                    >
                      {KIND_LABELS[l.kind] ?? l.kind}
                    </span>
                    {l.impersonatedBy && (
                      <span
                        className="ml-2 rounded-full bg-wine px-2 py-0.5 text-xs text-paper"
                        title={`admin: ${l.impersonatedBy}`}
                      >
                        via admin
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {l.kind === 'pageview' ? (
                      <div>
                        <span className="text-ink">{l.screen ?? '—'}</span>
                        {l.path && (
                          <span className="ml-2 font-mono text-[11px] text-mute">{l.path}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-mute">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap py-2 pr-4 font-mono text-xs text-mute">
                    {l.ip ?? '—'}
                  </td>
                  <td className="py-2 pr-4 text-mute">
                    {[l.geo?.city, l.geo?.region, l.geo?.country].filter(Boolean).join(', ') || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// Conteúdos (materiais por usuária)
// ===========================================================================

function MaterialsTab() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void listAllUsers().then(setUsers);
  }, []);

  useEffect(() => {
    if (!selected) {
      setMaterials([]);
      return;
    }
    setLoading(true);
    void listMaterialsForUser(selected)
      .then(setMaterials)
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside>
        <Eyebrow>usuárias</Eyebrow>
        <ul className="mt-4 max-h-[60vh] space-y-1 overflow-y-auto">
          {users.map((u) => (
            <li key={u.uid}>
              <button
                type="button"
                onClick={() => setSelected(u.uid)}
                className={
                  'block w-full rounded-lg px-3 py-2 text-left font-body text-sm ' +
                  (selected === u.uid ? 'bg-blush text-ink' : 'text-mute hover:bg-blush')
                }
              >
                <strong className="block text-ink">{u.name}</strong>
                <span className="text-xs">{u.email}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section>
        {!selected ? (
          <p className="font-display italic text-mute">
            selecione uma usuária pra ver/upar conteúdos.
          </p>
        ) : (
          <MaterialsForUser
            ownerUid={selected}
            materials={materials}
            loading={loading}
            onChanged={() => {
              if (selected) void listMaterialsForUser(selected).then(setMaterials);
            }}
          />
        )}
      </section>
    </div>
  );
}

function MaterialsForUser({
  ownerUid,
  materials,
  loading,
  onChanged,
}: {
  ownerUid: string;
  materials: Material[];
  loading: boolean;
  onChanged: () => void;
}) {
  return (
    <div>
      <p className="font-body text-sm text-mute">
        upload de PDFs/arquivos será habilitado quando o Storage estiver ativo no Firebase
        Console. Quando subir, esses arquivos aparecem aqui — só essa usuária e o admin
        conseguem ver.
      </p>
      <div className="mt-6 rounded-2xl border-2 border-dashed border-[var(--blush-stroke)] p-8 text-center">
        <p className="font-display italic text-mute">
          upload de arquivos (em breve — depende do Storage ativado)
        </p>
        <p className="mt-2 font-body text-xs text-mute">
          owner uid: <code>{ownerUid}</code>
        </p>
      </div>
      <h3 className="mt-8 font-display text-lg italic text-ink">já enviados</h3>
      {loading && <p className="mt-2 font-display italic text-mute">carregando…</p>}
      {!loading && materials.length === 0 && (
        <p className="mt-2 font-display italic text-mute">nenhum arquivo ainda.</p>
      )}
      <ul className="mt-3 space-y-2">
        {materials.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between rounded-xl border border-[var(--blush-stroke)] p-3 font-body text-sm"
          >
            <div>
              <p className="text-ink">{m.name}</p>
              <p className="text-xs text-mute">
                {(m.size / 1024).toFixed(1)} KB · {m.contentType} ·{' '}
                {new Date(m.uploadedAt).toLocaleString('pt-BR')}
              </p>
            </div>
            <span className="font-display text-xs italic text-mute">
              {/* TODO: ações download/excluir quando Storage estiver ativo */}
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onChanged}
        className="mt-4 font-display text-sm italic text-mute underline-offset-4 hover:underline"
      >
        recarregar
      </button>
    </div>
  );
}

// ===========================================================================
// Aba: Validar Prova Integrada — componente em src/components/admin/
// ===========================================================================

function ProvaValidationTab() {
  return <ProvaValidationInner />;
}

