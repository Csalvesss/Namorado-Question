import { useMemo, useState } from 'react';
import {
  Activity,
  Brain,
  Calculator,
  Droplets,
  Heart,
  HeartPulse,
  Stethoscope,
  Syringe,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import { useUser } from '../lib/useUser';

type Sex = 'M' | 'F';

interface ToolDef {
  id: string;
  name: string;
  short: string;
  Icon: LucideIcon;
  track: 'medicina' | 'odonto';
  render: () => JSX.Element;
}

export default function Calculators() {
  const { user } = useUser();
  const userTrack = user?.track ?? 'medicina';
  const [active, setActive] = useState<string | null>(null);
  const allTools = useMemo<ToolDef[]>(
    () => [
      // Medicina
      {
        id: 'ckd',
        name: 'CKD-EPI',
        short: 'taxa de filtração glomerular estimada (eGFR) pela equação CKD-EPI 2021.',
        Icon: Droplets,
        track: 'medicina',
        render: () => <CkdEpiTool />,
      },
      {
        id: 'wells-dvt',
        name: 'Wells (TVP)',
        short: 'probabilidade clínica de trombose venosa profunda.',
        Icon: Activity,
        track: 'medicina',
        render: () => <WellsDvtTool />,
      },
      {
        id: 'wells-pe',
        name: 'Wells (TEP)',
        short: 'probabilidade clínica de tromboembolismo pulmonar.',
        Icon: Wind,
        track: 'medicina',
        render: () => <WellsPeTool />,
      },
      {
        id: 'cha2ds2',
        name: 'CHA₂DS₂-VASc',
        short: 'risco de AVC em fibrilação atrial não valvar.',
        Icon: HeartPulse,
        track: 'medicina',
        render: () => <Cha2ds2VascTool />,
      },
      {
        id: 'meld',
        name: 'MELD',
        short: 'gravidade de doença hepática crônica e priorização para transplante.',
        Icon: Stethoscope,
        track: 'medicina',
        render: () => <MeldTool />,
      },
      {
        id: 'glasgow',
        name: 'Glasgow',
        short: 'escala de coma de Glasgow (abertura ocular + verbal + motor).',
        Icon: Brain,
        track: 'medicina',
        render: () => <GlasgowTool />,
      },
      {
        id: 'apgar',
        name: 'APGAR',
        short: 'avaliação do recém-nascido no 1º e 5º minuto.',
        Icon: Heart,
        track: 'medicina',
        render: () => <ApgarTool />,
      },
      {
        id: 'bmi',
        name: 'IMC',
        short: 'índice de massa corporal com classificação.',
        Icon: Calculator,
        track: 'medicina',
        render: () => <BmiTool />,
      },
      // Odonto
      {
        id: 'anest-local',
        name: 'Dose máx anestésico local',
        short: 'dose máxima e número de tubetes seguros por peso, escolhendo lidocaína, articaína, mepivacaína, prilocaína ou bupivacaína.',
        Icon: Syringe,
        track: 'odonto',
        render: () => <AnestesicoTool />,
      },
      {
        id: 'vasoconstritor',
        name: 'Conversor de vasoconstritor',
        short: 'µg de epinefrina por tubete (1:100.000 vs 1:200.000) e limite por comorbidade cardiovascular.',
        Icon: Droplets,
        track: 'odonto',
        render: () => <VasoconstritorTool />,
      },
      {
        id: 'profilaxia',
        name: 'Profilaxia de endocardite',
        short: 'amoxicilina 50 mg/kg até 2 g 30-60 min antes (ou clindamicina 600 mg se alérgico) — checklist AHA 2021.',
        Icon: Heart,
        track: 'odonto',
        render: () => <ProfilaxiaEndocarditeTool />,
      },
      {
        id: 'pediatrico',
        name: 'Dose pediátrica',
        short: 'amox, paracetamol, ibuprofeno e dipirona por peso, com conversão automática para suspensão (mL).',
        Icon: Calculator,
        track: 'odonto',
        render: () => <PediatricoTool />,
      },
      {
        id: 'anticoagulado',
        name: 'Paciente anticoagulado',
        short: 'decisão de manter/suspender varfarina por INR, manejo de DOAC + bochecho de ácido tranexâmico.',
        Icon: Activity,
        track: 'odonto',
        render: () => <AnticoaguladoTool />,
      },
    ],
    [],
  );

  const tools = useMemo(() => allTools.filter((t) => t.track === userTrack), [allTools, userTrack]);
  const activeTool = tools.find((t) => t.id === active) ?? null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-6 py-14 sm:px-10 sm:py-20 lg:px-20">
      <section>
        <div className="eyebrow">calculadoras clínicas</div>
        <h1 className="mt-4 font-display font-light leading-[1.05] text-ink">
          <span className="text-[clamp(2rem,5vw,3rem)]">Ferramentas,</span>{' '}
          <span className="text-[clamp(2rem,5vw,3rem)] italic text-rose">doutora</span>
          <span className="text-[clamp(2rem,5vw,3rem)]">.</span>
        </h1>
        <p className="mt-4 max-w-xl font-body text-base italic leading-relaxed text-mute sm:text-lg">
          as fórmulas que você vai usar todo dia no plantão, organizadas para consulta rápida.
        </p>
      </section>

      <section>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={`group flex items-start gap-3 rounded-2xl border bg-paper p-4 text-left shadow-soft transition active:scale-[0.99] hover:shadow-card sm:p-5 ${
                active === t.id ? 'border-wine ring-2 ring-rose-soft' : 'border-line'
              }`}
            >
              <span
                aria-hidden
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-soft text-wine-deep"
              >
                <t.Icon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <div className="min-w-0">
                <h3 className="font-serif text-lg italic text-wine-deep">{t.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">{t.short}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {activeTool && (
        <section className="rounded-3xl border border-line bg-paper-soft p-5 shadow-soft sm:p-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-soft text-wine-deep"
              >
                <activeTool.Icon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-gold">calculadora</div>
                <h2 className="font-serif text-2xl italic text-wine-deep sm:text-3xl">{activeTool.name}</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="text-[11px] uppercase tracking-wider text-muted transition hover:text-wine"
            >
              fechar
            </button>
          </div>
          {activeTool.render()}
        </section>
      )}
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  unit,
  step,
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  step?: string;
  min?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted">
        {label}
        {unit && <span className="ml-1 normal-case text-ink-soft">({unit})</span>}
      </span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        step={step ?? 'any'}
        min={min}
        className="input-elegant"
      />
    </label>
  );
}

