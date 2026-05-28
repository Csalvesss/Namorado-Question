import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import PageContainer from '../components/ui/PageContainer';
import {
  STUDY_PLAN_CHANGE_EVENT,
  SUBJECT_PALETTE,
  daysUntil,
  listClasses,
  listExams,
  listSubjects,
  newId,
  removeClass,
  removeExam,
  removeSubject,
  saveClass,
  saveExam,
  saveSubject,
  todayISO,
} from '../lib/studyPlan';
import { useUser } from '../lib/useUser';
import type { ClassEvent, DayOfWeek, ExamEvent, Subject } from '../types';

const DAY_LABELS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const DAY_LABELS_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MONTH_LABELS = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

function formatExamDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return `${date.getDate()} ${MONTH_LABELS[date.getMonth()]} · ${DAY_LABELS_SHORT[date.getDay()]}`;
}

function describeDaysUntil(days: number): string {
  if (days === 0) return 'hoje';
  if (days === 1) return 'amanhã';
  if (days < 0) return 'já passou';
  if (days < 7) return `em ${days} dias`;
  if (days < 30) return `em ${Math.round(days / 7)} sem.`;
  return `em ${Math.round(days / 30)} meses`;
}

export default function StudyPlan() {
  const { user } = useUser();
  const [, setTick] = useState(0);
  const [subjectModal, setSubjectModal] = useState<Subject | 'new' | null>(null);
  const [classModal, setClassModal] = useState<ClassEvent | 'new' | null>(null);
  const [examModal, setExamModal] = useState<ExamEvent | 'new' | null>(null);

  useEffect(() => {
    function bump() {
      setTick((t) => t + 1);
    }
    window.addEventListener(STUDY_PLAN_CHANGE_EVENT, bump);
    return () => window.removeEventListener(STUDY_PLAN_CHANGE_EVENT, bump);
  }, []);

  const uid = user?.uid;
  const subjects = useMemo(() => (uid ? listSubjects(uid) : []), [uid]);
  const classes = useMemo(() => (uid ? listClasses(uid) : []), [uid]);
  const exams = useMemo(() => (uid ? listExams(uid) : []), [uid]);
  const subjectById = useMemo(() => {
    const m = new Map<string, Subject>();
    subjects.forEach((s) => m.set(s.id, s));
    return m;
  }, [subjects]);

  const upcomingExams = useMemo(() => {
    const today = todayISO();
    return exams.filter((e) => e.date >= today);
  }, [exams]);

  const pastExams = useMemo(() => {
    const today = todayISO();
    return exams.filter((e) => e.date < today).slice(-5).reverse();
  }, [exams]);

  if (!user) return null;

  return (
    <PageContainer>
    <div className="space-y-12">
      <section>
        <div className="eyebrow-gold">{todayISO().split('-').reverse().join('.')}</div>
        <h1 className="mt-3 font-serif italic leading-[1.05] text-wine-deep">
          <span className="text-[clamp(1.75rem,4vw,2.75rem)]">plano de estudo,</span>{' '}
          <span className="text-[clamp(1.75rem,4vw,2.75rem)] text-rose">doutora</span>
          <span className="text-[clamp(1.75rem,4vw,2.75rem)]">.</span>
        </h1>
        <p className="mt-3 max-w-xl font-serif text-base italic leading-relaxed text-ink-soft sm:text-lg">
          suas matérias, suas aulas e suas provas do semestre.
        </p>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.32em] text-gold opacity-70">
              capítulo um
            </div>
            <h2 className="mt-1 font-serif text-2xl italic text-wine-deep sm:text-3xl">
              Disciplinas do semestre
            </h2>
          </div>
          <button
            onClick={() => setSubjectModal('new')}
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
                onEdit={() => setSubjectModal(s)}
                onDelete={() => {
                  if (confirm(`Remover ${s.name}? Aulas e provas dessa disciplina também serão removidas.`)) {
                    removeSubject(uid!, s.id);
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.32em] text-gold opacity-70">
              capítulo dois
            </div>
            <h2 className="mt-1 font-serif text-2xl italic text-wine-deep sm:text-3xl">
              Agenda da semana
            </h2>
          </div>
          <button
            onClick={() => setClassModal('new')}
            disabled={subjects.length === 0}
            className="inline-flex min-h-touch items-center gap-1.5 rounded-full bg-wine px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-wine transition hover:bg-wine-deep active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-line disabled:text-muted disabled:shadow-none"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
            nova aula
          </button>
        </div>

        {classes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-paper-soft px-5 py-8 text-center font-serif text-base italic text-ink-soft">
            {subjects.length === 0
              ? 'crie uma disciplina primeiro.'
              : 'nenhuma aula cadastrada ainda.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid min-w-[700px] grid-cols-7 gap-2">
              {DAY_LABELS.slice(1).concat(DAY_LABELS[0]).map((label, i) => {
                const dayIdx = (i + 1) % 7;
                const dayClasses = classes.filter((c) => c.dayOfWeek === dayIdx);
                return (
                  <div key={label} className="rounded-2xl border border-line bg-paper-soft p-3">
                    <div className="mb-2 font-serif text-[11px] uppercase tracking-[0.22em] text-gold">
                      {label}
                    </div>
                    {dayClasses.length === 0 ? (
                      <div className="text-[11px] italic text-muted">livre</div>
                    ) : (
                      <ul className="space-y-2">
                        {dayClasses.map((c) => {
                          const s = subjectById.get(c.subjectId);
                          return (
                            <li key={c.id}>
                              <button
                                type="button"
                                onClick={() => setClassModal(c)}
                                className="w-full rounded-xl border border-line bg-paper px-2.5 py-2 text-left transition hover:shadow-card"
                                style={{ borderLeftColor: s?.color, borderLeftWidth: 3 }}
                              >
                                <div className="truncate font-serif text-sm italic text-wine-deep">
                                  {s?.name ?? 'disciplina removida'}
                                </div>
                                <div className="mt-0.5 flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted">
                                  <Clock3 className="h-2.5 w-2.5" strokeWidth={1.75} />
                                  {c.startTime} a {c.endTime}
                                </div>
                                {c.location && (
                                  <div className="mt-0.5 flex items-center gap-1 text-[10px] italic text-ink-soft">
                                    <MapPin className="h-2.5 w-2.5" strokeWidth={1.75} />
                                    {c.location}
                                  </div>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.32em] text-gold opacity-70">
              capítulo três
            </div>
            <h2 className="mt-1 font-serif text-2xl italic text-wine-deep sm:text-3xl">
              Próximas provas
            </h2>
          </div>
          <button
            onClick={() => setExamModal('new')}
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
            {upcomingExams.map((e) => {
              const s = subjectById.get(e.subjectId);
              const days = daysUntil(e.date);
              const urgent = days <= 7;
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setExamModal(e)}
                    className={`flex w-full items-center gap-4 rounded-2xl border bg-paper px-4 py-4 text-left transition hover:shadow-card sm:px-5 ${
                      urgent ? 'border-rose' : 'border-line'
                    }`}
                  >
                    <div className="flex w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-paper-soft px-2 py-2.5">
                      <div className="font-serif text-2xl font-semibold leading-none text-wine-deep">
                        {Number(e.date.split('-')[2])}
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted">
                        {MONTH_LABELS[Number(e.date.split('-')[1]) - 1]}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: s?.color ?? '#999' }}
                        />
                        <div className="truncate font-serif text-lg italic text-wine-deep sm:text-xl">
                          {s?.name ?? 'disciplina removida'}
                        </div>
                      </div>
                      {e.label && (
                        <div className="mt-0.5 truncate text-sm italic text-ink-soft">{e.label}</div>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-wider text-muted">
                        <span>{formatExamDate(e.date)}</span>
                        {e.time && (
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-2.5 w-2.5" strokeWidth={1.75} />
                            {e.time}
                          </span>
                        )}
                        {e.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5" strokeWidth={1.75} />
                            {e.location}
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
            })}
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
                    {subjectById.get(e.subjectId)?.name ?? '·'} {e.label && <span className="text-muted">· {e.label}</span>}
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

      {subjectModal && (
        <SubjectFormModal
          uid={uid!}
          initial={subjectModal === 'new' ? null : subjectModal}
          onClose={() => setSubjectModal(null)}
        />
      )}
      {classModal && (
        <ClassFormModal
          uid={uid!}
          subjects={subjects}
          initial={classModal === 'new' ? null : classModal}
          onClose={() => setClassModal(null)}
        />
      )}
      {examModal && (
        <ExamFormModal
          uid={uid!}
          subjects={subjects}
          initial={examModal === 'new' ? null : examModal}
          onClose={() => setExamModal(null)}
        />
      )}
    </div>
    </PageContainer>
  );
}

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

interface ModalShellProps {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: () => void;
  children: React.ReactNode;
  submitLabel?: string;
}

function ModalShell({ title, onClose, onSubmit, onDelete, children, submitLabel = 'salvar' }: ModalShellProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 px-3 pt-6 pb-safe sm:items-center sm:py-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-line bg-paper shadow-card sm:max-w-lg"
      >
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-serif text-xl italic text-wine-deep">{title}</h3>
        </div>
        <div className="space-y-3 px-5 py-4">{children}</div>
        <div className="flex items-center justify-between gap-3 border-t border-line bg-paper-soft px-5 py-3">
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="text-[11px] uppercase tracking-wider text-red transition hover:underline"
            >
              remover
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-full border border-line bg-paper px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-soft transition hover:bg-paper-soft"
            >
              cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-wine px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-wine transition hover:bg-wine-deep active:scale-[0.98]"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

interface SubjectFormProps {
  uid: string;
  initial: Subject | null;
  onClose: () => void;
}

function SubjectFormModal({ uid, initial, onClose }: SubjectFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [professor, setProfessor] = useState(initial?.professor ?? '');
  const [semester, setSemester] = useState(initial?.semester ?? '');
  const [color, setColor] = useState(initial?.color ?? SUBJECT_PALETTE[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const subject: Subject = {
      id: initial?.id ?? newId('subj'),
      name: name.trim(),
      color,
      professor: professor.trim() || undefined,
      semester: semester.trim() || undefined,
      createdAt: initial?.createdAt ?? Date.now(),
    };
    saveSubject(uid, subject);
    onClose();
  }

  function handleDelete() {
    if (!initial) return;
    if (confirm(`Remover ${initial.name}? Aulas e provas dessa disciplina também serão removidas.`)) {
      removeSubject(uid, initial.id);
      onClose();
    }
  }

  return (
    <ModalShell
      title={initial ? 'editar disciplina' : 'nova disciplina'}
      onClose={onClose}
      onSubmit={handleSubmit}
      onDelete={initial ? handleDelete : undefined}
    >
      <Field label="nome">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Cardiologia"
          className="input-elegant"
        />
      </Field>
      <Field label="professor (opcional)">
        <input
          value={professor}
          onChange={(e) => setProfessor(e.target.value)}
          placeholder="Ex.: Dra. Andrea"
          className="input-elegant"
        />
      </Field>
      <Field label="semestre (opcional)">
        <input
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          placeholder="Ex.: 2026.1"
          className="input-elegant"
        />
      </Field>
      <Field label="cor">
        <div className="flex flex-wrap gap-2">
          {SUBJECT_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`cor ${c}`}
              className={`h-9 w-9 rounded-full border-2 transition ${
                color === c ? 'border-wine-deep scale-110' : 'border-paper'
              }`}
              style={{ background: c }}
            />
          ))}
        </div>
      </Field>
    </ModalShell>
  );
}

interface ClassFormProps {
  uid: string;
  subjects: Subject[];
  initial: ClassEvent | null;
  onClose: () => void;
}

function ClassFormModal({ uid, subjects, initial, onClose }: ClassFormProps) {
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? subjects[0]?.id ?? '');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(initial?.dayOfWeek ?? 1);
  const [startTime, setStartTime] = useState(initial?.startTime ?? '08:00');
  const [endTime, setEndTime] = useState(initial?.endTime ?? '10:00');
  const [location, setLocation] = useState(initial?.location ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subjectId) return;
    const event: ClassEvent = {
      id: initial?.id ?? newId('cls'),
      subjectId,
      dayOfWeek,
      startTime,
      endTime,
      location: location.trim() || undefined,
      createdAt: initial?.createdAt ?? Date.now(),
    };
    saveClass(uid, event);
    onClose();
  }

  function handleDelete() {
    if (!initial) return;
    if (confirm('Remover essa aula?')) {
      removeClass(uid, initial.id);
      onClose();
    }
  }

  return (
    <ModalShell
      title={initial ? 'editar aula' : 'nova aula'}
      onClose={onClose}
      onSubmit={handleSubmit}
      onDelete={initial ? handleDelete : undefined}
    >
      <Field label="disciplina">
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="input-elegant"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </Field>
      <Field label="dia da semana">
        <select
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(Number(e.target.value) as DayOfWeek)}
          className="input-elegant"
        >
          {DAY_LABELS.map((label, idx) => (
            <option key={label} value={idx}>{label}</option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="começa">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="input-elegant"
          />
        </Field>
        <Field label="termina">
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="input-elegant"
          />
        </Field>
      </div>
      <Field label="onde (opcional)">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ex.: sala 304"
          className="input-elegant"
        />
      </Field>
    </ModalShell>
  );
}

interface ExamFormProps {
  uid: string;
  subjects: Subject[];
  initial: ExamEvent | null;
  onClose: () => void;
}

function ExamFormModal({ uid, subjects, initial, onClose }: ExamFormProps) {
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? subjects[0]?.id ?? '');
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [time, setTime] = useState(initial?.time ?? '');
  const [label, setLabel] = useState(initial?.label ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subjectId || !date) return;
    const event: ExamEvent = {
      id: initial?.id ?? newId('exam'),
      subjectId,
      date,
      time: time || undefined,
      label: label.trim() || undefined,
      location: location.trim() || undefined,
      createdAt: initial?.createdAt ?? Date.now(),
    };
    saveExam(uid, event);
    onClose();
  }

  function handleDelete() {
    if (!initial) return;
    if (confirm('Remover essa prova?')) {
      removeExam(uid, initial.id);
      onClose();
    }
  }

  return (
    <ModalShell
      title={initial ? 'editar prova' : 'nova prova'}
      onClose={onClose}
      onSubmit={handleSubmit}
      onDelete={initial ? handleDelete : undefined}
    >
      <Field label="disciplina">
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="input-elegant"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </Field>
      <Field label="data">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-elegant"
        />
      </Field>
      <Field label="hora (opcional)">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="input-elegant"
        />
      </Field>
      <Field label="o que é (opcional)">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex.: P1 ou Final"
          className="input-elegant"
        />
      </Field>
      <Field label="onde (opcional)">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ex.: sala 102"
          className="input-elegant"
        />
      </Field>
    </ModalShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted">{label}</span>
      {children}
    </label>
  );
}
