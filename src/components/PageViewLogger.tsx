import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../lib/useUser';
import { recordPageView } from '../lib/access';
import { screenLabelForPath } from '../lib/screens';

/**
 * Sentinela invisível: a cada troca de rota, registra em /access_logs qual tela
 * a usuária logada acessou (kind='pageview'). Fica montado uma vez no App, então
 * cobre todas as rotas — inclusive o próprio /admin.
 *
 * Só grava com usuária logada; telas públicas (login, boas-vindas) são ignoradas.
 * Se a sessão for uma impersonação de admin, marca isso no log.
 */
export default function PageViewLogger() {
  const location = useLocation();
  const { user } = useUser();
  const uid = user?.uid;
  const email = user?.email;

  useEffect(() => {
    if (!uid || !email) return;
    const path = location.pathname;
    const screen = screenLabelForPath(path);
    const impersonatedBy =
      typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem('guava:impersonatedBy') ?? undefined
        : undefined;
    void recordPageView({ uid, email, path, screen, impersonatedBy });
  }, [location.pathname, uid, email]);

  return null;
}