function ResultBox({ label, value, hint, tone = 'neutral' }: { label: string; value: string; hint?: string; tone?: 'good' | 'warn' | 'bad' | 'neutral' }) {
  const toneClass =
    tone === 'good'
      ? 'border-green text-green'
      : tone === 'warn'
        ? 'border-gold text-gold'
        : tone === 'bad'
          ? 'border-red text-red'
          : 'border-line text-wine-deep';
  return (
    <div className={`mt-5 rounded-2xl border bg-paper px-5 py-4 ${toneClass}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 font-serif text-3xl font-semibold leading-none sm:text-4xl">{value}</div>
      {hint && <div className="mt-2 text-sm italic text-ink-soft">{hint}</div>}
    </div>
  );
}

function ToggleGroup<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: Array<{ label: string; value: T }> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wider transition ${
            value === o.value
              ? 'border-wine bg-wine text-white'
              : 'border-line bg-paper text-ink-soft hover:bg-paper-soft'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function CheckCard({ label, value, onChange, points }: { label: string; value: boolean; onChange: (v: boolean) => void; points: number }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
        value ? 'border-wine bg-rose-soft/60' : 'border-line bg-paper hover:bg-paper-soft'
      }`}
    >
      <span className="text-sm leading-snug text-ink">{label}</span>
      <span className={`shrink-0 rounded-full px-2.5 py-0.5 font-serif text-xs italic ${value ? 'bg-wine text-white' : 'bg-paper-soft text-muted'}`}>
        {value ? `+${points}` : `${points} pts`}
      </span>
    </button>
  );
}

function CkdEpiTool() {
  const [creat, setCreat] = useState('1.0');
  const [age, setAge] = useState('30');
  const [sex, setSex] = useState<Sex>('F');

  const result = useMemo(() => {
    const cr = parseFloat(creat);
    const a = parseInt(age, 10);
    if (!cr || !a || cr <= 0 || a <= 0) return null;
    const isFemale = sex === 'F';
    const k = isFemale ? 0.7 : 0.9;
    const alpha = isFemale ? -0.241 : -0.302;
    const ratio = cr / k;
    const minTerm = Math.min(ratio, 1) ** alpha;
    const maxTerm = Math.max(ratio, 1) ** -1.2;
    const female = isFemale ? 1.012 : 1;
    const egfr = 142 * minTerm * maxTerm * 0.9938 ** a * female;
    return Math.round(egfr);
  }, [creat, age, sex]);

  const stage = useMemo(() => {
    if (result === null) return '';
    if (result >= 90) return 'G1 · função normal ou alta';
    if (result >= 60) return 'G2 · função levemente reduzida';
    if (result >= 45) return 'G3a · redução leve a moderada';
    if (result >= 30) return 'G3b · redução moderada a grave';
    if (result >= 15) return 'G4 · redução grave';
    return 'G5 · falência renal';
  }, [result]);

  const tone: 'good' | 'warn' | 'bad' | 'neutral' = result === null ? 'neutral' : result >= 60 ? 'good' : result >= 30 ? 'warn' : 'bad';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <NumberInput label="creatinina sérica" unit="mg/dL" value={creat} onChange={setCreat} step="0.1" min="0" />
        <NumberInput label="idade" unit="anos" value={age} onChange={setAge} step="1" min="0" />
      </div>
      <div>
        <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted">sexo</span>
        <ToggleGroup<Sex>
          value={sex}
          onChange={setSex}
          options={[
            { label: 'feminino', value: 'F' },
            { label: 'masculino', value: 'M' },
          ]}
        />
      </div>
      {result !== null && (
        <ResultBox
          label="eGFR"
          value={`${result} mL/min/1,73m²`}
          hint={stage}
          tone={tone}
        />
      )}
    </div>
  );
}

function WellsDvtTool() {
  const initial = {
    cancer: false,
    paralysis: false,
    bedridden: false,
    tenderness: false,
    swelling: false,
    calf: false,
    pittingEdema: false,
    veins: false,
    history: false,
    alt: false,
  };
  const [s, setS] = useState(initial);
  const total =
    (s.cancer ? 1 : 0) +
    (s.paralysis ? 1 : 0) +
    (s.bedridden ? 1 : 0) +
    (s.tenderness ? 1 : 0) +
    (s.swelling ? 1 : 0) +
    (s.calf ? 1 : 0) +
    (s.pittingEdema ? 1 : 0) +
    (s.veins ? 1 : 0) +
    (s.history ? 1 : 0) +
    (s.alt ? -2 : 0);

  const stratum = total >= 3 ? 'alta' : total >= 1 ? 'moderada' : 'baixa';
  const tone: 'good' | 'warn' | 'bad' = total >= 3 ? 'bad' : total >= 1 ? 'warn' : 'good';

  return (
    <div className="space-y-3">
      <CheckCard label="câncer ativo (tratamento últimos 6 meses ou paliativo)" value={s.cancer} onChange={(v) => setS({ ...s, cancer: v })} points={1} />
      <CheckCard label="paralisia, paresia ou imobilização do MMII" value={s.paralysis} onChange={(v) => setS({ ...s, paralysis: v })} points={1} />
      <CheckCard label="acamado ≥ 3 dias ou cirurgia maior recente" value={s.bedridden} onChange={(v) => setS({ ...s, bedridden: v })} points={1} />
      <CheckCard label="dor à palpação no trajeto venoso profundo" value={s.tenderness} onChange={(v) => setS({ ...s, tenderness: v })} points={1} />
      <CheckCard label="edema de todo o membro" value={s.swelling} onChange={(v) => setS({ ...s, swelling: v })} points={1} />
      <CheckCard label="edema da panturrilha > 3 cm comparado ao outro lado" value={s.calf} onChange={(v) => setS({ ...s, calf: v })} points={1} />
      <CheckCard label="edema cacifo positivo no membro sintomático" value={s.pittingEdema} onChange={(v) => setS({ ...s, pittingEdema: v })} points={1} />
      <CheckCard label="veias colaterais superficiais (sem varizes)" value={s.veins} onChange={(v) => setS({ ...s, veins: v })} points={1} />
      <CheckCard label="TVP prévia documentada" value={s.history} onChange={(v) => setS({ ...s, history: v })} points={1} />
      <CheckCard label="diagnóstico alternativo igualmente provável" value={s.alt} onChange={(v) => setS({ ...s, alt: v })} points={-2} />
      <ResultBox
        label="escore de Wells (TVP)"
        value={`${total} pontos`}
        hint={`probabilidade ${stratum}`}
        tone={tone}
      />
    </div>
  );
}

