import { useMemo, useState } from 'react';
import {
  newId,
  removeClass,
  removeExam,
  removeTask,
  saveClass,
  saveExam,
  saveTask,
  todayISO,
} from '../../lib/studyPlan';
import { REMINDER_PRESETS } from '../../lib/notifications';
import { TASK_CATEGORY_LABEL, type TaskCategory, type TaskEvent } from '../../lib/agenda-types';
import type { ClassEvent, DayOfWeek, ExamEvent, Subject } from '../../types';
import { Field, ModalShell } from './ModalShell';

// =============================================================================
// Types
// =============================================================================

export type EventKind = 'class' | 'exam' | 'task';

export type EventEditorInitial =
  | { mode: 'new'; kind?: EventKind; dateISO?: string; hour?: number }
  | { mode: 'edit'; kind: 'class'; data: ClassEvent }
  | { mode: 'edit'; kind: 'exam'; data: ExamEvent }
  | { mode: 'edit'; kind: 'task'; data: TaskEvent };

export interface EventEditorProps {
  uid: string;
  subjects: Subject[];
  initial: EventEditorInitial;
  /** Opcional: chamado quando a usuária pede para abrir o cadastro de disciplinas
   *  (quando nenhuma disciplina existe e ela quer criar uma na hora). Se omitido,
   *  o link "cadastrar agora" simplesmente fecha o editor. */
  onRequestNewSubject?: () => void;
  onClose: () => void;
}

const DAY_LABELS = [
  'domingo',
  'segunda',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sábado',
];

const TASK_CATEGORIES: TaskCategory[] = [
  'estagio',
  'plantao',
  'palestra',
  'reuniao',
  'social',
  'pessoal',
  'outro',
];

// =============================================================================
// Helpers
// =============================================================================

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function hourToHHMM(h?: number): string {
  if (h == null || Number.isNaN(h)) return '';
  const safe = Math.max(0, Math.min(23, Math.floor(h)));
  return `${pad2(safe)}:00`;
}

function isoToDayOfWeek(iso: string | undefined): DayOfWeek | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  return dt.getDay() as DayOfWeek;
}

function compareTimes(a: string, b: string): number {
  return a.localeCompare(b);
}

// =============================================================================
// Component
// =============================================================================

