import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import Eyebrow from '../components/ui/Eyebrow';
import IconChip from '../components/ui/IconChip';
import { useUser } from '../lib/useUser';

/**
 * Placeholder visual para ferramentas odonto que ainda não estão prontas
 * (Simulações de consultório, Algoritmos clínicos). Substitui o
 * conteúdo medicina dessas rotas quando user.track === 'odonto'.
 */
export default function OdontoEmBreve() {
  const { user } = useUser();
  const isNamorado = user?.displayMode !== 'doutora';
  const location = useLocation();

  const config = configFor(location.pathname);

  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-3xl px-6 py-14 sm:px-10 sm:py-20 lg:px-12">
        <Link
          to="/ferramentas"
          className="inline-flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.22em] text-mute transition hover:text-wine"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={2} /> voltar para ferramentas
        </Link>

        <div className="mt-6 flex items-baseline gap-5">
          <IconChip icon={Clock} size="lg" />
          <h1 className="font-display font-light text-ink text-[clamp(2rem,5vw,3rem)] leading-[1.05]">
            {config.title}
          </h1>
        </div>

        <p className="mt-4 max-w-xl font-body text-lg italic leading-relaxed text-mute">
          {isNamorado
            ? config.subtitleNamorado
            : config.subtitleDoutora}
        </p>

        <div className="card mt-10 p-8 sm:p-10">
          <Eyebrow>em desenvolvimento</Eyebrow>
          <p className="mt-4 font-body text-[15px] leading-relaxed text-txt/85">
            {config.body}
          </p>
          <div className="mt-6 border-t border-line pt-5">
            <p className="font-body text-sm italic text-mute">{config.altSuggestion}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function configFor(pathname: string) {
  if (pathname.startsWith('/simulacoes-odonto')) {
    return {
      title: 'Simulações de consultório',
      subtitleNamorado: 'casos clínicos imersivos da rotina do consultório — em construção.',
      subtitleDoutora: 'casos clínicos imersivos da rotina ambulatorial — em construção.',
      body:
        'Estamos finalizando a curadoria dos primeiros casos: paciente cardiopata + extração, gestante com dor de dente, criança ansiosa em primeira consulta, paciente em anticoagulação. Cada caso vai correr em turnos, com decisões em tempo real e desfecho clínico.',
      altSuggestion:
        'Enquanto isso, a Cadeira Ansiosa e o Mapa de Decisão Clínica cobrem a maior parte das decisões críticas da prática.',
    };
  }
  // /algoritmos-odonto
  return {
    title: 'Algoritmos clínicos',
    subtitleNamorado: 'fluxogramas de decisão odontológica — em construção.',
    subtitleDoutora: 'fluxogramas de decisão odontológica — em construção.',
    body:
      'Estamos montando os primeiros: manejo do paciente anticoagulado, profilaxia de endocardite passo a passo, manejo do paciente diabético, conduta no abscesso periapical com celulite, escalonamento de antibiótico após falha em 72h.',
    altSuggestion:
      'Enquanto isso, o Receituário Guiado já valida o passo final (a prescrição), e as Calculadoras cobrem a profilaxia e o anticoagulado.',
  };
}
