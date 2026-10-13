import * as ToggleGroup from '@radix-ui/react-toggle-group';
import type { DrawingTool } from './types';

type ToolSelectorProps = {
  value: DrawingTool;
  onChange: (tool: DrawingTool) => void;
};

const itemClasses = 'inline-flex h-[38px] items-center justify-center gap-[7px] rounded-lg border border-transparent bg-[#f7f6f9] px-[11px] text-xs font-semibold text-[#666371] outline-none transition-colors hover:bg-[#efedf4] hover:text-[#393645] focus-visible:ring-2 focus-visible:ring-[#a598f2] data-[state=on]:border-[#e2dcff] data-[state=on]:bg-[#f0edff] data-[state=on]:text-[#6349d2]';

export function ToolSelector({ value, onChange }: ToolSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold leading-none tracking-[0.02em] text-[#777482]">Tool</span>
      <ToggleGroup.Root
        className="flex gap-[5px]"
        type="single"
        value={value}
        onValueChange={(nextTool) => nextTool && onChange(nextTool as DrawingTool)}
        aria-label="Drawing tool"
      >
        <ToggleGroup.Item className={itemClasses} value="pointer" aria-label="Pointer">
          <svg className="size-4 fill-none stroke-current" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 2 10 10-4 .8-.8 4L5 2Z" strokeLinejoin="round" /><path d="m10.5 12.5 3 4" strokeLinecap="round" /></svg>
          <span>Pointer</span>
        </ToggleGroup.Item>
        <ToggleGroup.Item className={itemClasses} value="pen" aria-label="Pen">
          <svg className="size-4 fill-none stroke-current" viewBox="0 0 20 20" aria-hidden="true"><path d="m13.8 3.2 3 3L7 16l-4 1 1-4 9.8-9.8Z" /><path d="m11.9 5.1 3 3" /></svg>
          <span>Pen</span>
        </ToggleGroup.Item>
        <ToggleGroup.Item className={itemClasses} value="eraser" aria-label="Eraser">
          <svg className="size-4 fill-none stroke-current" viewBox="0 0 20 20" aria-hidden="true"><path d="m7.2 4.2 8.6 8.6-4 4H7.3l-4-4 8.6-8.6a1.9 1.9 0 0 1 2.7 0" /><path d="M8.3 15.3 13 10.6" /></svg>
          <span>Eraser</span>
        </ToggleGroup.Item>
        <ToggleGroup.Item className={itemClasses} value="shape" aria-label="Shapes">
          <svg className="size-4 fill-none stroke-current" viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="3" width="14" height="14" rx="2" /><circle cx="13" cy="7" r="1.5" /></svg>
          <span>Shape</span>
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </div>
  );
}
