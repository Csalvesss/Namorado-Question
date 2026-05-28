import { cloudStudyPlan } from './cloud-db';
import type { ClassEvent, ExamEvent, Subject } from '../types';

const SUBJECTS_PREFIX = 'guava.subjects.';
const CLASSES_PREFIX = 'guava.classes.';
const EXAMS_PREFIX = 'guava.exams.';

export const STUDY_PLAN_CHANGE_EVENT = 'guava:study-plan-change';

export const SUBJECT_PALETTE = [
  '#7C2D3A',
  '#B8895F',
  '#5B6E59',
  '#8B5A8C',
  '#C97064',
  '#5C7E97',
  '#A88762',
  '#6E5B7E',
];

function emitChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDY_PLAN_CHANGE_EVENT));
  }
}

function loadJson<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[];
  } catch {
    return [];
  }
}

function saveJson<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

function subjectsKey(uid: string) {
  return SUBJECTS_PREFIX + uid;
}
function classesKey(uid: string) {
  return CLASSES_PREFIX + uid;
}
function examsKey(uid: string) {
  return EXAMS_PREFIX + uid;
}

export function listSubjects(uid: string): Subject[] {
  return loadJson<Subject>(subjectsKey(uid)).sort((a, b) => a.name.localeCompare(b.name, 'pt'));
}

export function listClasses(uid: string): ClassEvent[] {
  return loadJson<ClassEvent>(classesKey(uid)).sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
    return a.startTime.localeCompare(b.startTime);
  });
}

export function listExams(uid: string): ExamEvent[] {
  return loadJson<ExamEvent>(examsKey(uid)).sort((a, b) => {
    const cmp = a.date.localeCompare(b.date);
    if (cmp !== 0) return cmp;
    return (a.time ?? '').localeCompare(b.time ?? '');
  });
}

export function saveSubject(uid: string, subject: Subject) {
  const list = loadJson<Subject>(subjectsKey(uid));
  const idx = list.findIndex((s) => s.id === subject.id);
  if (idx >= 0) list[idx] = subject;
  else list.push(subject);
  saveJson(subjectsKey(uid), list);
  emitChange();
  cloudStudyPlan.saveSubject(subject).catch(() => {});
}

export function removeSubject(uid: string, subjectId: string) {
  saveJson(
    subjectsKey(uid),
    loadJson<Subject>(subjectsKey(uid)).filter((s) => s.id !== subjectId),
  );
  saveJson(
    classesKey(uid),
    loadJson<ClassEvent>(classesKey(uid)).filter((c) => c.subjectId !== subjectId),
  );
  saveJson(
    examsKey(uid),
    loadJson<ExamEvent>(examsKey(uid)).filter((e) => e.subjectId !== subjectId),
  );
  emitChange();
  cloudStudyPlan.removeSubject(subjectId).catch(() => {});
}

export function saveClass(uid: string, event: ClassEvent) {
  const list = loadJson<ClassEvent>(classesKey(uid));
  const idx = list.findIndex((c) => c.id === event.id);
  if (idx >= 0) list[idx] = event;
  else list.push(event);
  saveJson(classesKey(uid), list);
  emitChange();
  cloudStudyPlan.saveClass(event).catch(() => {});
}

export function removeClass(uid: string, eventId: string) {
  saveJson(
    classesKey(uid),
    loadJson<ClassEvent>(classesKey(uid)).filter((c) => c.id !== eventId),
  );
  emitChange();
  cloudStudyPlan.removeClass(eventId).catch(() => {});
}

export function saveExam(uid: string, event: ExamEvent) {
  const list = loadJson<ExamEvent>(examsKey(uid));
  const idx = list.findIndex((e) => e.id === event.id);
  if (idx >= 0) list[idx] = event;
  else list.push(event);
  saveJson(examsKey(uid), list);
  emitChange();
  cloudStudyPlan.saveExam(event).catch(() => {});
}

export function removeExam(uid: string, eventId: string) {
  saveJson(
    examsKey(uid),
    loadJson<ExamEvent>(examsKey(uid)).filter((e) => e.id !== eventId),
  );
  emitChange();
  cloudStudyPlan.removeExam(eventId).catch(() => {});
}

export async function hydrateStudyPlanFromCloud(uid: string): Promise<void> {
  try {
    const [subjects, classes, exams] = await Promise.all([
      cloudStudyPlan.listSubjects(uid),
      cloudStudyPlan.listClasses(uid),
      cloudStudyPlan.listExams(uid),
    ]);
    saveJson(subjectsKey(uid), subjects);
    saveJson(classesKey(uid), classes);
    saveJson(examsKey(uid), exams);
    emitChange();
  } catch {
    // ignore, local cache continues working offline
  }
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function daysUntil(isoDate: string, now: Date = new Date()): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  const target = new Date(y, (m ?? 1) - 1, d ?? 1).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - today) / (24 * 60 * 60 * 1000));
}
