import * as Slider from '@radix-ui/react-slider';

type SizeControlProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  disabled: boolean;
  onChange: (value: number) => void;
};

export function SizeControl({ id, label, value, min, max, disabled, onChange }: SizeControlProps) {
  return (
    <div className={`flex w-[142px] flex-col gap-[7px] max-sm:w-[calc(50%_-_12px)] ${disabled ? 'opacity-40' : ''}`}>
      <label className="flex justify-between gap-3 text-[11px] font-semibold leading-none tracking-[0.02em] text-[#777482]" htmlFor={id}>
        {label} <strong className="font-semibold text-[#54515f]">{value}px</strong>
      </label>
      <Slider.Root
        id={id}
        className="relative flex h-4 w-full touch-none select-none items-center"
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={([nextValue]) => nextValue !== undefined && onChange(nextValue)}
        disabled={disabled}
        aria-label={label}
      >
        <Slider.Track className="relative h-1.5 grow rounded-full bg-[#e9e7f0]">
          <Slider.Range className="absolute h-full rounded-full bg-[#7158df]" />
        </Slider.Track>
        <Slider.Thumb className="block size-3.5 rounded-full border-2 border-white bg-[#7158df] shadow-[0_1px_4px_#38228a44] outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#a598f2]" aria-label={label} />
      </Slider.Root>
    </div>
  );
}
