import type { ReceitaSimulacao } from '../data/simulacao-medicina';

interface Props {
  receita: ReceitaSimulacao;
  className?: string;
}

/**
 * ReceitaArt — render de uma receita médica/odontológica brasileira em estilo
 * editorial. Pensado para o app Guava Education como artefato visual de
 * simulação (a aluna recebe a "receita" como se um paciente trouxesse).
 *
 * Não é um documento oficial. Visual deliberadamente próximo do real para
 * suspender descrença em exercícios de estudo, mas mantém a estética da
 * casa: papel, blush, wine, traços finos, tipografia serifada.
 */
export default function ReceitaArt({ receita, className = '' }: Props) {
  const {
    prescritor,
    pacienteNome,
    pacienteIdade,
    data,
    itens,
    observacoesReceita,
  } = receita;

  // Cidade derivada do endereço da clínica (heurística simples para footer).
  const cidade = extrairCidade(prescritor.endereco);

  return (
    <div className={`mx-auto w-full max-w-[600px] ${className}`}>
      <article
        className="relative isolate overflow-hidden rounded-[6px] bg-[#FDFBF7] shadow-[0_30px_60px_-20px_rgba(74,18,38,0.25),0_12px_24px_-12px_rgba(74,18,38,0.18)] ring-1 ring-[#E8DED2]/70"
        style={{ aspectRatio: '14 / 20' }}
        aria-label={`Receita de ${prescritor.nome} para ${pacienteNome}`}
      >
        {/* --- Camadas de papel: textura sutil + tons de creme --- */}
        <PaperBackground />

        {/* --- Listras verticais de papel timbrado (muito suaves) --- */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-wine/60"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-[6px] w-[1px] bg-wine/30"
        />

        {/* --- Marca d'água (Rx) discreta no centro --- */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span
            className="select-none font-display text-[260px] italic leading-none text-wine/[0.035]"
            style={{ transform: 'rotate(-6deg)' }}
          >
            Rx
          </span>
        </div>

        {/* --- Conteúdo principal --- */}
        <div className="relative px-9 py-10 sm:px-11 sm:py-12">
          {/* ====== HEADER / CABEÇALHO ====== */}
          <header className="text-center">
            {/* Filete decorativo superior */}
            <div className="mx-auto mb-4 flex items-center justify-center gap-3">
              <span aria-hidden className="h-px w-10 bg-gold/60" />
              <span
                aria-hidden
                className="block h-1.5 w-1.5 rotate-45 bg-gold/70"
              />
              <span aria-hidden className="h-px w-10 bg-gold/60" />
            </div>

            <h2 className="font-display text-[26px] italic leading-tight text-ink sm:text-[28px]">
              {prescritor.clinica}
            </h2>

            <div className="mx-auto mt-2 h-px w-24 bg-line" />

            <p className="mt-3 font-display text-[16px] text-ink/90">
              {prescritor.nome}
            </p>

            <p className="mt-0.5 font-body text-[11.5px] italic text-mute">
              {prescritor.especialidade}
              <span className="mx-1.5 text-line">·</span>
              <span className="not-italic tracking-wide text-txt/80">
                {prescritor.registro}
              </span>
            </p>

            <p className="mt-1 font-body text-[10.5px] leading-relaxed text-mute/90">
              {prescritor.endereco}
              <br />
              <span className="tracking-wide">{prescritor.telefone}</span>
            </p>
          </header>

          {/* Separador duplo wine */}
          <DoubleRule className="mt-5" />

          {/* ====== EYEBROW RECEITUÁRIO ====== */}
          <div className="mt-6 text-center">
            <span
              className="font-display text-[11px] font-medium uppercase text-wine"
              style={{ letterSpacing: '0.46em' }}
            >
              Receituário
            </span>
          </div>

          {/* ====== PACIENTE / IDADE / DATA ====== */}
          <section className="mt-5 space-y-3">
            <FieldLine label="Paciente" value={pacienteNome} />

            <div className="flex gap-5">
              <FieldLine
                className="flex-1"
                label="Idade"
                value={pacienteIdade ?? '—'}
              />
              <FieldLine
                className="flex-1"
                label="Data"
                value={formatarData(data)}
              />
            </div>
          </section>

          {/* ====== USO INTERNO ====== */}
          <div className="mt-7">
            <span
              className="font-display text-[10.5px] font-medium uppercase text-wine/90"
              style={{ letterSpacing: '0.32em' }}
            >
              Uso Interno
            </span>
            <div className="mt-1 h-px w-full bg-line" />
          </div>

          {/* ====== LISTA DE MEDICAMENTOS ====== */}
          <ol className="mt-5 space-y-5">
            {itens.map((item, idx) => (
              <li key={idx} className="relative pl-7">
                {/* Número Rx */}
                <span
                  aria-hidden
                  className="absolute left-0 top-[2px] font-display text-[15px] italic text-wine"
                >
                  {idx + 1}.
                </span>

                {/* Nome do medicamento + apresentação */}
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-body text-[15px] font-semibold leading-snug text-ink">
                    {item.medicamento}
                  </h3>
                  {item.apresentacao && (
                    <span className="shrink-0 font-body text-[12px] italic text-mute">
                      {item.apresentacao}
                    </span>
                  )}
                </div>

                {/* Linha pontilhada decorativa abaixo */}
                <div
                  aria-hidden
                  className="mt-1 h-px w-full"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(to right, rgba(124,23,51,0.18) 0 2px, transparent 2px 6px)',
                  }}
                />

                {/* Posologia em "manuscrito" */}
                <p
                  className="mt-2 pl-1 text-[19px] leading-snug text-ink/95"
                  style={{
                    fontFamily: '"Caveat", "Indie Flower", cursive',
                    // tinta levemente irregular
                    textShadow: '0 0 0.4px rgba(74,18,38,0.4)',
                  }}
                >
                  {item.posologia}
                </p>

                {/* Observação opcional */}
                {item.observacao && (
                  <p className="mt-1 pl-1 font-body text-[11.5px] italic text-mute">
                    {item.observacao}
                  </p>
                )}
              </li>
            ))}
          </ol>

          {/* ====== OBSERVAÇÕES GERAIS ====== */}
          {observacoesReceita && (
            <section className="mt-7">
              <div className="h-px w-full bg-line" />
              <p className="mt-3 font-body text-[12px] italic leading-relaxed text-txt/85">
                <span className="not-italic font-display text-[10.5px] uppercase tracking-[0.28em] text-wine/85">
                  Observações
                </span>
                <span className="mx-2 text-line">·</span>
                {observacoesReceita}
              </p>
            </section>
          )}

          {/* ====== FOOTER / ASSINATURA ====== */}
          <footer className="mt-10">
            {/* Cidade + data alinhados à direita */}
            <p className="text-right font-body text-[12px] italic text-txt/90">
              {cidade}, {formatarDataExtenso(data)}.
            </p>

            {/* Bloco da assinatura */}
            <div className="mt-10 flex flex-col items-center">
              {/* Linha de assinatura */}
              <div className="h-px w-[68%] bg-ink/70" />

              {/* Nome do prescritor abaixo da linha */}
              <p className="mt-2 font-body text-[12.5px] text-ink">
                {prescritor.nome}
              </p>
              <p className="font-body text-[10.5px] tracking-[0.18em] text-mute">
                {prescritor.registro}
              </p>

              {/* Carimbo levemente rotacionado */}
              <Carimbo
                nome={prescritor.nome}
                registro={prescritor.registro}
                especialidade={prescritor.especialidade}
              />
            </div>
          </footer>

          {/* Filete inferior delicado */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span aria-hidden className="h-px w-12 bg-line" />
            <span aria-hidden className="h-[3px] w-[3px] rounded-full bg-gold/70" />
            <span aria-hidden className="h-px w-12 bg-line" />
          </div>
        </div>
      </article>
    </div>
  );
}

/* ============================================================== */
/* Subcomponentes                                                  */
/* ============================================================== */

function PaperBackground() {
  return (
    <>
      {/* Base creme suave em gradiente para evitar branco achatado */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, #FFFDF9 0%, #FBF6EF 55%, #F5EBE0 100%)',
        }}
      />
      {/* Grão de papel (SVG turbulence inline, baixa opacidade) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.4  0 0 0 0 0.35  0 0 0 0.08 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      {/* Linha de borda interna fina */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[10px] rounded-[4px] ring-1 ring-line/60"
      />
    </>
  );
}

function DoubleRule({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`flex flex-col gap-[2px] ${className}`}>
      <span className="block h-px w-full bg-wine/70" />
      <span className="block h-px w-full bg-wine/30" />
    </div>
  );
}