function WellsPeTool() {
  const initial = {
    dvtSigns: false,
    altLess: false,
    hr: false,
    immob: false,
    history: false,
    hemoptysis: false,
    cancer: false,
  };
  const [s, setS] = useState(initial);
  const total =
    (s.dvtSigns ? 3 : 0) +
    (s.altLess ? 3 : 0) +
    (s.hr ? 1.5 : 0) +
    (s.immob ? 1.5 : 0) +
    (s.history ? 1.5 : 0) +
    (s.hemoptysis ? 1 : 0) +
    (s.cancer ? 1 : 0);

  const stratum = total > 6 ? 'alta' : total >= 2 ? 'moderada' : 'baixa';
  const tone: 'good' | 'warn' | 'bad' = total > 6 ? 'bad' : total >= 2 ? 'warn' : 'good';

  return (
    <div className="space-y-3">
      <CheckCard label="sinais clínicos de TVP" value={s.dvtSigns} onChange={(v) => setS({ ...s, dvtSigns: v })} points={3} />
      <CheckCard label="TEP é o diagnóstico mais provável" value={s.altLess} onChange={(v) => setS({ ...s, altLess: v })} points={3} />
      <CheckCard label="FC > 100 bpm" value={s.hr} onChange={(v) => setS({ ...s, hr: v })} points={1.5} />
      <CheckCard label="imobilização ≥ 3 dias ou cirurgia nas últimas 4 semanas" value={s.immob} onChange={(v) => setS({ ...s, immob: v })} points={1.5} />
      <CheckCard label="TVP ou TEP prévios" value={s.history} onChange={(v) => setS({ ...s, history: v })} points={1.5} />
      <CheckCard label="hemoptise" value={s.hemoptysis} onChange={(v) => setS({ ...s, hemoptysis: v })} points={1} />
      <CheckCard label="câncer ativo" value={s.cancer} onChange={(v) => setS({ ...s, cancer: v })} points={1} />
      <ResultBox
        label="escore de Wells (TEP)"
        value={`${total} pontos`}
        hint={`probabilidade ${stratum}`}
        tone={tone}
      />
    </div>
  );
}

function Cha2ds2VascTool() {
  const [s, setS] = useState({
    icc: false,
    has: false,
    age75: false,
    dm: false,
    avc: false,
    vasc: false,
    age65: false,
    female: false,
  });
  const total =
    (s.icc ? 1 : 0) +
    (s.has ? 1 : 0) +
    (s.age75 ? 2 : 0) +
    (s.dm ? 1 : 0) +
    (s.avc ? 2 : 0) +
    (s.vasc ? 1 : 0) +
    (s.age65 ? 1 : 0) +
    (s.female ? 1 : 0);

  const hint =
    total === 0
      ? 'risco muito baixo — anticoagulação não indicada'
      : total === 1
        ? 'risco baixo — considerar (especialmente se for por sexo feminino apenas)'
        : 'risco moderado a alto — anticoagulação oral recomendada';
  const tone: 'good' | 'warn' | 'bad' = total === 0 ? 'good' : total === 1 ? 'warn' : 'bad';

  return (
    <div className="space-y-3">
      <CheckCard label="insuficiência cardíaca / FE reduzida" value={s.icc} onChange={(v) => setS({ ...s, icc: v })} points={1} />
      <CheckCard label="hipertensão arterial" value={s.has} onChange={(v) => setS({ ...s, has: v })} points={1} />
      <CheckCard label="idade ≥ 75 anos" value={s.age75} onChange={(v) => setS({ ...s, age75: v })} points={2} />
      <CheckCard label="diabetes" value={s.dm} onChange={(v) => setS({ ...s, dm: v })} points={1} />
      <CheckCard label="AVC ou AIT prévio (ou tromboembolismo)" value={s.avc} onChange={(v) => setS({ ...s, avc: v })} points={2} />
      <CheckCard label="doença vascular (IAM, DAP, placa aórtica)" value={s.vasc} onChange={(v) => setS({ ...s, vasc: v })} points={1} />
      <CheckCard label="idade 65-74 anos" value={s.age65} onChange={(v) => setS({ ...s, age65: v })} points={1} />
      <CheckCard label="sexo feminino" value={s.female} onChange={(v) => setS({ ...s, female: v })} points={1} />
      <ResultBox label="CHA₂DS₂-VASc" value={`${total} pontos`} hint={hint} tone={tone} />
    </div>
  );
}

