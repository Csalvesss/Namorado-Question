import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Syringe } from 'lucide-react';
import Eyebrow from '../components/ui/Eyebrow';
import IconChip from '../components/ui/IconChip';
import { useUser } from '../lib/useUser';

// Versão dedicada e expandida da calculadora de anestésico local.
// Diferença vs /calculadoras → mostra TODOS os anestésicos lado a lado
// pra um mesmo peso, com visualização gráfica e recomendação por cenário.

interface AnestesicoSpec {
  id: string;
  short: string;
  full: string;
  concentration: number; // %
  mgPerKg: number;
  ceiling: number;
  tubeteMl: number;
  preferredFor: string;
  avoidIn: string;
  withVaso: boolean;
}

const ANESTESICOS: AnestesicoSpec[] = [
  {
    id: 'lido2',
    short: 'Lido 2%',
    full: 'Lidocaína 2% c/ epi 1:100.000',
    concentration: 2,
    mgPerKg: 4.4,
    ceiling: 300,
    tubeteMl: 1.8,
    preferredFor: 'Padrão — bloqueio alveolar inferior',
    avoidIn: 'Cardiopata descompensado, hipertireoidismo',
    withVaso: true,
  },
  {
    id: 'arti4',
    short: 'Articaína 4%',
    full: 'Articaína 4% c/ epi 1:100.000',
    concentration: 4,
    mgPerKg: 7,
    ceiling: 500,
    tubeteMl: 1.8,
    preferredFor: 'Infiltrativa em molar inferior (alta difusão óssea)',
    avoidIn: 'Bloqueio mandibular (parestesia), <4 anos (bula)',
    withVaso: true,
  },
  {
    id: 'mepi2',
    short: 'Mepi 2%',
    full: 'Mepivacaína 2% c/ epi 1:100.000',
    concentration: 2,
    mgPerKg: 4.4,
    ceiling: 300,
    tubeteMl: 1.8,
    preferredFor: 'Pulpar curta, início rápido',
    avoidIn: 'Mesmas restrições gerais da epi',
    withVaso: true,
  },
  {
    id: 'mepi3',
    short: 'Mepi 3% SEM vaso',
    full: 'Mepivacaína 3% SEM vasoconstritor',
    concentration: 3,
    mgPerKg: 4.4,
    ceiling: 300,
    tubeteMl: 1.8,
    preferredFor: 'Cardiopata isquêmico recente, HAS descompensada',
    avoidIn: 'Procedimento longo (duração curta ~20 min em mole)',
    withVaso: false,
  },
  {
    id: 'prilo3',
    short: 'Prilo 3%',
    full: 'Prilocaína 3% c/ felipressina',
    concentration: 3,
    mgPerKg: 6,
    ceiling: 400,
    tubeteMl: 1.8,
    preferredFor: 'Gestante (felipressina sem efeito uterotônico)',
    avoidIn: 'G6PD, dose alta (meta-hemoglobinemia)',
    withVaso: true,
  },
  {
    id: 'bupi05',
    short: 'Bupi 0,5%',
    full: 'Bupivacaína 0,5% c/ epi 1:200.000',
    concentration: 0.5,
    mgPerKg: 1.3,
    ceiling: 90,
    tubeteMl: 1.8,
    preferredFor: 'Pós-op de cirurgia (6-8h pulpar)',
    avoidIn: 'Sobredose tem cardiotoxicidade grave — respeitar teto',
    withVaso: true,
  },
];

