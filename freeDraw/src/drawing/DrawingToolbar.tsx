import { ShapeLibrary } from './ShapeLibrary';
import { SizeControl } from './SizeControl';
import { ToolSelector } from './ToolSelector';
import type { DrawingTool, ShapeType } from './types';

type DrawingToolbarProps = {
  tool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  color: string;
  onColorChange: (color: string) => void;
  penSize: number;
  onPenSizeChange: (size: number) => void;
  eraserSize: number;
  onEraserSizeChange: (size: number) => void;
  selectedShape: ShapeType;
  onShapeChange: (shape: ShapeType) => void;
  selectedElementId: string | null;
  onDeleteSelectedElement: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
};

export function DrawingToolbar({
  tool,
  onToolChange,
  color,
  onColorChange,
  penSize,
  onPenSizeChange,
  eraserSize,
  onEraserSizeChange,
  selectedShape,
  onShapeChange,
  selectedElementId,
  onDeleteSelectedElement,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: DrawingToolbarProps) {
  const hint = tool === 'pointer' ? 'Select and transform' : tool === 'pen' ? 'Ready to draw' : tool === 'eraser' ? 'Erase pen strokes' : `Drawing ${selectedShape}`;

  return (
    <div className="flex min-h-[91px] flex-wrap items-center gap-x-7 gap-y-4 border-b border-[#ecebf0] bg-white px-[22px] py-[15px] max-sm:gap-x-5 max-sm:px-4" role="toolbar" aria-label="Drawing tools">
      <ToolSelector value={tool} onChange={onToolChange} />

      {tool === 'shape' && <ShapeLibrary value={selectedShape} onChange={onShapeChange} />}

      <div className={`flex min-w-[98px] flex-col gap-[7px] ${tool === 'eraser' || tool === 'pointer' ? 'opacity-40' : ''}`}>
        <label className="text-[11px] font-semibold leading-none tracking-[0.02em] text-[#777482]" htmlFor="pen-color">Color</label>
        <div className="flex items-center gap-2">
          <input
            id="pen-color"
            className="size-7 cursor-pointer overflow-hidden rounded-lg border border-[#e1dfe6] bg-white p-0.5 disabled:cursor-not-allowed"
            type="color"
            value={color}
            onChange={(event) => onColorChange(event.target.value)}
            disabled={tool === 'eraser' || tool === 'pointer'}
            aria-label="Pen and shape color"
          />
          <span className="text-[10px] font-semibold text-[#777482]">{color.toUpperCase()}</span>
        </div>
      </div>

      <SizeControl id="pen-size" label="Pen size" value={penSize} min={1} max={40} disabled={tool !== 'pen'} onChange={onPenSizeChange} />
      <SizeControl id="eraser-size" label="Eraser size" value={eraserSize} min={4} max={80} disabled={tool !== 'eraser'} onChange={onEraserSizeChange} />

      <div className="flex items-center gap-2 border-l border-[#ecebf0] pl-5 max-sm:pl-0 max-sm:border-l-0">
        <button type="button" onClick={onUndo} disabled={!canUndo} aria-label="Undo" title="Undo (Ctrl/⌘+Z)" className="inline-flex h-[38px] items-center gap-2 rounded-lg border border-[#ecebf0] px-3 text-xs font-semibold text-[#746f7f] hover:bg-[#f7f6f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a598f2] disabled:cursor-not-allowed disabled:opacity-40">
          <svg className="size-4 fill-none stroke-current" viewBox="0 0 20 20" aria-hidden="true"><path d="M8 4 4 8l4 4M4 8h8a4 4 0 0 1 0 8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>
          Undo
        </button>
        <button type="button" onClick={onRedo} disabled={!canRedo} aria-label="Redo" title="Redo (Ctrl/⌘+Shift+Z or Ctrl+Y)" className="inline-flex h-[38px] items-center gap-2 rounded-lg border border-[#ecebf0] px-3 text-xs font-semibold text-[#746f7f] hover:bg-[#f7f6f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a598f2] disabled:cursor-not-allowed disabled:opacity-40">
          <svg className="size-4 fill-none stroke-current" viewBox="0 0 20 20" aria-hidden="true"><path d="m12 4 4 4-4 4m4-4H8a4 4 0 0 0 0 8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>
          Redo
        </button>
        <button
          type="button"
          onClick={onDeleteSelectedElement}
          disabled={!selectedElementId}
          className="inline-flex h-[38px] items-center gap-2 rounded-lg border border-[#ecebf0] bg-white px-3 text-xs font-semibold text-[#746f7f] transition-colors hover:border-[#f1caca] hover:bg-[#fff5f5] hover:text-[#b74242] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a598f2] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#ecebf0] disabled:hover:bg-white disabled:hover:text-[#746f7f]"
          aria-label="Delete selected item"
          title={selectedElementId ? 'Delete selected item' : 'Select a shape or stroke to delete'}
        >
          <svg className="size-4 fill-none stroke-current" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12M8 6V4h4v2m2 0-.7 10H6.7L6 6m3 3v4m2-4v4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>
          Delete
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2 whitespace-nowrap text-[11px] text-[#8a8893] max-md:hidden">
        <span className="size-[7px] rounded-full bg-[#61bd8c]" />
        {hint}
      </div>
    </div>
  );
}