function MeldTool() {
  const [bili, setBili] = useState('1.0');
  const [creat, setCreat] = useState('1.0');
  const [inr, setInr] = useState('1.0');

  const result = useMemo(() => {
    const b = Math.max(parseFloat(bili) || 1, 1);
    let c = Math.max(parseFloat(creat) || 1, 1);
    if (c > 4) c = 4;
    const i = Math.max(parseFloat(inr) || 1, 1);
    const meld = 3.78 * Math.log(b) + 11.2 * Math.log(i) + 9.57 * Math.log(c) + 6.43;
    return Math.round(meld);
  }, [bili, creat, inr]);

  const tone: 'good' | 'warn' | 'bad' = result < 10 ? 'good' : result < 20 ? 'warn' : 'bad';
  const hint = result < 10 ? 'mortalidade ~3 meses baixa' : result < 20 ? 'mortalidade ~3 meses moderada' : 'mortalidade ~3 meses alta';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <NumberInput label="bilirrubina" unit="mg/dL" value={bili} onChange={setBili} step="0.1" min="0" />
        <NumberInput label="creatinina" unit="mg/dL" value={creat} onChange={setCreat} step="0.1" min="0" />
        <NumberInput label="INR" value={inr} onChange={setInr} step="0.1" min="0" />
      </div>
      <ResultBox label="MELD" value={String(result)} hint={hint} tone={tone} />
      <p className="text-xs italic text-muted">
        Valores menores que 1 são arredondados para 1. Creatinina é limitada em 4. Esse cálculo é o MELD original, sem sódio.
      </p>
    </div>
  );
}

function GlasgowTool() {
  const [eye, setEye] = useState(4);
  const [verbal, setVerbal] = useState(5);
  const [motor, setMotor] = useState(6);
  const total = eye + verbal + motor;
  const tone: 'good' | 'warn' | 'bad' = total >= 13 ? 'good' : total >= 9 ? 'warn' : 'bad';
  const hint =
    total >= 13 ? 'leve' : total >= 9 ? 'moderado · considerar intubação' : 'grave · IOT geralmente indicada';

  return (
    <div className="space-y-4">
      <div>
        <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted">abertura ocular</span>
        <ToggleGroup<string>
          value={String(eye)}
          onChange={(v) => setEye(parseInt(v, 10))}
          options={[
            { label: '4 espontânea', value: '4' },
            { label: '3 à voz', value: '3' },
            { label: '2 à dor', value: '2' },
            { label: '1 ausente', value: '1' },
          ]}
        />
      </div>
      <div>
        <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted">resposta verbal</span>
        <ToggleGroup<string>
          value={String(verbal)}
          onChange={(v) => setVerbal(parseInt(v, 10))}
          options={[
            { label: '5 orientado', value: '5' },
            { label: '4 confuso', value: '4' },
            { label: '3 palavras inapropriadas', value: '3' },
            { label: '2 sons', value: '2' },
            { label: '1 ausente', value: '1' },
          ]}
        />
      </div>
      <div>
        <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted">resposta motora</span>
        <ToggleGroup<string>
          value={String(motor)}
          onChange={(v) => setMotor(parseInt(v, 10))}
          options={[
            { label: '6 obedece', value: '6' },
            { label: '5 localiza dor', value: '5' },
            { label: '4 retira à dor', value: '4' },
            { label: '3 decorticação', value: '3' },
            { label: '2 descerebração', value: '2' },
            { label: '1 ausente', value: '1' },
          ]}
        />
      </div>
      <ResultBox label="Glasgow" value={`${total} / 15`} hint={hint} tone={tone} />
    </div>
  );
}

function ApgarTool() {
  const [fc, setFc] = useState(2);
  const [resp, setResp] = useState(2);
  const [tone, setTone] = useState(2);
  const [irrit, setIrrit] = useState(2);
  const [color, setColor] = useState(2);
  const total = fc + resp + tone + irrit + color;
  const resultTone: 'good' | 'warn' | 'bad' = total >= 7 ? 'good' : total >= 4 ? 'warn' : 'bad';
  const hint = total >= 7 ? 'condições adequadas' : total >= 4 ? 'reanimação leve a moderada' : 'reanimação avançada';

  return (
    <div className="space-y-3">
      {[
        { label: 'frequência cardíaca', value: fc, setter: setFc, opts: [{ l: '0 ausente', v: 0 }, { l: '1 < 100', v: 1 }, { l: '2 ≥ 100', v: 2 }] },
        { label: 'esforço respiratório', value: resp, setter: setResp, opts: [{ l: '0 ausente', v: 0 }, { l: '1 fraco', v: 1 }, { l: '2 choro forte', v: 2 }] },
        { label: 'tônus muscular', value: tone, setter: setTone, opts: [{ l: '0 flácido', v: 0 }, { l: '1 algum', v: 1 }, { l: '2 ativo', v: 2 }] },
        { label: 'irritabilidade reflexa', value: irrit, setter: setIrrit, opts: [{ l: '0 ausente', v: 0 }, { l: '1 careta', v: 1 }, { l: '2 choro', v: 2 }] },
        { label: 'cor', value: color, setter: setColor, opts: [{ l: '0 cianose total', v: 0 }, { l: '1 acrocianose', v: 1 }, { l: '2 rosado', v: 2 }] },
      ].map((row) => (
        <div key={row.label}>
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted">{row.label}</span>
          <ToggleGroup<string>
            value={String(row.value)}
            onChange={(v) => row.setter(parseInt(v, 10))}
            options={row.opts.map((o) => ({ label: o.l, value: String(o.v) }))}
          />
        </div>
      ))}
      <ResultBox label="APGAR" value={`${total} / 10`} hint={hint} tone={resultTone} />
    </div>
  );
}

function BmiTool() {
  const [weight, setWeight] = useState('60');
  const [height, setHeight] = useState('165');
  const bmi = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (!w || !h || h <= 0) return null;
    return w / (h * h);
  }, [weight, height]);

  const stage = bmi === null
    ? ''
    : bmi < 18.5
      ? 'baixo peso'
      : bmi < 25
        ? 'eutrofia'
        : bmi < 30
          ? 'sobrepeso'
          : bmi < 35
            ? 'obesidade grau I'
            : bmi < 40
              ? 'obesidade grau II'
              : 'obesidade grau III';
  const tone: 'good' | 'warn' | 'bad' | 'neutral' = bmi === null
    ? 'neutral'
    : bmi >= 18.5 && bmi < 25
      ? 'good'
      : bmi >= 25 && bmi < 30
        ? 'warn'
        : 'bad';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <NumberInput label="peso" unit="kg" value={weight} onChange={setWeight} step="0.5" min="0" />
        <NumberInput label="altura" unit="cm" value={height} onChange={setHeight} step="1" min="0" />
      </div>
      {bmi !== null && (
        <ResultBox label="IMC" value={bmi.toFixed(1)} hint={stage} tone={tone} />
      )}
    </div>
  );
}