interface FieldLineProps {
  label: string;
  value: string;
  className?: string;
}

function FieldLine({ label, value, className = '' }: FieldLineProps) {
  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className="shrink-0 font-display text-[11px] uppercase tracking-[0.24em] text-wine/85">
        {label}:
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="block truncate font-body text-[13.5px] text-ink">
          {value}
        </span>
        <span
          aria-hidden
          className="absolute inset-x-0 -bottom-1 block h-px bg-ink/55"
        />
      </span>
    </div>
  );
}

function Carimbo({
  nome,
  registro,
  especialidade,
}: {
  nome: string;
  registro: string;
  especialidade: string;
}) {
  // Carimbo retangular com leve rotação para parecer aplicado à mão.
  return (
    <div
      aria-hidden
      className="mt-5 inline-block"
      style={{ transform: 'rotate(-1.4deg)' }}
    >
      <div
        className="relative border-[1.5px] border-wine/55 px-5 py-2 text-center"
        style={{
          // tinta levemente desigual
          boxShadow:
            'inset 0 0 0 2px rgba(124,23,51,0.06), 0 0 0 0.5px rgba(124,23,51,0.18)',
          opacity: 0.88,
        }}
      >
        <p className="font-display text-[11px] uppercase tracking-[0.22em] text-wine/85">
          {nome}
        </p>
        <p className="mt-0.5 font-body text-[9.5px] italic text-wine/70">
          {especialidade}
        </p>
        <p className="mt-0.5 font-body text-[9px] tracking-[0.18em] text-wine/75">
          {registro}
        </p>
      </div>
    </div>
  );
}

