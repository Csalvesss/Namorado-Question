import { useMemo, useState } from 'react';
import {
  Activity,
  Brain,
  Calculator,
  Droplets,
  Heart,
  HeartPulse,
  Stethoscope,
  Wind,
  type LucideIcon,
} from 'lucide-react';

type Sex = 'M' | 'F';

interface ToolDef {
  id: string;
  name: string;
  short: string;
  Icon: LucideIcon;
  render: () => JSX.Element;
}

export default function Tools() {
  const [active, setActive] = useState<string | null>(null);
  const tools = useMemo<ToolDef[]>(
    () => [
      {
        id: 'ckd',
        name: 'CKD-EPI',
        short: 'taxa de filtração glomerular estimada (eGFR) pela equação CKD-EPI 2021.',
        Icon: Droplets,
        render: () => <CkdEpiTool />,
      },
      {
        id: 'wells-dvt',
        name: 'Wells (TVP)',
        short: 'probabilidade clínica de trombose venosa profunda.',
        Icon: Activity,
        render: () => <WellsDvtTool />,
      },
      {
        id: 'wells-pe',
        name: 'Wells (TEP)',
        short: 'probabilidade clínica de tromboembolismo pulmonar.',
        Icon: Wind,
        render: () => <WellsPeTool />,
      },
      {
        id: 'cha2ds2',
        name: 'CHA₂DS₂-VASc',
        short: 'risco de AVC em fibrilação atrial não valvar.',
        Icon: HeartPulse,
        render: () => <Cha2ds2VascTool />,
      },
      {
        id: 'meld',
        name: 'MELD',
        short: 'gravidade de doença hepática crônica e priorização para transplante.',
        Icon: Stethoscope,
        render: () => <MeldTool />,
      },
      {
        id: 'glasgow',
        name: 'Glasgow',
        short: 'escala de coma de Glasgow (abertura ocular + verbal + motor).',
        Icon: Brain,
        render: () => <GlasgowTool />,
      },
      {
        id: 'apgar',
        name: 'APGAR',
        short: 'avaliação do recém-nascido no 1º e 5º minuto.',
        Icon: Heart,
        render: () => <ApgarTool />,
      },
      {
        id: 'bmi',
        name: 'IMC',
        short: 'índice de massa corporal com classificação.',
        Icon: Calculator,
        render: () => <BmiTool />,
      },
    ],
    [],
  );

  const activeTool = tools.find((t) => t.id === active) ?? null;

  return (
    <div className="space-y-10">
      <section>
        <div className="eyebrow-gold">calculadoras clínicas</div>
        <h1 className="mt-3 font-serif italic leading-[1.05] text-wine-deep">
          <span className="text-[clamp(1.75rem,4vw,2.75rem)]">ferramentas,</span>{' '}
          <span className="text-[clamp(1.75rem,4vw,2.75rem)] text-rose">doutora</span>
          <span className="text-[clamp(1.75rem,4vw,2.75rem)]">.</span>
        </h1>
        <p className="mt-3 max-w-xl font-serif text-base italic leading-relaxed text-ink-soft sm:text-lg">
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
