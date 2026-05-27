import type { ECGTracingId } from '../types';

export interface EcgTracing {
  id: ECGTracingId;
  label: string;
  width: number;
  height: number;
  path: string;
  rateBpm: number;
  rhythmLabel: string;
}

interface CycleSpec {
  width: number;
  pPresent: boolean;
  pAmpl: number;
  pWidth: number;
  prSegment: number;
  qDepth: number;
  rHeight: number;
  sDepth: number;
  qrsWidth: number;
  stOffset: number;
  stSegment: number;
  tAmpl: number;
  tWidth: number;
  tpRest: number;
}

const NORMAL: CycleSpec = {
  width: 160,
  pPresent: true,
  pAmpl: 8,
  pWidth: 22,
  prSegment: 12,
  qDepth: 4,
  rHeight: 58,
  sDepth: 18,
  qrsWidth: 14,
  stOffset: 0,
  stSegment: 14,
  tAmpl: 14,
  tWidth: 22,
  tpRest: 70,
};

function cyclePath(start: number, baseline: number, c: CycleSpec): string {
  let p = '';
  let x = start;

  const lineTo = (dx: number, dy = 0) => {
    x += dx;
    p += `L ${x.toFixed(2)} ${(baseline + dy).toFixed(2)} `;
  };

  const quadTo = (dx: number, cy: number, ex: number, ey = 0) => {
    const cx = x + cy;
    const cyAbs = baseline + ex;
    x += dx;
    const exAbs = x;
    const eyAbs = baseline + ey;
    p += `Q ${cx.toFixed(2)} ${cyAbs.toFixed(2)} ${exAbs.toFixed(2)} ${eyAbs.toFixed(2)} `;
  };

  lineTo(10);

  if (c.pPresent) {
    quadTo(c.pWidth, c.pWidth / 2, -c.pAmpl);
  } else {
    lineTo(c.pWidth);
  }

  lineTo(c.prSegment);

  lineTo(3, c.qDepth);
  lineTo(c.qrsWidth / 2, -c.rHeight);
  lineTo(c.qrsWidth / 2, c.sDepth);
  lineTo(4, c.stOffset);

  lineTo(c.stSegment, c.stOffset);

  quadTo(c.tWidth, c.tWidth / 2, -c.tAmpl + c.stOffset, c.stOffset);

  const remaining = c.width - (x - start);
  if (remaining > 0) lineTo(remaining);

  return p;
}

function buildPath(cycles: CycleSpec[], baseline: number, totalWidth: number): string {
  let p = `M 0 ${baseline} `;
  let x = 0;
  for (const c of cycles) {
    p += cyclePath(x, baseline, c);
    x += c.width;
  }
  if (x < totalWidth) {
    p += `L ${totalWidth} ${baseline} `;
  }
  return p;
}

function repeat(cycle: CycleSpec, n: number, totalWidth: number): CycleSpec[] {
  return Array.from({ length: n }, () => ({ ...cycle, width: totalWidth / n }));
}

const WIDTH = 800;
const HEIGHT = 200;
const BASELINE = 110;

export const TRACINGS: Record<ECGTracingId, EcgTracing> = {
  'normal-sinus': {
    id: 'normal-sinus',
    label: 'Ritmo sinusal normal',
    width: WIDTH,
    height: HEIGHT,
    rateBpm: 75,
    rhythmLabel: 'sinusal',
    path: buildPath(repeat(NORMAL, 5, WIDTH), BASELINE, WIDTH),
  },
  'sinus-brady': {
    id: 'sinus-brady',
    label: 'Bradicardia sinusal',
    width: WIDTH,
    height: HEIGHT,
    rateBpm: 48,
    rhythmLabel: 'sinusal',
    path: buildPath(repeat({ ...NORMAL, tpRest: 140 }, 3, WIDTH), BASELINE, WIDTH),
  },
  'sinus-tachy': {
    id: 'sinus-tachy',
    label: 'Taquicardia sinusal',
    width: WIDTH,
    height: HEIGHT,
    rateBpm: 130,
    rhythmLabel: 'sinusal',
    path: buildPath(repeat({ ...NORMAL, tpRest: 30 }, 8, WIDTH), BASELINE, WIDTH),
  },
  af: {
    id: 'af',
    label: 'Fibrilação atrial',
    width: WIDTH,
    height: HEIGHT,
    rateBpm: 110,
    rhythmLabel: 'irregularmente irregular',
    path: buildPath(
      [
        { ...NORMAL, pPresent: false, width: 130 },
        { ...NORMAL, pPresent: false, width: 180 },
        { ...NORMAL, pPresent: false, width: 110 },
        { ...NORMAL, pPresent: false, width: 160 },
        { ...NORMAL, pPresent: false, width: 100 },
        { ...NORMAL, pPresent: false, width: 120 },
      ],
      BASELINE,
      WIDTH,
    ),
  },
  flutter: {
    id: 'flutter',
    label: 'Flutter atrial',
    width: WIDTH,
    height: HEIGHT,
    rateBpm: 150,
    rhythmLabel: 'regular com ondas F',
    path: buildPath(repeat({ ...NORMAL, pAmpl: 14, tpRest: 20 }, 6, WIDTH), BASELINE, WIDTH),
  },
  'stemi-inferior': {
    id: 'stemi-inferior',
    label: 'IAM com supra de ST inferior',
    width: WIDTH,
    height: HEIGHT,
    rateBpm: 78,
    rhythmLabel: 'sinusal',
    path: buildPath(repeat({ ...NORMAL, stOffset: -22 }, 5, WIDTH), BASELINE, WIDTH),
  },
  'stemi-anterior': {
    id: 'stemi-anterior',
    label: 'IAM com supra de ST anterior',
    width: WIDTH,
    height: HEIGHT,
    rateBpm: 88,
    rhythmLabel: 'sinusal',
    path: buildPath(repeat({ ...NORMAL, stOffset: -28, tAmpl: 4 }, 5, WIDTH), BASELINE, WIDTH),
  },
  lbbb: {
    id: 'lbbb',
    label: 'Bloqueio de ramo esquerdo',
    width: WIDTH,
    height: HEIGHT,
    rateBpm: 80,
    rhythmLabel: 'sinusal',
    path: buildPath(
      repeat({ ...NORMAL, qrsWidth: 36, rHeight: 40, sDepth: 30 }, 5, WIDTH),
      BASELINE,
      WIDTH,
    ),
  },
  rbbb: {
    id: 'rbbb',
    label: 'Bloqueio de ramo direito',
    width: WIDTH,
    height: HEIGHT,
    rateBpm: 78,
    rhythmLabel: 'sinusal',
    path: buildPath(
      repeat({ ...NORMAL, qrsWidth: 34, rHeight: 40, sDepth: 36 }, 5, WIDTH),
      BASELINE,
      WIDTH,
    ),
  },
};

export function getTracing(id: ECGTracingId): EcgTracing {
  return TRACINGS[id] ?? TRACINGS['normal-sinus'];
}
