import { useState } from 'react';
import {
  SUBJECT_PALETTE,
  newId,
  removeSubject,
  saveSubject,
} from '../../lib/studyPlan';
import type { Subject } from '../../types';
import { Field, ModalShell } from './ModalShell';

export interface SubjectEditorProps {
  uid: string;
  initial: Subject | null;
  onClose: () => void;
}

/**
 * Modal de criação/edição de disciplina. Extraído de StudyPlan.tsx para que o
 * EventEditor (e quaisquer outros consumidores futuros) possam reabrir o cadastro
 * de disciplinas sem duplicar lógica.
 */
export default function SubjectEditor({ uid, initial, onClose }: SubjectEditorProps) {
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
    if (
      confirm(
        `Remover ${initial.name}? Aulas e provas dessa disciplina também serão removidas.`,
      )
    ) {
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
                color === c ? 'scale-110 border-wine-deep' : 'border-paper'
              }`}
              style={{ background: c }}
            />
          ))}
        </div>
      </Field>
    </ModalShell>
  );
}