export default function CalculoTubetes() {
  const { user } = useUser();
  const isNamorado = user?.displayMode !== 'doutora';
  const [weight, setWeight] = useState('70');
  const [asa, setAsa] = useState<'saudavel' | 'cardiopata' | 'descomp'>('saudavel');

  const w = parseFloat(weight);
  const valid = !isNaN(w) && w > 0;

  const rows = useMemo(() => {
    if (!valid) return [];
    return ANESTESICOS.map((spec) => {
      const doseMaxKg = w * spec.mgPerKg;
      const doseMaxAbs = Math.min(doseMaxKg, spec.ceiling);
      const safeDose = asa === 'saudavel' ? doseMaxAbs : asa === 'cardiopata' ? doseMaxAbs * 0.7 : 0;
      const mgPerTubete = spec.concentration * 10 * spec.tubeteMl;
      const tubetes = safeDose / mgPerTubete;
      const tubetesInteiros = Math.floor(tubetes);
      const blocked = asa === 'descomp' && spec.withVaso;
      return { spec, doseMaxAbs, safeDose, mgPerTubete, tubetes, tubetesInteiros, blocked };
    });
  }, [valid, w, asa]);

  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-10 sm:py-20 lg:px-20">
        <Link
          to="/ferramentas"
          className="inline-flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.22em] text-mute transition hover:text-wine"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={2} /> voltar para ferramentas
        </Link>

        <div className="mt-6 flex items-baseline gap-5">
          <IconChip icon={Syringe} size="lg" />
          <h1 className="font-display font-light text-ink text-[clamp(2rem,5vw,3rem)] leading-[1.05]">
            Cálculo de tubetes
          </h1>
        </div>

        <p className="mt-4 max-w-xl font-body text-lg italic leading-relaxed text-mute">
          {isNamorado
            ? 'pra você ver, no mesmo peso, quantos tubetes dá em cada anestésico. tubete é a unidade que conta na cadeira.'
            : 'comparação lado a lado de dose máxima e número de tubetes seguros por anestésico.'}
        </p>

        {/* Controles */}
        <div className="card mt-10 p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[11px] uppercase tracking-wider text-mute">
                peso do paciente <span className="ml-1 normal-case">(kg)</span>
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                step="1"
                min="1"
                className="input-elegant"
              />
            </label>
            <div>
              <span className="mb-1 block text-[11px] uppercase tracking-wider text-mute">
                estado do paciente
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: 'saudavel', label: 'saudável (ASA I-II)' },
                  { v: 'cardiopata', label: 'cardiopata estável' },
                  { v: 'descomp', label: 'descompensado' },
                ].map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setAsa(o.v as 'saudavel' | 'cardiopata' | 'descomp')}
                    className={`inline-flex min-h-touch items-center rounded-full border px-3.5 py-1.5 font-display text-[12px] italic transition ${
                      asa === o.v
                        ? 'border-wine bg-wine text-[#FBEFEC]'
                        : 'border-line bg-card text-mute hover:border-wine/40'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabela comparativa */}
        {valid && (
          <div className="card mt-6 overflow-hidden p-0">
            <div className="no-scrollbar overflow-x-auto">
              <table className="w-full min-w-[480px] table-auto text-left text-sm">
                <thead className="bg-blush/60">
                  <tr className="font-display text-[11px] uppercase tracking-[0.18em] text-wine">
                    <th className="px-4 py-3">anestésico</th>
                    <th className="px-4 py-3 text-right">mg/kg</th>
                    <th className="px-4 py-3 text-right">teto</th>
                    <th className="px-4 py-3 text-right">tubetes</th>
                    <th className="hidden px-4 py-3 sm:table-cell">indicação</th>
                  </tr>
                </thead>
              <tbody className="font-body text-[14px] text-txt">
                {rows.map(({ spec, tubetes, tubetesInteiros, blocked }) => (
                  <tr key={spec.id} className="border-t border-line/70">
                    <td className="px-4 py-4">
                      <div className="font-display italic text-ink">{spec.short}</div>
                      <div className="text-[12px] italic text-mute">
                        {spec.concentration}% · tubete 1,8 mL ={' '}
                        {(spec.concentration * 10 * spec.tubeteMl).toFixed(0)} mg
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-mute">{spec.mgPerKg}</td>
                    <td className="px-4 py-4 text-right text-mute">{spec.ceiling} mg</td>
                    <td className="px-4 py-4 text-right">
                      {blocked ? (
                        <span className="font-display text-xs italic text-mute">CI</span>
                      ) : (
                        <div>
                          <div className="font-display text-xl italic text-wine">
                            {tubetesInteiros}
                          </div>
                          <div className="text-[11px] italic text-mute">
                            ({tubetes.toFixed(1)})
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="hidden px-4 py-4 sm:table-cell">
                      <div className="text-[13px] italic text-txt/85">{spec.preferredFor}</div>
                      <div className="mt-0.5 text-[12px] italic text-mute">
                        evitar: {spec.avoidIn}
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Visualização gráfica */}
        {valid && rows.length > 0 && (
          <div className="card mt-6 p-6 sm:p-8">
            <Eyebrow>visualização — tubetes seguros</Eyebrow>
            <div className="mt-5 space-y-4">
              {rows.map(({ spec, tubetesInteiros, blocked }) => (
                <div key={spec.id}>
                  <div className="mb-1.5 flex items-baseline justify-between font-display text-sm italic">
                    <span className="text-ink">{spec.short}</span>
                    <span className="text-mute">
                      {blocked ? 'contraindicado' : `${tubetesInteiros} tubetes`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {blocked ? (
                      <span className="inline-block h-6 w-full max-w-[80px] rounded-sm bg-mute/20" />
                    ) : (
                      Array.from({ length: Math.max(tubetesInteiros, 0) }).map((_, i) => (
                        <span
                          key={i}
                          className="inline-block h-6 w-3 rounded-sm bg-wine"
                          title={`tubete ${i + 1}`}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 font-body text-xs italic text-mute">
              Cálculo de referência. Em cardiopata estável, margem reduzida em ~30%. Em
              descompensado, anestésicos com vasoconstritor são contraindicados — usar mepivacaína
              3% sem vaso ou prilocaína c/ felipressina. Sempre considere também o limite total de
              epinefrina (200 µg saudável; 40 µg cardiopata estável).
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
