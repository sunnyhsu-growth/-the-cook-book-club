import type { SVGProps, ReactNode } from 'react';

// ─── Hand-drawn red line-art doodles (à la Papier family cookbook) ───────────
// All use currentColor + stroke only, so color them with `text-terracotta`.

type DoodleProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 48 48',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function Strawberry(p: DoodleProps) {
  return (
    <svg {...base} {...p}>
      <path d="M24 16c-9 0-13 7-13 13 0 0 5 6 13 6s13-6 13-6c0-6-4-13-13-13Z" />
      <path d="M18 12c2 2 4 3 6 3s4-1 6-3M24 9v6" />
      <path d="M20 25v2M28 25v2M24 30v2M16 27v1M32 27v1" />
    </svg>
  );
}

export function Lemon(p: DoodleProps) {
  return (
    <svg {...base} {...p}>
      <path d="M14 31c-4-6 2-15 12-13 8 2 11 9 7 14-4 6-15 5-19-1Z" />
      <path d="M30 17c3-3 6-3 8-2-1 3-4 5-7 4" />
    </svg>
  );
}

export function CitrusHalf(p: DoodleProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="24" cy="24" r="13" />
      <circle cx="24" cy="24" r="9" />
      <path d="M24 15v18M15 24h18M17.6 17.6l12.8 12.8M30.4 17.6 17.6 30.4" />
    </svg>
  );
}

export function Whisk(p: DoodleProps) {
  return (
    <svg {...base} {...p}>
      <path d="M28 10 22 26" />
      <path d="M18 38c-2-4-3-9-2-14 4 2 7 6 9 11M22 26c-3 2-5 6-4 12M22 26c3 1 6 4 7 9M22 26c4 0 8 2 11 5" />
      <path d="m27 12 4-3 2 3-4 3Z" />
    </svg>
  );
}

export function ForkKnife(p: DoodleProps) {
  return (
    <svg {...base} {...p}>
      <path d="M16 9v10c0 2 3 2 3 0V9M17.5 19v20" />
      <path d="M31 9c-3 1-4 5-4 9 0 3 2 4 4 4M31 9v30" />
    </svg>
  );
}

export function PeaPod(p: DoodleProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 14c10 2 20 12 24 22" />
      <path d="M14 12c12 1 22 11 25 23-13-1-23-11-25-23Z" />
      <circle cx="21" cy="21" r="2.2" />
      <circle cx="27" cy="27" r="2.2" />
      <circle cx="32" cy="32" r="2.2" />
    </svg>
  );
}

export function Sparkle(p: DoodleProps) {
  return (
    <svg {...base} {...p}>
      <path d="M24 8c1.5 9 7 14.5 16 16-9 1.5-14.5 7-16 16-1.5-9-7-14.5-16-16 9-1.5 14.5-7 16-16Z" />
    </svg>
  );
}

export function Herb(p: DoodleProps) {
  return (
    <svg {...base} {...p}>
      <path d="M24 40V14" />
      <path d="M24 18c3-4 7-5 10-4-1 4-4 7-8 7M24 26c-3-4-7-5-10-4 1 4 4 7 8 7M24 32c3-3 6-4 9-3-1 3-4 6-7 5" />
    </svg>
  );
}

// Open cookbook with a little herb sprig — the brand mark.
export function CookBook(p: DoodleProps) {
  return (
    <svg {...base} {...p}>
      <path d="M24 19C19 15 12 14 7 16v21c5-2 12-1 17 3" />
      <path d="M24 19c5-4 12-5 17-3v21c-5-2-12-1-17 3" />
      <path d="M24 19v21" />
      <path d="M11 23h8M11 28h8M29 23h8M29 28h8" />
      <path d="M24 19v-7" />
      <path d="M24 14c-1.6-2.2-4.4-2.4-6-1.4 1 1.9 3.6 2.6 6 1.4Z" />
      <path d="M24 15c1.4-2.4 4.2-2.9 6-2 .8 2-1.6 3.6-6 2Z" />
    </svg>
  );
}

export const DOODLES = [
  Strawberry,
  Lemon,
  CitrusHalf,
  Whisk,
  ForkKnife,
  PeaPod,
  Sparkle,
  Herb,
];

// ─── A hand-drawn wavy divider line ──────────────────────────────────────────
export function WavyLine({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 10"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
    >
      <path d="M2 5 Q 9 0 16 5 T 30 5 T 44 5 T 58 5 T 72 5 T 86 5 T 100 5 T 114 5" />
    </svg>
  );
}

// ─── Scalloped photo frame (the squiggly red border around the cover photo) ──
function scallopPath(w: number, h: number, r: number): string {
  const nx = Math.max(2, Math.round(w / (2 * r)));
  const ny = Math.max(2, Math.round(h / (2 * r)));
  const sx = w / nx;
  const sy = h / ny;
  let d = 'M 0 0';
  for (let i = 0; i < nx; i++) d += ` a ${sx / 2} ${sx / 2} 0 0 1 ${sx} 0`;
  for (let i = 0; i < ny; i++) d += ` a ${sy / 2} ${sy / 2} 0 0 1 0 ${sy}`;
  for (let i = 0; i < nx; i++) d += ` a ${sx / 2} ${sx / 2} 0 0 1 ${-sx} 0`;
  for (let i = 0; i < ny; i++) d += ` a ${sy / 2} ${sy / 2} 0 0 1 0 ${-sy}`;
  return d + ' Z';
}

export function ScallopFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const W = 320;
  const H = 240;
  const R = 11;
  return (
    <div className={`relative ${className ?? ''}`}>
      {children}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-terracotta"
        viewBox={`-14 -14 ${W + 28} ${H + 28}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d={scallopPath(W, H, R)}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
