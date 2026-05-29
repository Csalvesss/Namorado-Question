import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import PageContainer from '../components/ui/PageContainer';
import AssistantBanner from '../components/agenda/AssistantBanner';
import WeekTimeline from '../components/agenda/WeekTimeline';
import WeekNavigator from '../components/agenda/WeekNavigator';
import EventEditor, {
  type EventEditorInitial,
} from '../components/agenda/EventEditor';
import SubjectEditor from '../components/agenda/SubjectEditor';
import { getOccurrencesByDay } from '../lib/agenda';
import { buildAssistantSummary } from '../lib/assistant';
import {
  getPermission,
  requestPermission,
  scheduleReminders,
} from '../lib/notifications';
import {
  STUDY_PLAN_CHANGE_EVENT,
  daysUntil,
  listClasses,
  listExams,
  listSubjects,
  listTasks,
  removeSubject,
  todayISO,
} from '../lib/studyPlan';
import {
  ORGANIZATION_TIPS,
  type DisplayMode,
} from '../data/assistant-copy';
import { useUser } from '../lib/useUser';
import type {
  AgendaOccurrence,
  NotificationPermission as AppNotificationPermission,
} from '../lib/agenda-types';
import type { ExamEvent, Subject } from '../types';

const MONTH_LABELS_SHORT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];
const WEEKDAYS_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

// ---------------------------------------------------------------------------
// Helpers de data
// ---------------------------------------------------------------------------

function startOfWeek(d: Date): Date {
  // Segunda-feira da semana de `d` (00:00 local).
  const day = d.getDay(); // 0..6, dom..sáb
  const diff = day === 0 ? -6 : 1 - day; // dom→-6, seg→0, ter→-1, ...
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  start.setDate(start.getDate() + diff);
  return start;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  r.setDate(r.getDate() + n);
  return r;
}

function toISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function formatExamDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return `${date.getDate()} ${MONTH_LABELS_SHORT[date.getMonth()]} · ${WEEKDAYS_SHORT[date.getDay()]}`;
}

function describeDaysUntil(days: number): string {
  if (days === 0) return 'hoje';
  if (days === 1) return 'amanhã';
  if (days < 0) return 'já passou';
  if (days < 7) return `em ${days} dias`;
  if (days < 30) return `em ${Math.round(days / 7)} sem.`;
  return `em ${Math.round(days / 30)} meses`;
}

function headlineFor(mode: DisplayMode): { mainPart: string; accentPart: string } {
  switch (mode) {
    case 'doutora':
      return { mainPart: 'sua agenda do', accentPart: 'semestre' };
    case 'irmao':
      return { mainPart: 'agenda da', accentPart: 'irmã' };
    case 'namorado':
    default:
      return { mainPart: 'sua agenda,', accentPart: 'amor' };
  }
}

