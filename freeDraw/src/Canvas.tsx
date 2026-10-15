import React from 'react';
import { DrawingStage } from './drawing/DrawingStage';
import { DrawingToolbar } from './drawing/DrawingToolbar';
import { useDrawing } from './drawing/useDrawing';
import type { DrawingTool, ShapeType } from './drawing/types';

export default function Canvas() {
  const [tool, setTool] = React.useState<DrawingTool>('pen');
  const [color, setColor] = React.useState('#242329');
  const [penSize, setPenSize] = React.useState(5);
  const [eraserSize, setEraserSize] = React.useState(24);
  const [selectedShape, setSelectedShape] = React.useState<ShapeType>('rectangle');

  const drawing = useDrawing({ tool, color, penSize, eraserSize, selectedShape });
  const { selectedElementId, deleteSelectedElement, undo, redo } = drawing;

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (
        target.isContentEditable || target.closest('input, textarea, select, [contenteditable="true"]')
      )) return;

      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && !event.altKey) {
        const key = event.key.toLowerCase();
        if (key === 'z' || (key === 'y' && !event.shiftKey)) {
          event.preventDefault();
          if (key === 'y' || event.shiftKey) redo();
          else undo();
          return;
        }
      }
      if (!selectedElementId || (event.key !== 'Delete' && event.key !== 'Backspace')) return;

      event.preventDefault();
      deleteSelectedElement();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, deleteSelectedElement, undo, redo]);

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-[1240px] flex-col px-8 pb-7 pt-11 max-sm:px-3 max-sm:pb-4 max-sm:pt-5 sm:px-5 md:px-8">
      <header className="mb-7 flex items-center gap-3.5 max-sm:mb-5 max-sm:px-1">
        <div className="grid size-[42px] place-items-center rounded-[13px] bg-[#7158df] text-[27px] leading-none text-white shadow-[0_6px_14px_#7158df35]" aria-hidden="true">✳</div>
        <div>
          <h1 className="font-sans text-xl font-extrabold tracking-[-0.5px] text-[#292734]">Free Draw</h1>
          <p className="mt-0.5 text-[13px] text-[#8a8893]">A little space to make something</p>
        </div>
      </header>

      <section className="flex min-h-[620px] flex-1 flex-col overflow-hidden rounded-2xl border border-[#e9e7ed] bg-white shadow-[0_12px_36px_#342a5010,0_2px_6px_#342a5008] max-sm:min-h-[650px]" aria-label="Drawing workspace">
        <DrawingToolbar
          tool={tool}
          onToolChange={setTool}
          color={color}
          onColorChange={setColor}
          penSize={penSize}
          onPenSizeChange={setPenSize}
          eraserSize={eraserSize}
          onEraserSizeChange={setEraserSize}
          selectedShape={selectedShape}
          onShapeChange={setSelectedShape}
          selectedElementId={drawing.selectedElementId}
          onDeleteSelectedElement={drawing.deleteSelectedElement}
          canUndo={drawing.canUndo}
          canRedo={drawing.canRedo}
          onUndo={drawing.undo}
          onRedo={drawing.redo}
        />
        <DrawingStage
          elements={drawing.elements}
          tool={tool}
          eraserSize={eraserSize}
          eraserPosition={drawing.eraserPosition}
          selectedElementId={drawing.selectedElementId}
          onSelectElement={drawing.setSelectedElementId}
          onShapeGeometryChange={drawing.updateShape}
          onStrokePointsChange={drawing.updateStroke}
          onMouseDown={drawing.handleMouseDown}
          onMouseMove={drawing.handleMouseMove}
          onMouseUp={drawing.handleMouseUp}
          onMouseLeave={drawing.handleMouseLeave}
        />
        <footer className="flex min-h-[42px] items-center justify-between border-t border-[#ecebf0] px-[18px] text-[11px] text-[#a09eaa] max-sm:px-3 max-sm:text-[10px]">
          <span>Untitled canvas</span>
          <span>{tool === 'pointer' ? 'Select a shape or stroke to move or resize' : tool === 'shape' ? 'Drag to draw a shape' : tool === 'eraser' ? 'Eraser removes pen strokes only' : 'Draw with your mouse or touch'}</span>
        </footer>
      </section>
      <p className="mt-[18px] text-center text-xs text-[#9b99a3]">Your canvas is ready whenever inspiration strikes.</p>
    </main>
  );
}