// ============================================================
// ODONTO — Dose máxima de anestésico local + cálculo de tubetes
// ============================================================

interface AnestesicoSpec {
  id: string;
  label: string;
  concentration: number; // % w/v
  mgPerKg: number; // dose máx por kg
  ceiling: number; // teto absoluto adulto
  tubeteMl: number; // ml por tubete (1,8 padrão)
  notes: string;
}

const ANESTESICOS: AnestesicoSpec[] = [
  {
    id: 'lido2',
    label: 'Lidocaína 2% (c/ epinefrina)',
    concentration: 2,
    mgPerKg: 4.4,
    ceiling: 300,
    tubeteMl: 1.8,
    notes: 'Tubete 1,8 mL = 36 mg. Padrão pra bloqueio do alveolar inferior.',
  },
  {
    id: 'arti4',
    label: 'Articaína 4% (c/ epinefrina)',
    concentration: 4,
    mgPerKg: 7,
    ceiling: 500,
    tubeteMl: 1.8,
    notes: 'Tubete 1,8 mL = 72 mg. Excelente difusão óssea — preferir em infiltrativa. Evitar em bloqueio mandibular (parestesia).',
  },
  {
    id: 'mepi2',
    label: 'Mepivacaína 2% (c/ epinefrina)',
    concentration: 2,
    mgPerKg: 4.4,
    ceiling: 300,
    tubeteMl: 1.8,
    notes: 'Tubete 1,8 mL = 36 mg. Início rápido.',
  },
  {
    id: 'mepi3',
    label: 'Mepivacaína 3% (SEM vasoconstritor)',
    concentration: 3,
    mgPerKg: 4.4,
    ceiling: 300,
    tubeteMl: 1.8,
    notes: 'Tubete 1,8 mL = 54 mg. Para HAS descompensada, cardiopata isquêmico recente. Duração curta (~20 min em mole).',
  },
  {
    id: 'prilo3',
    label: 'Prilocaína 3% (c/ felipressina)',
    concentration: 3,
    mgPerKg: 6,
    ceiling: 400,
    tubeteMl: 1.8,
    notes: 'Tubete 1,8 mL = 54 mg. Felipressina segura na gestante. Risco de meta-hemoglobinemia em dose alta ou G6PD.',
  },
  {
    id: 'bupi05',
    label: 'Bupivacaína 0,5% (c/ epinefrina)',
    concentration: 0.5,
    mgPerKg: 1.3,
    ceiling: 90,
    tubeteMl: 1.8,
    notes: 'Tubete 1,8 mL = 9 mg. Longa duração (6-8h pulpar). Cardiotoxicidade em sobredose — respeitar o limite.',
  },
];