function subtitleFor(mode: DisplayMode): string {
  switch (mode) {
    case 'doutora':
      return 'aulas, provas e atividades — tudo num só lugar.';
    case 'irmao':
      return 'tudo que tem na sua semana — aula, prova, plantão, almoço, qualquer coisa.';
    case 'namorado':
    default:
      return 'tudo o que tem na sua semana, num lugar só. eu te lembro do que importa.';
  }
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

type EditorState =
  | null
  | { kind: 'event'; initial: EventEditorInitial }
  | { kind: 'subject'; initial: Subject | null };

export default function StudyPlan() {
  const { user } = useUser();
  const uid = user?.uid;
  const displayMode: DisplayMode = (user?.displayMode ?? 'namorado') as DisplayMode;

  // tick para re-render quando STUDY_PLAN_CHANGE_EVENT dispara
  const [, setTick] = useState(0);

  // semana exibida no timeline
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));

  // modal de edição (evento ou disciplina)
  const [editor, setEditor] = useState<EditorState>(null);

  // permission de notificação
  const [permission, setPermission] = useState<AppNotificationPermission>(() =>
    getPermission(),
  );

  // re-render quando dados mudam
  useEffect(() => {
    function bump() {
      setTick((t) => t + 1);
    }
    window.addEventListener(STUDY_PLAN_CHANGE_EVENT, bump);
    return () => window.removeEventListener(STUDY_PLAN_CHANGE_EVENT, bump);
  }, []);

  // dados
  const subjects = useMemo(() => (uid ? listSubjects(uid) : []), [uid]);
  const classes = useMemo(() => (uid ? listClasses(uid) : []), [uid]);
  const exams = useMemo(() => (uid ? listExams(uid) : []), [uid]);
  const tasks = useMemo(() => (uid ? listTasks(uid) : []), [uid]);
  const subjectById = useMemo(() => {
    const m = new Map<string, Subject>();
    subjects.forEach((s) => m.set(s.id, s));
    return m;
  }, [subjects]);

  const todayIso = todayISO();
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const weekStartIso = useMemo(() => toISODateLocal(weekStart), [weekStart]);
  const weekEndIso = useMemo(() => toISODateLocal(weekEnd), [weekEnd]);

  const occurrencesByDay = useMemo(
    () =>
      getOccurrencesByDay(weekStartIso, weekEndIso, {
        subjects: subjectById,
        classes,
        exams,
        tasks,
      }),
    [weekStartIso, weekEndIso, subjectById, classes, exams, tasks],
  );

  // sumário do assistente — recalcula a cada minuto pra countdowns ficarem vivos
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(i);
  }, []);

  const summary = useMemo(
    () =>
      buildAssistantSummary(
        {
          subjects,
          classes,
          exams,
          tasks,
          reminderPermission: permission,
        },
        now,
      ),
    [subjects, classes, exams, tasks, permission, now],
  );

  // agenda de lembretes — reroda quando dados mudam ou permission muda
  useEffect(() => {
    if (!uid) return;
    // pega as ocorrências dos próximos 2 dias (janela ampla pro scheduler interno)
    const todayDate = new Date();
    const horizon = addDays(todayDate, 2);
    const occs = getOccurrencesByDay(
      toISODateLocal(todayDate),
      toISODateLocal(horizon),
      { subjects: subjectById, classes, exams, tasks },
    );
    const flat: AgendaOccurrence[] = [];
    occs.forEach((arr) => arr.forEach((o) => flat.push(o)));
    scheduleReminders(flat, todayDate);
  }, [uid, subjectById, classes, exams, tasks, permission]);

  // dicas de organização — rotacionam por dia para dar frescor
  const orgTips = useMemo(() => {
    const pool = ORGANIZATION_TIPS[displayMode] ?? ORGANIZATION_TIPS.doutora;
    if (pool.length === 0) return [];
    // semente determinística pelo dia: mesma dica até a meia-noite
    const epoch = Math.floor(now.getTime() / (24 * 60 * 60 * 1000));
    return [
      pool[epoch % pool.length],
      pool[(epoch + 1) % pool.length],
    ];
  }, [displayMode, now]);

  // provas próximas e passadas (mantém formato editorial do bloco anterior)
  const upcomingExams = useMemo(
    () => exams.filter((e) => e.date >= todayIso),
    [exams, todayIso],
  );
  const pastExams = useMemo(
    () => exams.filter((e) => e.date < todayIso).slice(-5).reverse(),
    [exams, todayIso],
  );

  // handlers
  const handleEnableReminders = useCallback(async () => {
    const result = await requestPermission();
    setPermission(result);
  }, []);

  const openNewEventForSlot = useCallback((dateISO: string, hour: number) => {
    setEditor({
      kind: 'event',
      initial: { mode: 'new', kind: 'class', dateISO, hour },
    });
  }, []);

  const openEventFromOccurrence = useCallback(
    (occ: AgendaOccurrence) => {
      if (occ.kind === 'class') {
        const cls = classes.find((c) => c.id === occ.sourceId);
        if (cls) {
          setEditor({ kind: 'event', initial: { mode: 'edit', kind: 'class', data: cls } });
        }
        return;
      }
      if (occ.kind === 'exam') {
        const ex = exams.find((e) => e.id === occ.sourceId);
        if (ex) {
          setEditor({ kind: 'event', initial: { mode: 'edit', kind: 'exam', data: ex } });
        }
        return;
      }
      const tk = tasks.find((t) => t.id === occ.sourceId);
      if (tk) {
        setEditor({ kind: 'event', initial: { mode: 'edit', kind: 'task', data: tk } });
      }
    },
    [classes, exams, tasks],
  );

  if (!user) return null;

  const headline = headlineFor(displayMode);
  const subtitle = subtitleFor(displayMode);

  return (
    <PageContainer>
      <div className="space-y-10">
        {/* I — Assistente */}
        <AssistantBanner
          summary={summary}
          onEnableReminders={handleEnableReminders}
          permission={permission}
        />

        {/* II — Header da página */}
        <section>
          <div className="eyebrow-gold">
            {todayIso.split('-').reverse().join('.')}
          </div>
          <h1 className="mt-3 font-serif italic leading-[1.05] text-wine-deep">
            <span className="text-[clamp(1.75rem,4vw,2.75rem)]">{headline.mainPart}</span>{' '}
            <span className="text-[clamp(1.75rem,4vw,2.75rem)] text-rose">{headline.accentPart}</span>
            <span className="text-[clamp(1.75rem,4vw,2.75rem)]">.</span>
          </h1>
          <p className="mt-3 max-w-xl font-serif text-base italic leading-relaxed text-ink-soft sm:text-lg">
            {subtitle}
          </p>
        </section>

        {/* III — Semana */}
        <section>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-gold opacity-70">
                capítulo um
              </div>
              <h2 className="mt-1 font-serif text-2xl italic text-wine-deep sm:text-3xl">
                Sua semana
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setEditor({
                    kind: 'event',
                    initial: {
                      mode: 'new',
                      kind: 'class',
                      dateISO: todayIso,
                    },
                  })
                }
                className="inline-flex min-h-touch items-center gap-1.5 rounded-full bg-wine px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-wine transition hover:bg-wine-deep active:scale-[0.98]"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                novo evento
              </button>
            </div>
          </div>

          <WeekNavigator
            weekStart={weekStart}
            onPrev={() => setWeekStart((d) => addDays(d, -7))}
            onNext={() => setWeekStart((d) => addDays(d, 7))}
            onToday={() => setWeekStart(startOfWeek(new Date()))}
          />

          <div className="mt-4">
            {subjects.length === 0 && classes.length === 0 && exams.length === 0 && tasks.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line bg-paper-soft px-5 py-8 text-center font-serif text-base italic text-ink-soft">
                comece adicionando suas disciplinas e o que tem na sua semana.
              </p>
            ) : (
              <WeekTimeline
                weekStart={weekStart}
                occurrencesByDay={occurrencesByDay}
                onEventClick={openEventFromOccurrence}
                onSlotClick={openNewEventForSlot}
                todayISO={todayIso}
              />
            )}
          </div>
        </section>

        {/* IV — Provas */}
        <section>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-gold opacity-70">
                capítulo dois
              </div>
              <h2 className="mt-1 font-serif text-2xl italic text-wine-deep sm:text-3xl">
                Próximas provas
              </h2>
            </div>
            <button
              onClick={() =>
                setEditor({
                  kind: 'event',
                  initial: { mode: 'new', kind: 'exam', dateISO: todayIso },
                })
              }
              disabled={subjects.length === 0}
              className="inline-flex min-h-touch items-center gap-1.5 rounded-full bg-wine px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-wine transition hover:bg-wine-deep active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-line disabled:text-muted disabled:shadow-none"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
              nova prova
            </button>
          </div>

          {upcomingExams.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line bg-paper-soft px-5 py-8 text-center font-serif text-base italic text-ink-soft">
              sem provas marcadas para os próximos dias.
            </p>
          ) : (
            <ul className="space-y-3">
              {upcomingExams.map((e) => (
                <ExamRow
                  key={e.id}
                  exam={e}
                  subject={subjectById.get(e.subjectId)}
                  onClick={() =>
                    setEditor({
                      kind: 'event',
                      initial: { mode: 'edit', kind: 'exam', data: e },
                    })
                  }
                />
              ))}
            </ul>
          )}

          {pastExams.length > 0 && (
            <details className="mt-6 rounded-2xl border border-line bg-paper-soft px-4 py-3">
              <summary className="cursor-pointer text-[11px] uppercase tracking-[0.22em] text-muted">
                provas que já passaram ({pastExams.length})
              </summary>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                {pastExams.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3">
                    <div className="truncate font-serif italic">
                      {subjectById.get(e.subjectId)?.name ?? '·'}{' '}
                      {e.label && <span className="text-muted">· {e.label}</span>}
                    </div>
                    <div className="shrink-0 text-[11px] uppercase tracking-wider text-muted">
                      {formatExamDate(e.date)}
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>

        {/* V — Disciplinas */}
        <section>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-gold opacity-70">
                capítulo três
              </div>
              <h2 className="mt-1 font-serif text-2xl italic text-wine-deep sm:text-3xl">
                Disciplinas
              </h2>
            </div>
            <button
              onClick={() => setEditor({ kind: 'subject', initial: null })}
              className="inline-flex min-h-touch items-center gap-1.5 rounded-full bg-wine px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-wine transition hover:bg-wine-deep active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
              nova
            </button>
          </div>

          {subjects.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line bg-paper-soft px-5 py-8 text-center font-serif text-base italic text-ink-soft">
              nenhuma disciplina ainda. comece adicionando as matérias do semestre.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((s) => (
                <SubjectCard
                  key={s.id}
                  subject={s}
                  classCount={classes.filter((c) => c.subjectId === s.id).length}
                  examCount={exams.filter((e) => e.subjectId === s.id).length}
                  onEdit={() => setEditor({ kind: 'subject', initial: s })}
                  onDelete={() => {
                    if (
                      confirm(
                        `Remover ${s.name}? Aulas e provas dessa disciplina também serão removidas.`,
                      )
                    ) {
                      if (uid) removeSubject(uid, s.id);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* VI — Como organizar */}
        {orgTips.length > 0 && (
          <section>
            <div className="mb-4">
              <div className="text-[10px] uppercase tracking-[0.32em] text-gold opacity-70">
                capítulo quatro
              </div>
              <h2 className="mt-1 font-serif text-2xl italic text-wine-deep sm:text-3xl">
                Como organizar
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {orgTips.map((t, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-line bg-paper-soft p-5"
                >
                  <h3 className="font-serif text-lg italic text-wine-deep">{t.title}</h3>
                  <p className="mt-2 font-serif text-sm italic leading-relaxed text-ink-soft">
                    {t.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Modais e drawers */}
      {editor?.kind === 'event' && uid && (
        <EventEditor
          uid={uid}
          subjects={subjects}
          initial={editor.initial}
          onRequestNewSubject={() => setEditor({ kind: 'subject', initial: null })}
          onClose={() => setEditor(null)}
        />
      )}
      {editor?.kind === 'subject' && uid && (
        <SubjectEditor
          uid={uid}
          initial={editor.initial}
          onClose={() => setEditor(null)}
        />
      )}
    </PageContainer>
  );
}

// ---------------------------------------------------------------------------
// SubjectCard (mantido inline — mesma estética do anterior)
// ---------------------------------------------------------------------------

interface SubjectCardProps {
  subject: Subject;
  classCount: number;
  examCount: number;
  onEdit: () => void;
  onDelete: () => void;
}

function SubjectCard({ subject, classCount, examCount, onEdit, onDelete }: SubjectCardProps) {
  return (
    <article
      className="relative overflow-hidden rounded-2xl border border-line bg-paper p-4 shadow-soft"
      style={{ borderTopColor: subject.color, borderTopWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: subject.color }}
            />
            <h3 className="truncate font-serif text-lg italic text-wine-deep">{subject.name}</h3>
          </div>
          {subject.professor && (
            <div className="mt-0.5 truncate text-xs italic text-ink-soft">{subject.professor}</div>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label="editar"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-paper-soft hover:text-wine"
          >
            <Pencil className="h-3 w-3" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="remover"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-paper-soft hover:text-red"
          >
            <Trash2 className="h-3 w-3" strokeWidth={1.75} />
          </button>
        </div>
      </div>
      <div className="mt-3 flex gap-3 border-t border-line/60 pt-2 text-[11px] uppercase tracking-wider text-muted">
        <span className="inline-flex items-center gap-1">
          <Clock3 className="h-2.5 w-2.5" strokeWidth={1.75} />
          {classCount} {classCount === 1 ? 'aula' : 'aulas'}
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-2.5 w-2.5" strokeWidth={1.75} />
          {examCount} {examCount === 1 ? 'prova' : 'provas'}
        </span>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// ExamRow
// ---------------------------------------------------------------------------

interface ExamRowProps {
  exam: ExamEvent;
  subject: Subject | undefined;
  onClick: () => void;
}

function ExamRow({ exam, subject, onClick }: ExamRowProps) {
  const days = daysUntil(exam.date);
  const urgent = days <= 7;
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-center gap-4 rounded-2xl border bg-paper px-4 py-4 text-left transition hover:shadow-card sm:px-5 ${
          urgent ? 'border-rose' : 'border-line'
        }`}
      >
        <div className="flex w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-paper-soft px-2 py-2.5">
          <div className="font-serif text-2xl font-semibold leading-none text-wine-deep">
            {Number(exam.date.split('-')[2])}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-wider text-muted">
            {MONTH_LABELS_SHORT[Number(exam.date.split('-')[1]) - 1]}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: subject?.color ?? '#999' }}
            />
            <div className="truncate font-serif text-lg italic text-wine-deep sm:text-xl">
              {subject?.name ?? 'disciplina removida'}
            </div>
          </div>
          {exam.label && (
            <div className="mt-0.5 truncate text-sm italic text-ink-soft">{exam.label}</div>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-wider text-muted">
            <span>{formatExamDate(exam.date)}</span>
            {exam.time && (
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-2.5 w-2.5" strokeWidth={1.75} />
                {exam.time}
              </span>
            )}
            {exam.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5" strokeWidth={1.75} />
                {exam.location}
              </span>
            )}
          </div>
        </div>
        <div
          className={`shrink-0 rounded-full px-3 py-1 font-serif text-[11px] italic ${
            urgent ? 'bg-rose-soft text-wine-deep' : 'bg-paper-soft text-muted'
          }`}
        >
          {describeDaysUntil(days)}
        </div>
      </button>
    </li>
  );
}

