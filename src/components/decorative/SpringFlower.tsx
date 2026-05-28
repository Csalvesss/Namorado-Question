interface Props {
  className?: string;
  size?: number;
  tone?: 'rose' | 'gold' | 'wine';
}

export default function SpringFlower({ className = '', size = 120, tone = 'rose' }: Props) {
  const petal = tone === 'gold' ? '#e9c79c' : tone === 'wine' ? '#c97b8a' : '#f3d9dd';
  const petalDeep = tone === 'gold' ? '#b8895a' : tone === 'wine' ? '#7a1f3d' : '#c97b8a';
  const stem = '#9aa48c';
  const leaf = '#b8c4a6';

  return (
    <svg
      viewBox="0 0 120 160"
      width={size}
      height={(size * 160) / 120}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M62 158 Q60 110 70 70 Q78 40 90 22"
        stroke={stem}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M68 105 Q52 102 44 92 Q56 92 68 100 Z"
        fill={leaf}
        opacity="0.7"
      />
      <path
        d="M74 78 Q92 76 100 66 Q86 66 74 74 Z"
        fill={leaf}
        opacity="0.7"
      />
      <g transform="translate(90 18)">
        <ellipse cx="0" cy="-7" rx="6" ry="9" fill={petal} transform="rotate(-30)" />
        <ellipse cx="7" cy="-2" rx="6" ry="9" fill={petal} transform="rotate(30)" />
        <ellipse cx="5" cy="7" rx="6" ry="9" fill={petalDeep} opacity="0.55" transform="rotate(80)" />
        <ellipse cx="-5" cy="6" rx="6" ry="9" fill={petal} transform="rotate(-110)" />
        <ellipse cx="-7" cy="-2" rx="6" ry="9" fill={petalDeep} opacity="0.55" transform="rotate(-60)" />
        <circle cx="0" cy="0" r="3" fill={petalDeep} />
      </g>
      <g transform="translate(72 56)">
        <ellipse cx="0" cy="-5" rx="4" ry="6" fill={petal} transform="rotate(-30)" />
        <ellipse cx="5" cy="0" rx="4" ry="6" fill={petalDeep} opacity="0.55" transform="rotate(40)" />
        <ellipse cx="-4" cy="2" rx="4" ry="6" fill={petal} transform="rotate(-120)" />
        <circle cx="0" cy="0" r="2" fill={petalDeep} />
      </g>
    </svg>
  );
}
