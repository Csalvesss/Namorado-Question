import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { firebaseAuth, firestore } from './firebase';
import type {
  ClassEvent,
  Course,
  ExamEvent,
  Question,
  QuizSession,
  Subject,
} from '../types';

function requireUid(): string {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) throw new Error('Sem usuário autenticado.');
  return uid;
}

export const cloudSessions = {
  collectionRef(uid?: string) {
    return collection(firestore, 'users', uid ?? requireUid(), 'sessions');
  },

  async list(uid?: string): Promise<QuizSession[]> {
    const targetUid = uid ?? requireUid();
    const q = query(
      collection(firestore, 'users', targetUid, 'sessions'),
      orderBy('startedAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as QuizSession);
  },

  async save(session: QuizSession) {
    const uid = requireUid();
    const ref = doc(firestore, 'users', uid, 'sessions', session.id);
    await setDoc(ref, session);
  },

  async clearAll(uid?: string) {
    const targetUid = uid ?? requireUid();
    const snap = await getDocs(collection(firestore, 'users', targetUid, 'sessions'));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  },
};

export interface CloudCardState {
  cardId: string;
  ease: number;
  interval: number;
  reps: number;
  due: number;
  lapses: number;
  lastReviewed?: number;
}

export const cloudSrs = {
  async getAll(uid?: string): Promise<Record<string, CloudCardState>> {
    const targetUid = uid ?? requireUid();
    const snap = await getDocs(collection(firestore, 'users', targetUid, 'srs'));
    const out: Record<string, CloudCardState> = {};
    snap.docs.forEach((d) => {
      out[d.id] = d.data() as CloudCardState;
    });
    return out;
  },

  async get(cardId: string): Promise<CloudCardState | null> {
    const uid = requireUid();
    const ref = doc(firestore, 'users', uid, 'srs', cardId);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as CloudCardState) : null;
  },

  async save(state: CloudCardState) {
    const uid = requireUid();
    const ref = doc(firestore, 'users', uid, 'srs', state.cardId);
    await setDoc(ref, state);
  },

  async clearAll(uid?: string) {
    const targetUid = uid ?? requireUid();
    const snap = await getDocs(collection(firestore, 'users', targetUid, 'srs'));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  },
};

export type CloudCustomCourse = Course & { questions: Question[] };

export const cloudCourses = {
  async list(uid?: string): Promise<CloudCustomCourse[]> {
    const targetUid = uid ?? requireUid();
    const snap = await getDocs(collection(firestore, 'users', targetUid, 'customCourses'));
    return snap.docs.map((d) => d.data() as CloudCustomCourse);
  },

  async save(uid: string, course: Course, questions: Question[]) {
    const ref = doc(firestore, 'users', uid, 'customCourses', course.id);
    const payload: CloudCustomCourse = { ...course, questions };
    await setDoc(ref, payload);
  },

  async remove(uid: string, courseId: string) {
    const ref = doc(firestore, 'users', uid, 'customCourses', courseId);
    await deleteDoc(ref);
  },
};

export const cloudStudyPlan = {
  async listSubjects(uid?: string): Promise<Subject[]> {
    const targetUid = uid ?? requireUid();
    const snap = await getDocs(collection(firestore, 'users', targetUid, 'subjects'));
    return snap.docs.map((d) => d.data() as Subject);
  },

  async saveSubject(subject: Subject) {
    const uid = requireUid();
    const ref = doc(firestore, 'users', uid, 'subjects', subject.id);
    await setDoc(ref, subject);
  },

  async removeSubject(subjectId: string) {
    const uid = requireUid();
    await deleteDoc(doc(firestore, 'users', uid, 'subjects', subjectId));
  },

  async listClasses(uid?: string): Promise<ClassEvent[]> {
    const targetUid = uid ?? requireUid();
    const snap = await getDocs(collection(firestore, 'users', targetUid, 'classes'));
    return snap.docs.map((d) => d.data() as ClassEvent);
  },

  async saveClass(event: ClassEvent) {
    const uid = requireUid();
    const ref = doc(firestore, 'users', uid, 'classes', event.id);
    await setDoc(ref, event);
  },

  async removeClass(eventId: string) {
    const uid = requireUid();
    await deleteDoc(doc(firestore, 'users', uid, 'classes', eventId));
  },

  async listExams(uid?: string): Promise<ExamEvent[]> {
    const targetUid = uid ?? requireUid();
    const snap = await getDocs(collection(firestore, 'users', targetUid, 'exams'));
    return snap.docs.map((d) => d.data() as ExamEvent);
  },

  async saveExam(event: ExamEvent) {
    const uid = requireUid();
    const ref = doc(firestore, 'users', uid, 'exams', event.id);
    await setDoc(ref, event);
  },

  async removeExam(eventId: string) {
    const uid = requireUid();
    await deleteDoc(doc(firestore, 'users', uid, 'exams', eventId));
  },
};
