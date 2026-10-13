import { ShapePreview } from './ShapePreview';
import { shapeOptions, type ShapeType } from './types';

type ShapeLibraryProps = {
  value: ShapeType;
  onChange: (shape: ShapeType) => void;
};

export function ShapeLibrary({ value, onChange }: ShapeLibraryProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold leading-none tracking-[0.02em] text-[#777482]">Shape library</span>
      <div className="flex gap-1" role="group" aria-label="Choose a shape">
        {shapeOptions.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            aria-label={label}
            aria-pressed={value === type}
            title={label}
            onClick={() => onChange(type)}
            className={`grid size-[38px] place-items-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a598f2] ${value === type ? 'border-[#e2dcff] bg-[#f0edff] text-[#6349d2]' : 'border-transparent bg-[#f7f6f9] text-[#777482] hover:bg-[#efedf4]'}`}
          >
            <ShapePreview shape={type} />
          </button>
        ))}
      </div>
    </div>
  );
}