/* ============================================================== */
/* Utilitários                                                     */
/* ============================================================== */

const MESES_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/**
 * Aceita string ISO (YYYY-MM-DD) ou já formatada (DD/MM/YYYY).
 * Retorna sempre DD/MM/AAAA.
 */
function formatarData(input: string): string {
  if (!input) return '';
  // Se já está em DD/MM/...
  if (/^\d{2}\/\d{2}\/\d{2,4}$/.test(input)) return input;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Versão por extenso "8 de abril de 2026" para o footer.
 */
function formatarDataExtenso(input: string): string {
  if (!input) return '';
  let d: Date | null = null;
  if (/^\d{2}\/\d{2}\/\d{2,4}$/.test(input)) {
    const [dd, mm, yyyy] = input.split('/').map(Number);
    const ano = yyyy < 100 ? 2000 + yyyy : yyyy;
    d = new Date(ano, mm - 1, dd);
  } else {
    d = new Date(input);
  }
  if (!d || Number.isNaN(d.getTime())) return input;
  return `${d.getDate()} de ${MESES_PT[d.getMonth()]} de ${d.getFullYear()}`;
}

/**
 * Tenta extrair a cidade do final do endereço. Aceita formatos comuns:
 *  - "Av. Faria Lima, 2810 — São Paulo/SP"
 *  - "Rua X, 123, Belo Horizonte - MG"
 *  - "..., Rio de Janeiro/RJ, CEP 22000-000"
 * Em último caso devolve uma string sensata.
 */
function extrairCidade(endereco: string): string {
  if (!endereco) return '';
  // tenta padrão "Cidade/UF" no fim
  const matchSlash = endereco.match(/([A-Za-zÀ-ÿ' .]+)\/[A-Z]{2}/);
  if (matchSlash) return matchSlash[1].trim().replace(/^[—-]\s*/, '');
  // tenta "Cidade - UF"
  const matchDash = endereco.match(/([A-Za-zÀ-ÿ' .]+)\s*[-—]\s*[A-Z]{2}/);
  if (matchDash) return matchDash[1].trim();
  // fallback: último segmento separado por vírgula
  const partes = endereco.split(',').map((p) => p.trim()).filter(Boolean);
  return partes[partes.length - 1] ?? '';
}
