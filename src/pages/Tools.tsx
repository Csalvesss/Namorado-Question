import { Link } from 'react-router-dom';
import { Calculator, Moon, Pill, Shuffle, Siren, Workflow, BookOpen } from 'lucide-react';
import { useMemo } from 'react';
import ToolCard from '../components/ToolCard';
import Eyebrow from '../components/ui/Eyebrow';
import IconChip from '../components/ui/IconChip';
import { useSessions } from '../lib/useSessions';
import { useUser } from '../lib/useUser';

export default function Tools() {
  const { user } = useUser();
  const { sessions } = useSessions();

  const mistakeCount = useMemo(() => {
    if (!user) return 0;
    const wrongIds = new Set<string>();
    sessions
      .filter((s) => s.userId === user.uid && s.completedAt)
      .forEach((s) =>
        s.answers.forEach((a) => {
          if (!a.isRight) wrongIds.add(a.questionId);
        }),
      );
    return wrongIds.size;
  }, [user, sessions]);

  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-10 sm:py-20 lg:px-20">
        <Eyebrow>capítulo dois</Eyebrow>

        <div className="mt-4 flex items-baseline gap-5">
          <span className="font-display text-[3rem] italic font-light leading-none text-rose">
            II
          </span>
          <h1 className="font-display font-light text-ink text-[clamp(2rem,5vw,3rem)] leading-[1.05]">
            Ferramentas de estudo
          </h1>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <ToolCard
            to="/casos"
            icon={Siren}
            title="Simulações"
            description="Casos clínicos imersivos. Pressão de plantão, decisões que pesam."
            variant="wine"
          />
          <ToolCard
            to="/farmaco-mdc"
            icon={Pill}
            title="Mapa de Decisão Clínica"
            description="Para fixar os 156 fármacos da P2 sem decorar lista. Você decora pelo cenário."
            variant="wine"
          />
          <ToolCard
            to="/algoritmos"
            icon={Workflow}
            title="Algoritmos"
            description="Fluxogramas de decisão clínica interativos. Treine protocolos como no plantão."
          />
          <ToolCard
            to="/intercalado"
            icon={Shuffle}
            title="Modo intercalado"
            description="20 questões sorteadas entre cursos. Treina discriminação entre diagnósticos parecidos."
          />
          <ToolCard
            to="/calculadoras"
            icon={Calculator}
            title="Calculadoras"
            description="CKD-EPI, Wells, CHA₂DS₂-VASc, MELD, Glasgow, APGAR, IMC."
          />
          <ToolCard
            to="/passa-facil"
            icon={Moon}
            title="Passa-fácil noturno"
            description="Dez flashcards aleatórios, sem cobrança. Pra relembrar antes de dormir."
          />
        </div>

        {/* Banner Caderno de erros */}
        <Link
          to="/erros"
          className="mt-8 flex items-center justify-between gap-4 rounded-3xl border border-[var(--blush-stroke)] bg-blush px-7 py-6 shadow-soft transition hover:shadow-lift active:scale-[0.99]"
        >
          <div className="flex items-center gap-5">
            <IconChip icon={BookOpen} tone="blush" size="lg" className="bg-white/60" />
            <div>
              <h3 className="font-display text-2xl italic text-ink">Caderno de erros</h3>
              <p className="mt-1 font-body text-sm italic text-mute">
                {mistakeCount > 0
                  ? `${mistakeCount} ${mistakeCount === 1 ? 'questão errada esperando revisão.' : 'questões erradas esperando revisão.'}`
                  : 'sem questões erradas registradas — segue assim.'}
              </p>
            </div>
          </div>
          <span className="hidden font-display text-sm italic text-wine sm:inline-flex items-center gap-2 rounded-full bg-wine px-6 py-3 text-[#FBEFEC] shadow-wine">
            abrir caderno
          </span>
        </Link>

        {/* Carta da casa — preserva tom afetivo */}
        <div className="mt-16 border-t border-line pt-10">
          <Eyebrow>uma carta da casa</Eyebrow>
          <p className="mt-5 max-w-2xl font-body text-[17px] leading-relaxed text-txt/80">
            Cada questão aqui foi escolhida com cuidado, no seu tempo, para você revisar entre um
            descanso e outro. Estuda tranquila, respira quando precisar e lembra: a gente faz isso
            junto. Quando quiser uma pausa, abre um bilhete. Quando quiser acelerar, manda um
            simulado. O ritmo é seu.
          </p>
        </div>
      </div>
    </section>
  );
}
