import { useId } from 'react';

import { UI_FONT_STACK as F } from '../tokens/typography';

type ModuleNavIconProps = {
  label: string;
  colorStart: string;
  colorEnd: string;
  size?: number;
};

export function ModuleNavIcon({ label, colorStart, colorEnd, size = 40 }: ModuleNavIconProps) {
  const gradId = useId();
  const fontSize = label.length > 2 ? 8.5 : 10.5;
  const letterSpacing = label.length > 2 ? 0.2 : 0.4;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="7" y1="5" x2="33" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor={colorStart} />
          <stop offset="1" stopColor={colorEnd} />
        </linearGradient>
      </defs>
      <circle
        cx="20"
        cy="20"
        r="15.5"
        stroke={`url(#${gradId})`}
        strokeWidth="1.75"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="84 17"
        transform="rotate(-35 20 20)"
      />
      <text
        x="20"
        y="21"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={`url(#${gradId})`}
        fontSize={fontSize}
        fontWeight="700"
        fontFamily={F}
        letterSpacing={letterSpacing}
      >
        {label}
      </text>
    </svg>
  );
}