export default function EventEditor({
  uid,
  subjects,
  initial,
  onRequestNewSubject,
  onClose,
}: EventEditorProps) {
  // ---- modo / tipo ---------------------------------------------------------
  const isEdit = initial.mode === 'edit';

  const [kind, setKind] = useState<EventKind>(() => {
    if (initial.mode === 'edit') return initial.kind;
    return initial.kind ?? 'class';
  });

  // ---- defaults vindos do `initial` ---------------------------------------
  const defaultDateISO = useMemo(() => {
    if (initial.mode === 'new') return initial.dateISO ?? todayISO();
    if (initial.kind === 'exam') return initial.data.date;
    if (initial.kind === 'task') return initial.data.date;
    return todayISO();
  }, [initial]);

  const defaultStartHHMM = useMemo(() => {
    if (initial.mode === 'new') return hourToHHMM(initial.hour);
    return '';
  }, [initial]);

  // ---- estado de cada tipo (mantido isolado para não perder ao trocar) -----

  // class
  const initialClass = isEdit && initial.kind === 'class' ? initial.data : null;
  const [classSubjectId, setClassSubjectId] = useState(
    initialClass?.subjectId ?? subjects[0]?.id ?? '',
  );
  const [classDayOfWeek, setClassDayOfWeek] = useState<DayOfWeek>(() => {
    if (initialClass) return initialClass.dayOfWeek;
    const fromDate = isoToDayOfWeek(initial.mode === 'new' ? initial.dateISO : undefined);
    return (fromDate ?? 1) as DayOfWeek;
  });
  const [classStart, setClassStart] = useState(
    initialClass?.startTime ?? (defaultStartHHMM || '08:00'),
  );
  const [classEnd, setClassEnd] = useState(initialClass?.endTime ?? '10:00');
  const [classLocation, setClassLocation] = useState(initialClass?.location ?? '');
  const [classReminder, setClassReminder] = useState<number | undefined>(
    (initialClass as (ClassEvent & { reminderMinutes?: number }) | null)?.reminderMinutes,
  );

  // exam
  const initialExam = isEdit && initial.kind === 'exam' ? initial.data : null;
  const [examSubjectId, setExamSubjectId] = useState(
    initialExam?.subjectId ?? subjects[0]?.id ?? '',
  );
  const [examDate, setExamDate] = useState(initialExam?.date ?? defaultDateISO);
  const [examTime, setExamTime] = useState(initialExam?.time ?? defaultStartHHMM);
  const [examLabel, setExamLabel] = useState(initialExam?.label ?? '');
  const [examLocation, setExamLocation] = useState(initialExam?.location ?? '');
  const [examReminder, setExamReminder] = useState<number | undefined>(
    (initialExam as (ExamEvent & { reminderMinutes?: number }) | null)?.reminderMinutes,
  );

  // task
  const initialTask = isEdit && initial.kind === 'task' ? initial.data : null;
  const [taskTitle, setTaskTitle] = useState(initialTask?.title ?? '');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>(
    initialTask?.category ?? 'pessoal',
  );
  const [taskDate, setTaskDate] = useState(initialTask?.date ?? defaultDateISO);
  const [taskStart, setTaskStart] = useState(initialTask?.startTime ?? defaultStartHHMM);
  const [taskEnd, setTaskEnd] = useState(initialTask?.endTime ?? '');
  const [taskSubjectId, setTaskSubjectId] = useState(initialTask?.subjectId ?? '');
  const [taskLocation, setTaskLocation] = useState(initialTask?.location ?? '');
  const [taskDescription, setTaskDescription] = useState(initialTask?.description ?? '');
  const [taskReminder, setTaskReminder] = useState<number | undefined>(
    initialTask?.reminderMinutes,
  );

  // ---- erro de validação inline -------------------------------------------
  const [error, setError] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Title resolution
  // -------------------------------------------------------------------------
  const title = useMemo(() => {
    const prefix = isEdit ? 'editar' : 'nova';
    if (kind === 'class') return `${prefix} aula`;
    if (kind === 'exam') return `${prefix} prova`;
    // task usa "atividade" e o gênero feminino
    return `${prefix} atividade`;
  }, [isEdit, kind]);

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (kind === 'class') {
      if (!classSubjectId) {
        setError('escolha uma disciplina.');
        return;
      }
      if (classStart && classEnd && compareTimes(classStart, classEnd) >= 0) {
        setError('o horário de término precisa ser depois do começo.');
        return;
      }
      const event: ClassEvent & { reminderMinutes?: number } = {
        id: initialClass?.id ?? newId('cls'),
        subjectId: classSubjectId,
        dayOfWeek: classDayOfWeek,
        startTime: classStart,
        endTime: classEnd,
        location: classLocation.trim() || undefined,
        createdAt: initialClass?.createdAt ?? Date.now(),
        // reminderMinutes não existe em ClassEvent (src/types.ts) mas o
        // contrato do EventEditor pede salvar. Anexamos via cast para que o
        // storage persista; ignorado silenciosamente se desconhecido.
        ...(classReminder != null ? { reminderMinutes: classReminder } : {}),
      };
      saveClass(uid, event);
      onClose();
      return;
    }

    if (kind === 'exam') {
      if (!examSubjectId) {
        setError('escolha uma disciplina.');
        return;
      }
      if (!examDate) {
        setError('escolha uma data.');
        return;
      }
      const event: ExamEvent & { reminderMinutes?: number } = {
        id: initialExam?.id ?? newId('exam'),
        subjectId: examSubjectId,
        date: examDate,
        time: examTime || undefined,
        label: examLabel.trim() || undefined,
        location: examLocation.trim() || undefined,
        createdAt: initialExam?.createdAt ?? Date.now(),
        // mesma observação do ClassEvent — reminderMinutes anexado via cast.
        ...(examReminder != null ? { reminderMinutes: examReminder } : {}),
      };
      saveExam(uid, event);
      onClose();
      return;
    }

    // task
    if (!taskTitle.trim()) {
      setError('dá um título pra essa atividade.');
      return;
    }
    if (!taskDate) {
      setError('escolha uma data.');
      return;
    }
    if (taskStart && taskEnd && compareTimes(taskStart, taskEnd) >= 0) {
      setError('o horário de término precisa ser depois do começo.');
      return;
    }
    const task: TaskEvent = {
      id: initialTask?.id ?? newId('task'),
      title: taskTitle.trim(),
      category: taskCategory,
      date: taskDate,
      startTime: taskStart || undefined,
      endTime: taskEnd || undefined,
      subjectId: taskSubjectId || undefined,
      location: taskLocation.trim() || undefined,
      description: taskDescription.trim() || undefined,
      reminderMinutes: taskReminder,
      createdAt: initialTask?.createdAt ?? Date.now(),
    };
    saveTask(uid, task);
    onClose();
  }

  // -------------------------------------------------------------------------
  // Delete
  // -------------------------------------------------------------------------
  function handleDelete() {
    if (!isEdit) return;
    if (initial.kind === 'class' && initialClass) {
      if (confirm('Remover essa aula?')) {
        removeClass(uid, initialClass.id);
        onClose();
      }
      return;
    }
    if (initial.kind === 'exam' && initialExam) {
      if (confirm('Remover essa prova?')) {
        removeExam(uid, initialExam.id);
        onClose();
      }
      return;
    }
    if (initial.kind === 'task' && initialTask) {
      if (confirm('Remover essa atividade?')) {
        removeTask(uid, initialTask.id);
        onClose();
      }
    }
  }

  // -------------------------------------------------------------------------
  // Toggle pill (só no modo 'new')
  // -------------------------------------------------------------------------
  const typeToggle = !isEdit && (
    <div className="flex w-full gap-1.5 rounded-full bg-paper-soft p-1">
      {(['class', 'exam', 'task'] as const).map((k) => {
        const active = kind === k;
        const label = k === 'class' ? 'aula' : k === 'exam' ? 'prova' : 'atividade';
        return (
          <button
            key={k}
            type="button"
            onClick={() => {
              setKind(k);
              setError(null);
            }}
            className={`flex-1 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition ${
              active
                ? 'bg-wine text-paper shadow-wine'
                : 'bg-blush text-wine hover:bg-blush/80'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const requiresSubject = kind === 'class' || kind === 'exam';
  const noSubjectsBlock = requiresSubject && subjects.length === 0;

  return (
    <ModalShell
      title={title}
      onClose={onClose}
      onSubmit={handleSubmit}
      onDelete={isEdit ? handleDelete : undefined}
      topSlot={typeToggle}
    >
      {noSubjectsBlock ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper-soft px-4 py-5 text-center">
          <p className="font-serif text-base italic text-ink-soft">
            cadastre uma disciplina primeiro.
          </p>
          {onRequestNewSubject && (
            <button
              type="button"
              onClick={() => {
                onRequestNewSubject();
                onClose();
              }}
              className="mt-3 inline-flex items-center rounded-full bg-wine px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-wine transition hover:bg-wine-deep active:scale-[0.98]"
            >
              cadastrar agora
            </button>
          )}
        </div>
      ) : kind === 'class' ? (
        <ClassFields
          subjects={subjects}
          subjectId={classSubjectId}
          setSubjectId={setClassSubjectId}
          dayOfWeek={classDayOfWeek}
          setDayOfWeek={setClassDayOfWeek}
          startTime={classStart}
          setStartTime={setClassStart}
          endTime={classEnd}
          setEndTime={setClassEnd}
          location={classLocation}
          setLocation={setClassLocation}
          reminder={classReminder}
          setReminder={setClassReminder}
        />
      ) : kind === 'exam' ? (
        <ExamFields
          subjects={subjects}
          subjectId={examSubjectId}
          setSubjectId={setExamSubjectId}
          date={examDate}
          setDate={setExamDate}
          time={examTime}
          setTime={setExamTime}
          label={examLabel}
          setLabel={setExamLabel}
          location={examLocation}
          setLocation={setExamLocation}
          reminder={examReminder}
          setReminder={setExamReminder}
        />
      ) : (
        <TaskFields
          subjects={subjects}
          title={taskTitle}
          setTitle={setTaskTitle}
          category={taskCategory}
          setCategory={setTaskCategory}
          date={taskDate}
          setDate={setTaskDate}
          startTime={taskStart}
          setStartTime={setTaskStart}
          endTime={taskEnd}
          setEndTime={setTaskEnd}
          subjectId={taskSubjectId}
          setSubjectId={setTaskSubjectId}
          location={taskLocation}
          setLocation={setTaskLocation}
          description={taskDescription}
          setDescription={setTaskDescription}
          reminder={taskReminder}
          setReminder={setTaskReminder}
        />
      )}

      {error && (
        <p className="rounded-xl border border-rose/50 bg-rose-soft px-3 py-2 text-xs italic text-wine-deep">
          {error}
        </p>
      )}
    </ModalShell>
  );
}

// =============================================================================
// Sub-forms (mantidos no mesmo arquivo — não são reutilizados externamente)
// =============================================================================

function ReminderField({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <Field label="lembrete">
      <select
        value={value == null ? '' : String(value)}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '') onChange(undefined);
          else onChange(Number(v));
        }}
        className="input-elegant"
      >
        <option value="">não lembrar</option>
        {REMINDER_PRESETS.map((p) => (
          <option key={p.minutes} value={p.minutes}>
            {p.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function SubjectSelect({
  subjects,
  value,
  onChange,
  allowEmpty,
}: {
  subjects: Subject[];
  value: string;
  onChange: (v: string) => void;
  allowEmpty?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-elegant"
    >
      {allowEmpty && <option value="">sem disciplina</option>}
      {subjects.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}

// ---- Class --------------------------------------------------------------

interface ClassFieldsProps {
  subjects: Subject[];
  subjectId: string;
  setSubjectId: (v: string) => void;
  dayOfWeek: DayOfWeek;
  setDayOfWeek: (v: DayOfWeek) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  reminder: number | undefined;
  setReminder: (v: number | undefined) => void;
}

function ClassFields(p: ClassFieldsProps) {
  return (
    <>
      <Field label="disciplina">
        <SubjectSelect subjects={p.subjects} value={p.subjectId} onChange={p.setSubjectId} />
      </Field>
      <Field label="dia da semana">
        <select
          value={p.dayOfWeek}
          onChange={(e) => p.setDayOfWeek(Number(e.target.value) as DayOfWeek)}
          className="input-elegant"
        >
          {/* segunda → domingo */}
          {[1, 2, 3, 4, 5, 6, 0].map((idx) => (
            <option key={idx} value={idx}>
              {DAY_LABELS[idx]}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="começa">
          <input
            type="time"
            value={p.startTime}
            onChange={(e) => p.setStartTime(e.target.value)}
            className="input-elegant"
          />
        </Field>
        <Field label="termina">
          <input
            type="time"
            value={p.endTime}
            onChange={(e) => p.setEndTime(e.target.value)}
            className="input-elegant"
          />
        </Field>
      </div>
      <Field label="onde (opcional)">
        <input
          value={p.location}
          onChange={(e) => p.setLocation(e.target.value)}
          placeholder="Ex.: sala 304"
          className="input-elegant"
        />
      </Field>
      <ReminderField value={p.reminder} onChange={p.setReminder} />
    </>
  );
}

// ---- Exam ---------------------------------------------------------------

interface ExamFieldsProps {
  subjects: Subject[];
  subjectId: string;
  setSubjectId: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  time: string;
  setTime: (v: string) => void;
  label: string;
  setLabel: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  reminder: number | undefined;
  setReminder: (v: number | undefined) => void;
}

function ExamFields(p: ExamFieldsProps) {
  return (
    <>
      <Field label="disciplina">
        <SubjectSelect subjects={p.subjects} value={p.subjectId} onChange={p.setSubjectId} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="data">
          <input
            type="date"
            value={p.date}
            onChange={(e) => p.setDate(e.target.value)}
            className="input-elegant"
          />
        </Field>
        <Field label="hora (opcional)">
          <input
            type="time"
            value={p.time}
            onChange={(e) => p.setTime(e.target.value)}
            className="input-elegant"
          />
        </Field>
      </div>
      <Field label="o que é (opcional)">
        <input
          value={p.label}
          onChange={(e) => p.setLabel(e.target.value)}
          placeholder="Ex.: P1 ou Final"
          className="input-elegant"
        />
      </Field>
      <Field label="onde (opcional)">
        <input
          value={p.location}
          onChange={(e) => p.setLocation(e.target.value)}
          placeholder="Ex.: sala 102"
          className="input-elegant"
        />
      </Field>
      <ReminderField value={p.reminder} onChange={p.setReminder} />
    </>
  );
}

// ---- Task ---------------------------------------------------------------

interface TaskFieldsProps {
  subjects: Subject[];
  title: string;
  setTitle: (v: string) => void;
  category: TaskCategory;
  setCategory: (v: TaskCategory) => void;
  date: string;
  setDate: (v: string) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;
  subjectId: string;
  setSubjectId: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  reminder: number | undefined;
  setReminder: (v: number | undefined) => void;
}

function TaskFields(p: TaskFieldsProps) {
  return (
    <>
      <Field label="título">
        <input
          autoFocus
          value={p.title}
          onChange={(e) => p.setTitle(e.target.value)}
          placeholder="Ex.: estágio HC, almoço com a Marina"
          className="input-elegant"
        />
      </Field>
      <Field label="categoria">
        <select
          value={p.category}
          onChange={(e) => p.setCategory(e.target.value as TaskCategory)}
          className="input-elegant"
        >
          {TASK_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {TASK_CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="data">
        <input
          type="date"
          value={p.date}
          onChange={(e) => p.setDate(e.target.value)}
          className="input-elegant"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="começa (opcional)">
          <input
            type="time"
            value={p.startTime}
            onChange={(e) => p.setStartTime(e.target.value)}
            className="input-elegant"
          />
        </Field>
        <Field label="termina (opcional)">
          <input
            type="time"
            value={p.endTime}
            onChange={(e) => p.setEndTime(e.target.value)}
            className="input-elegant"
          />
        </Field>
      </div>
      <Field label="disciplina (opcional)">
        <SubjectSelect
          subjects={p.subjects}
          value={p.subjectId}
          onChange={p.setSubjectId}
          allowEmpty
        />
      </Field>
      <Field label="onde (opcional)">
        <input
          value={p.location}
          onChange={(e) => p.setLocation(e.target.value)}
          placeholder="Ex.: HC, cafeteria"
          className="input-elegant"
        />
      </Field>
      <Field label="descrição (opcional)">
        <textarea
          value={p.description}
          onChange={(e) => p.setDescription(e.target.value)}
          rows={2}
          placeholder="detalhes que você queira lembrar"
          className="input-elegant resize-none"
        />
      </Field>
      <ReminderField value={p.reminder} onChange={p.setReminder} />
    </>
  );
}