function AnestesicoTool() {
  const [drugId, setDrugId] = useState<string>('lido2');
  const [weight, setWeight] = useState('70');
  const [asa, setAsa] = useState<'saudavel' | 'comorbido'>('saudavel');

  const drug = ANESTESICOS.find((d) => d.id === drugId)!;
  const w = parseFloat(weight);
  const valid = !isNaN(w) && w > 0;

  // Cálculos
  const doseMaxByKg = valid ? w * drug.mgPerKg : 0;
  const doseMax = Math.min(doseMaxByKg, drug.ceiling);
  // Em paciente com comorbidade, reduzir margem em 30%
  const safeDose = asa === 'saudavel' ? doseMax : doseMax * 0.7;
  const mgPerTubete = drug.concentration * 10 * drug.tubeteMl;
  const tubetes = safeDose / mgPerTubete;
  const tubetesInteiros = Math.floor(tubetes);

  return (
    <div className="space-y-5">
      <div>
        <span className="mb-2 block text-[11px] uppercase tracking-wider text-muted">
          anestésico
        </span>
        <select
          value={drugId}
          onChange={(e) => setDrugId(e.target.value)}
          className="input-elegant"
        >
          {ANESTESICOS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
        <p className="mt-2 font-body text-xs italic text-mute">{drug.notes}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <NumberInput
          label="peso do paciente"
          unit="kg"
          value={weight}
          onChange={setWeight}
          step="1"
          min="1"
        />
        <div>
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted">
            estado do paciente
          </span>
          <ToggleGroup<'saudavel' | 'comorbido'>
            value={asa}
            onChange={setAsa}
            options={[
              { label: 'saudável', value: 'saudavel' },
              { label: 'cardiopata / idoso frágil', value: 'comorbido' },
            ]}
          />
        </div>
      </div>

      {valid && (
        <>
          <ResultBox
            label="dose máxima segura"
            value={`${Math.round(safeDose)} mg`}
            hint={
              asa === 'comorbido'
                ? `dose máx teórica ${Math.round(doseMax)} mg, reduzida ~30% pela comorbidade`
                : `dose máx teórica = peso × ${drug.mgPerKg} mg/kg (teto ${drug.ceiling} mg)`
            }
            tone={asa === 'comorbido' ? 'warn' : 'good'}
          />

          <div className="rounded-2xl border border-line bg-paper-soft px-5 py-4">
            <div className="text-[10px] uppercase tracking-wider text-muted">tubetes seguros</div>
            <div className="mt-1 font-display text-3xl italic text-wine-deep sm:text-4xl">
              {tubetesInteiros}{' '}
              <span className="text-xl text-muted">
                {tubetesInteiros === 1 ? 'tubete' : 'tubetes'}
              </span>
            </div>
            <div className="mt-1 text-sm italic text-ink-soft">
              cada tubete de 1,8 mL contém {mgPerTubete.toFixed(0)} mg. limite total ≈{' '}
              {tubetes.toFixed(1)} tubetes.
            </div>

            {/* Visual: ícones de tubete cheios */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {Array.from({ length: Math.max(tubetesInteiros, 0) }).map((_, i) => (
                <span
                  key={i}
                  className="inline-block h-6 w-3 rounded-sm bg-wine"
                  title={`tubete ${i + 1}`}
                />
              ))}
              {tubetes - tubetesInteiros >= 0.5 && (
                <span
                  className="inline-block h-6 w-3 overflow-hidden rounded-sm bg-rose-soft"
                  title="parcial"
                >
                  <span className="block h-1/2 w-full bg-wine" />
                </span>
              )}
            </div>
          </div>

          <p className="font-body text-xs italic text-mute">
            Cálculo de referência. Sempre considere também o limite de vasoconstritor (epinefrina ≤
            0,2 mg em saudável, ≤ 0,04 mg em cardiopata controlado) e o estado clínico real do
            paciente.
          </p>
        </>
      )}
    </div>
  );
}

// ============================================================
// ODONTO — Conversor de vasoconstritor (epinefrina)
// ============================================================

function VasoconstritorTool() {
  const [concentration, setConcentration] = useState<'100k' | '200k'>('100k');
  const [tubetes, setTubetes] = useState('1');
  const [asa, setAsa] = useState<'saudavel' | 'estavel' | 'descomp'>('saudavel');

  const ugPerMl = concentration === '100k' ? 10 : 5;
  const ugPerTubete = ugPerMl * 1.8;
  const n = parseFloat(tubetes);
  const totalUg = !isNaN(n) && n >= 0 ? n * ugPerTubete : 0;

  const limitUg = asa === 'saudavel' ? 200 : asa === 'estavel' ? 40 : 0;
  const maxTubetes = limitUg > 0 ? limitUg / ugPerTubete : 0;
  const exceeded = limitUg > 0 && totalUg > limitUg;
  const tone: 'good' | 'warn' | 'bad' =
    asa === 'descomp' ? 'bad' : exceeded ? 'bad' : asa === 'estavel' ? 'warn' : 'good';
  const hint =
    asa === 'descomp'
      ? 'Cardiopata descompensado: adiar procedimento. Vasoconstritor formalmente CI.'
      : exceeded
        ? `Excedeu o limite (${limitUg} µg). Máx ~${maxTubetes.toFixed(1)} tubetes nesse cenário.`
        : `Limite seguro: ${limitUg} µg (≈ ${maxTubetes.toFixed(1)} tubetes).`;

  return (
    <div className="space-y-4">
      <div>
        <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted">
          concentração da epinefrina
        </span>
        <ToggleGroup<'100k' | '200k'>
          value={concentration}
          onChange={setConcentration}
          options={[
            { label: '1:100.000 (lido/articaína padrão)', value: '100k' },
            { label: '1:200.000 (mepivacaína 2%, opção CV)', value: '200k' },
          ]}
        />
      </div>

      <NumberInput
        label="número de tubetes usados"
        value={tubetes}
        onChange={setTubetes}
        step="0.5"
        min="0"
      />

      <div>
        <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted">
          estado cardiovascular do paciente
        </span>
        <ToggleGroup<'saudavel' | 'estavel' | 'descomp'>
          value={asa}
          onChange={setAsa}
          options={[
            { label: 'saudável (ASA I-II)', value: 'saudavel' },
            { label: 'cardiopata estável (ASA III)', value: 'estavel' },
            { label: 'descompensado', value: 'descomp' },
          ]}
        />
      </div>

      <ResultBox
        label="total de epinefrina"
        value={`${totalUg.toFixed(0)} µg`}
        hint={hint}
        tone={tone}
      />

      <p className="font-body text-xs italic text-mute">
        Referência ADA: 200 µg em saudável, 40 µg em cardiopata estável. Em angina instável,
        IAM/AVC ≤6m, arritmia ativa ou hipertireoidismo descompensado: adiar ou usar mepivacaína 3%
        sem vasoconstritor.
      </p>
    </div>
  );
}

// ============================================================
// ODONTO — Profilaxia de endocardite (AHA 2021)
// ============================================================

function ProfilaxiaEndocarditeTool() {
  const [indicacao, setIndicacao] = useState({
    valva: false,
    eiPrevia: false,
    congenitaCianoticaNaoCorrigida: false,
    transplantadoComValvulopatia: false,
  });
  const [procedimentoSangra, setProcedimentoSangra] = useState(true);
  const [alergia, setAlergia] = useState<'nenhuma' | 'tardia' | 'imediata'>('nenhuma');
  const [pediatrico, setPediatrico] = useState(false);
  const [peso, setPeso] = useState('25');

  const temIndicacao =
    indicacao.valva ||
    indicacao.eiPrevia ||
    indicacao.congenitaCianoticaNaoCorrigida ||
    indicacao.transplantadoComValvulopatia;

  const indicada = temIndicacao && procedimentoSangra;

  function regimen(): { drug: string; dose: string; note: string } {
    if (alergia === 'imediata') {
      // CI a beta-lactâmicos: clinda 600 mg (criança 20 mg/kg) ou azitro 500 mg
      const dose = pediatrico
        ? `${Math.round(parseFloat(peso) * 20)} mg VO (20 mg/kg, máx 600 mg)`
        : '600 mg VO dose única';
      return {
        drug: 'Clindamicina',
        dose,
        note: 'Alternativa: azitromicina 500 mg VO (15 mg/kg em criança).',
      };
    }
    if (alergia === 'tardia') {
      const dose = pediatrico
        ? `${Math.round(parseFloat(peso) * 50)} mg VO (50 mg/kg, máx 2 g)`
        : '2 g VO dose única';
      return {
        drug: 'Cefalexina',
        dose,
        note: 'Reação cruzada com penicilina ~1% (evitar se alergia imediata).',
      };
    }
    const dose = pediatrico
      ? `${Math.round(parseFloat(peso) * 50)} mg VO (50 mg/kg, máx 2 g)`
      : '2 g VO dose única';
    return {
      drug: 'Amoxicilina',
      dose,
      note: 'Tomar 30-60 min antes do procedimento. Dose única, sem repetição.',
    };
  }

  const reg = regimen();

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted">
          condição cardíaca de alto risco (AHA 2021)
        </span>
        <CheckCard
          label="prótese valvar (mecânica ou biológica) ou reparo com material protético"
          value={indicacao.valva}
          onChange={(v) => setIndicacao({ ...indicacao, valva: v })}
          points={1}
        />
        <CheckCard
          label="endocardite infecciosa prévia"
          value={indicacao.eiPrevia}
          onChange={(v) => setIndicacao({ ...indicacao, eiPrevia: v })}
          points={1}
        />
        <CheckCard
          label="cardiopatia congênita cianótica não corrigida (ou corrigida há <6m)"
          value={indicacao.congenitaCianoticaNaoCorrigida}
          onChange={(v) =>
            setIndicacao({ ...indicacao, congenitaCianoticaNaoCorrigida: v })
          }
          points={1}
        />
        <CheckCard
          label="transplantado cardíaco com valvulopatia adquirida"
          value={indicacao.transplantadoComValvulopatia}
          onChange={(v) =>
            setIndicacao({ ...indicacao, transplantadoComValvulopatia: v })
          }
          points={1}
        />
      </div>

      <CheckCard
        label="procedimento envolve manipulação de gengiva, periápice ou perfuração de mucosa oral (sangramento esperado)"
        value={procedimentoSangra}
        onChange={setProcedimentoSangra}
        points={1}
      />

      <div>
        <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted">
          alergia à penicilina
        </span>
        <ToggleGroup<'nenhuma' | 'tardia' | 'imediata'>
          value={alergia}
          onChange={setAlergia}
          options={[
            { label: 'nenhuma', value: 'nenhuma' },
            { label: 'tardia (rash leve, há anos)', value: 'tardia' },
            { label: 'imediata (urticária, anafilaxia)', value: 'imediata' },
          ]}
        />
      </div>

      <div>
        <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted">
          paciente
        </span>
        <ToggleGroup<'adulto' | 'pediatrico'>
          value={pediatrico ? 'pediatrico' : 'adulto'}
          onChange={(v) => setPediatrico(v === 'pediatrico')}
          options={[
            { label: 'adulto', value: 'adulto' },
            { label: 'pediátrico (até 40 kg)', value: 'pediatrico' },
          ]}
        />
      </div>

      {pediatrico && (
        <NumberInput label="peso da criança" unit="kg" value={peso} onChange={setPeso} step="1" min="1" />
      )}

      {indicada ? (
        <ResultBox
          label={`indicada — ${reg.drug}`}
          value={reg.dose}
          hint={reg.note}
          tone="warn"
        />
      ) : temIndicacao ? (
        <ResultBox
          label="NÃO indicada"
          value="procedimento sem sangramento"
          hint="Indicação cardíaca presente, mas profilaxia só é necessária se há manipulação gengival/periápice/mucosa."
          tone="good"
        />
      ) : (
        <ResultBox
          label="NÃO indicada"
          value="sem condição cardíaca de risco"
          hint="A maioria dos pacientes (HAS isolada, sopro funcional, marcapasso, mitral prolapso simples, etc.) NÃO precisa de profilaxia."
          tone="good"
        />
      )}
    </div>
  );
}

// ============================================================
// ODONTO — Dose pediátrica de analgésicos / antibióticos
// ============================================================

interface PedDrugSpec {
  id: string;
  label: string;
  mgPerKg: number;
  intervalHoras: number;
  suspensaoConc: string;
  suspensaoMgPer5ml: number;
  ceiling?: number; // mg por dose
  notes?: string;
}

const PED_DRUGS: PedDrugSpec[] = [
  {
    id: 'amox',
    label: 'Amoxicilina (infecção leve)',
    mgPerKg: 50, // 50 mg/kg/dia ÷ 8/8h
    intervalHoras: 8,
    suspensaoConc: '250 mg / 5 mL',
    suspensaoMgPer5ml: 250,
    notes: 'Dose total diária 40-50 mg/kg/dia ÷ 8/8h. Em moderada-grave: 80-90 mg/kg/dia.',
  },
  {
    id: 'paracet',
    label: 'Paracetamol',
    mgPerKg: 15, // 15 mg/kg por dose, 6/6h
    intervalHoras: 6,
    suspensaoConc: '200 mg/mL (gotas)',
    suspensaoMgPer5ml: 1000, // 200 mg/mL × 5 mL pra cálculo mas usaremos gotas
    notes: '15 mg/kg por dose, 6/6h. Apresentação gotas: 200 mg/mL → 1 gota = ~10 mg.',
  },
  {
    id: 'ibu',
    label: 'Ibuprofeno',
    mgPerKg: 10, // 10 mg/kg por dose, 8/8h
    intervalHoras: 8,
    suspensaoConc: '50 mg/mL (gotas) ou 100 mg/5mL (xarope)',
    suspensaoMgPer5ml: 100,
    ceiling: 600,
    notes: '10 mg/kg por dose, 8/8h, máx 600 mg/dose. Após refeição, hidratado.',
  },
  {
    id: 'dipi',
    label: 'Dipirona',
    mgPerKg: 25, // 25 mg/kg por dose, 6/6h
    intervalHoras: 6,
    suspensaoConc: '500 mg/mL (gotas) ou 50 mg/mL (xarope)',
    suspensaoMgPer5ml: 250,
    notes: '25 mg/kg por dose, 6/6h. Gotas: 500 mg/mL → 1 gota = ~25 mg.',
  },
];

function PediatricoTool() {
  const [drugId, setDrugId] = useState('amox');
  const [peso, setPeso] = useState('20');

  const drug = PED_DRUGS.find((d) => d.id === drugId)!;
  const w = parseFloat(peso);
  const valid = !isNaN(w) && w > 0;

  // Para amox, mgPerKg é por DIA dividido em /8h → dose por toma = mgPerKg*peso/3
  // Para os outros, mgPerKg é por DOSE direta
  const isAmox = drug.id === 'amox';
  const dosePorTomaRaw = isAmox ? (w * drug.mgPerKg) / 3 : w * drug.mgPerKg;
  const dosePorToma = drug.ceiling ? Math.min(dosePorTomaRaw, drug.ceiling) : dosePorTomaRaw;
  const mlPorToma = (dosePorToma / drug.suspensaoMgPer5ml) * 5;

  return (
    <div className="space-y-4">
      <div>
        <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted">
          fármaco
        </span>
        <select
          value={drugId}
          onChange={(e) => setDrugId(e.target.value)}
          className="input-elegant"
        >
          {PED_DRUGS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <NumberInput label="peso da criança" unit="kg" value={peso} onChange={setPeso} step="1" min="1" />

      {valid && (
        <>
          <ResultBox
            label={`dose por toma (${drug.intervalHoras}/${drug.intervalHoras}h)`}
            value={`${Math.round(dosePorToma)} mg`}
            hint={`${mlPorToma.toFixed(1)} mL da suspensão ${drug.suspensaoConc}`}
          />
          {drug.notes && (
            <p className="font-body text-xs italic text-mute">{drug.notes}</p>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// ODONTO — Paciente anticoagulado (decisão de extração)
// ============================================================

function AnticoaguladoTool() {
  const [tipo, setTipo] = useState<'varfarina' | 'doac' | 'antiagregante' | 'heparina'>('varfarina');
  const [inr, setInr] = useState('2.5');
  const [procedimento, setProcedimento] = useState<'simples' | 'multi' | 'cirurgico'>('simples');

  function recommendation(): { headline: string; tone: 'good' | 'warn' | 'bad'; detail: string } {
    if (tipo === 'varfarina') {
      const inrVal = parseFloat(inr);
      const validInr = !isNaN(inrVal);
      if (!validInr) {
        return {
          headline: 'Aguardando INR',
          tone: 'warn',
          detail: 'Pedir INR de até 24-72h antes do procedimento.',
        };
      }
      if (inrVal > 4) {
        return {
          headline: 'NÃO operar agora',
          tone: 'bad',
          detail: `INR ${inrVal} está acima da faixa. Discutir com cardio/clínico que segue o paciente — ajustar dose, reavaliar em 2-3 dias.`,
        };
      }
      if (procedimento === 'simples' && inrVal <= 3.5) {
        return {
          headline: 'MANTER varfarina + medidas locais',
          tone: 'good',
          detail: `INR ${inrVal} dentro da faixa. Sutura, esponja de gelatina no alvéolo, bochecho de ácido tranexâmico 4,8-5% 4x/dia por 2 dias. NÃO suspender (risco trombótico > hemorrágico).`,
        };
      }
      if (procedimento === 'multi' || procedimento === 'cirurgico') {
        return {
          headline: 'Discutir com médico assistente',
          tone: 'warn',
          detail: `Procedimento ${procedimento === 'cirurgico' ? 'cirúrgico extenso' : 'múltiplas extrações'}: avaliar suspensão temporária ou bridging com HBPM. Não suspender por conta própria.`,
        };
      }
      return {
        headline: 'MANTER + medidas locais',
        tone: 'good',
        detail: `INR ${inrVal}. Operar com gelatina + tranexâmico bochecho.`,
      };
    }
    if (tipo === 'doac') {
      if (procedimento === 'simples') {
        return {
          headline: 'PULAR a dose da manhã',
          tone: 'warn',
          detail:
            'Apixabana/rivaroxabana/dabigatrana: pular a dose pré-procedimento da manhã, fazer extração, retomar 6h depois se hemostasia adequada. NÃO usar INR (DOAC não monitora por INR).',
        };
      }
      return {
        headline: 'Discutir com cardio',
        tone: 'bad',
        detail:
          'DOAC + cirurgia de alto risco: suspender 24-48h antes (depende do ClCr e do fármaco). Sempre alinhar com o cardiologista assistente.',
      };
    }
    if (tipo === 'antiagregante') {
      return {
        headline: 'MANTER AAS / clopidogrel',
        tone: 'good',
        detail:
          'Antiagregante isolado em extração simples: manter. Risco de evento isquêmico ao suspender supera o sangramento. Medidas locais resolvem.',
      };
    }
    return {
      headline: 'Cuidado individualizado',
      tone: 'warn',
      detail:
        'HBPM em uso terapêutico: alinhar com médico. Profilática (40 mg/dia SC): geralmente pode manter.',
    };
  }

  const rec = recommendation();

  return (
    <div className="space-y-4">
      <div>
        <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted">
          o que o paciente está usando
        </span>
        <ToggleGroup<'varfarina' | 'doac' | 'antiagregante' | 'heparina'>
          value={tipo}
          onChange={setTipo}
          options={[
            { label: 'varfarina (Marevan)', value: 'varfarina' },
            { label: 'DOAC (apixab/rivarox/dabig)', value: 'doac' },
            { label: 'AAS / clopidogrel', value: 'antiagregante' },
            { label: 'heparina (HBPM)', value: 'heparina' },
          ]}
        />
      </div>

      {tipo === 'varfarina' && (
        <NumberInput label="INR" value={inr} onChange={setInr} step="0.1" min="0" />
      )}

      <div>
        <span className="mb-1 block text-[11px] uppercase tracking-wider text-muted">
          procedimento previsto
        </span>
        <ToggleGroup<'simples' | 'multi' | 'cirurgico'>
          value={procedimento}
          onChange={setProcedimento}
          options={[
            { label: 'extração simples (1 elemento)', value: 'simples' },
            { label: 'múltiplas extrações', value: 'multi' },
            { label: 'cirurgia extensa (siso, implante)', value: 'cirurgico' },
          ]}
        />
      </div>

      <ResultBox label={rec.headline} value="" hint={rec.detail} tone={rec.tone} />

      <p className="font-body text-xs italic text-mute">
        Material de apoio sempre disponível: esponja de gelatina hemostática, sutura, ácido
        tranexâmico solução para bochecho 4,8-5%. Compressão local mantida por 30 min após.
      </p>
    </div>
  );
}
