import type { ShapeType } from './types';

type ShapePreviewProps = {
  shape: ShapeType;
  className?: string;
};

export function ShapePreview({ shape, className = 'size-[19px]' }: ShapePreviewProps) {
  const common = { fill: 'currentColor', stroke: 'currentColor', strokeWidth: 1 };

  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {shape === 'rectangle' && <rect x="3" y="4" width="18" height="16" rx="3" {...common} />}
      {shape === 'ellipse' && <ellipse cx="12" cy="12" rx="9" ry="7" {...common} />}
      {shape === 'triangle' && <polygon points="12,3 21,20 3,20" {...common} />}
      {shape === 'star' && <polygon points="12,2 14.8,8.5 22,9.2 16.5,14.1 18.2,21 12,17.3 5.8,21 7.5,14.1 2,9.2 9.2,8.5" {...common} />}
    </svg>
  );
}
