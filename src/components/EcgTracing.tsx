import { getTracing } from '../lib/ecg-tracings';
import type { ECGPoint, ECGTracingId } from '../types';

interface EcgTracingProps {
  tracingId: ECGTracingId;
  highlight?: ECGPoint['region'] | null;
  showGrid?: boolean;
  className?: string;
}

export default function EcgTracing({
  tracingId,
  highlight,
  showGrid = true,
  className = '',
}: EcgTracingProps) {
  const tracing = getTracing(tracingId);
  const viewBox = `0 0 ${tracing.width} ${tracing.height}`;

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl border border-line bg-[#fff7f4] ${className}`}>
      <svg
        viewBox={viewBox}
        preserveAspectRatio="none"
        className="block h-[180px] w-full sm:h-[220px]"
        aria-label={`Traçado: ${tracing.label}`}
      >
        {showGrid && (
          <>
            <defs>
              <pattern id={`grid-sm-${tracingId}`} width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#f3d9dd" strokeWidth="0.4" />
              </pattern>
              <pattern id={`grid-lg-${tracingId}`} width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="40" fill={`url(#grid-sm-${tracingId})`} />
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#c97b8a" strokeWidth="0.7" opacity="0.5" />
              </pattern>
            </defs>
            <rect width={tracing.width} height={tracing.height} fill={`url(#grid-lg-${tracingId})`} />
          </>
        )}

        {highlight && (
          <rect
            x={highlight.x * tracing.width}
            y={highlight.y * tracing.height}
            width={highlight.w * tracing.width}
            height={highlight.h * tracing.height}
            fill="#7a1f3d"
            fillOpacity="0.08"
            stroke="#7a1f3d"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            rx="4"
            className="transition-all duration-300"
          />
        )}

        <path
          d={tracing.path}
          fill="none"
          stroke="#2b1d1a"
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      <div className="pointer-events-none absolute left-3 top-2 font-sans text-[10px] uppercase tracking-[0.2em] text-muted">
        DII · 25mm/s · 10mm/mV
      </div>
    </div>
  );
}
