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

type Track = 'medicina' | 'odonto';

function sessionsCollectionName(track: Track): string {
  return `sessions_${track}`;
}

export const cloudSessions = {
  collectionRef(uid?: string, track: Track = 'medicina') {
    return collection(firestore, 'users', uid ?? requireUid(), sessionsCollectionName(track));
  },

  /**
   * Lê sessões da trilha. Migração transparente em medicina: se a coleção
   * track-namespaced está vazia, lê da coleção antiga 'sessions' (legacy)
   * — preserva dados das usuárias atuais sem mexer no Firestore.
   */
  async list(uid?: string, track: Track = 'medicina'): Promise<QuizSession[]> {
    const targetUid = uid ?? requireUid();
    const trackedQ = query(
      collection(firestore, 'users', targetUid, sessionsCollectionName(track)),
      orderBy('startedAt', 'desc'),
    );
    const snap = await getDocs(trackedQ);
    if (snap.empty && track === 'medicina') {
      const legacyQ = query(
        collection(firestore, 'users', targetUid, 'sessions'),
        orderBy('startedAt', 'desc'),
      );
      const legacy = await getDocs(legacyQ);
      return legacy.docs.map((d) => d.data() as QuizSession);
    }
    return snap.docs.map((d) => d.data() as QuizSession);
  },

  async save(session: QuizSession, track: Track = 'medicina') {
    const uid = requireUid();
    const ref = doc(firestore, 'users', uid, sessionsCollectionName(track), session.id);
    await setDoc(ref, session);
  },

  async clearAll(uid?: string, track?: Track) {
    const targetUid = uid ?? requireUid();
    const names = track ? [sessionsCollectionName(track)] : ['sessions', 'sessions_medicina', 'sessions_odonto'];
    for (const name of names) {
      const snap = await getDocs(collection(firestore, 'users', targetUid, name));
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    }
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

function srsCollectionName(track: Track): string {
  return `srs_${track}`;
}

export const cloudSrs = {
  async getAll(uid?: string, track: Track = 'medicina'): Promise<Record<string, CloudCardState>> {
    const targetUid = uid ?? requireUid();
    const snap = await getDocs(collection(firestore, 'users', targetUid, srsCollectionName(track)));
    const out: Record<string, CloudCardState> = {};
    snap.docs.forEach((d) => {
      out[d.id] = d.data() as CloudCardState;
    });
    if (Object.keys(out).length === 0 && track === 'medicina') {
      const legacy = await getDocs(collection(firestore, 'users', targetUid, 'srs'));
      legacy.docs.forEach((d) => {
        out[d.id] = d.data() as CloudCardState;
      });
    }
    return out;
  },

  async get(cardId: string, track: Track = 'medicina'): Promise<CloudCardState | null> {
    const uid = requireUid();
    const ref = doc(firestore, 'users', uid, srsCollectionName(track), cardId);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as CloudCardState) : null;
  },

  async save(state: CloudCardState, track: Track = 'medicina') {
    const uid = requireUid();
    const ref = doc(firestore, 'users', uid, srsCollectionName(track), state.cardId);
    await setDoc(ref, state);
  },

  async clearAll(uid?: string, track?: Track) {
    const targetUid = uid ?? requireUid();
    const names = track ? [srsCollectionName(track)] : ['srs', 'srs_medicina', 'srs_odonto'];
    for (const name of names) {
      const snap = await getDocs(collection(firestore, 'users', targetUid, name));
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    }
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
