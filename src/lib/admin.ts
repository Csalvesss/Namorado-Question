// E-mails que recebem papel de admin automaticamente. Mude AQUI se um dia
// precisar adicionar outro admin — o gate em runtime (rules + functions)
// usa o campo `role` no doc do usuário, então só listar o e-mail não basta:
// a primeira vez que esse e-mail logar, o cliente seta role='admin' no doc,
// e as rules do Firestore validam por esse campo.
//
// IMPORTANTE: a fonte de verdade *de segurança* são as Firestore rules + as
// Cloud Functions. Esta lista no cliente é só pra UX (esconder/mostrar coisas)
// e pra fazer o "self-heal" do role no doc.
export const ADMIN_EMAILS: ReadonlyArray<string> = [
  'ads.cesaralves@gmail.com',
  'guavacodex@gmail.com',
] as const;

import type { UserProfile } from '../types';

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function isAdmin(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  // Fallback: se o doc ainda não foi atualizado mas o e-mail é admin, considera admin.
  return isAdminEmail(user.email);
}

/**
 * Status efetivo do usuário pra gate.
 * Ausência de campo = usuária antiga (grandfathered → approved).
 */
export function effectiveStatus(
  user: Pick<UserProfile, 'status' | 'email'> | null | undefined,
): 'approved' | 'pending' | 'blocked' {
  if (!user) return 'pending';
  // Admins nunca ficam pendentes — segurança caso o doc esteja torto.
  if (isAdminEmail(user.email)) return 'approved';
  if (!user.status) return 'approved';
  return user.status;
}

export function isApproved(user: UserProfile | null | undefined): boolean {
  return effectiveStatus(user) === 'approved';
}
