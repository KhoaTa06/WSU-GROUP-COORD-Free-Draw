import React from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { DrawingElement, DrawingTool, ShapeType } from './types';

type DrawingSettings = {
  tool: DrawingTool;
  color: string;
  penSize: number;
  eraserSize: number;
  selectedShape: ShapeType;
};

export function useDrawing({ tool, color, penSize, eraserSize, selectedShape }: DrawingSettings) {
  const [elements, setElements] = React.useState<DrawingElement[]>([]);
  const [eraserPosition, setEraserPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [selectedElementId, setSelectedElementId] = React.useState<string | null>(null);
  const nextElementId = React.useRef(1);
  const isDrawing = React.useRef(false);
  const drawStart = React.useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = (event: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const position = event.target.getStage()?.getPointerPosition();
    if (!position) return;
    if (tool === 'eraser') setEraserPosition(position);
    if (tool === 'pointer') {
      if (event.target === event.target.getStage()) setSelectedElementId(null);
      return;
    }
    if (tool === 'shape' && event.target !== event.target.getStage()) return;

    isDrawing.current = true;
    if (tool === 'shape') {
      drawStart.current = position;
      const id = `drawing-${nextElementId.current++}`;
      setSelectedElementId(id);
      setElements((previous) => [...previous, {
        kind: 'shape',
        id,
        shape: selectedShape,
        x: position.x,
        y: position.y,
        width: 0,
        height: 0,
        color,
      }]);
      return;
    }

    const id = `drawing-${nextElementId.current++}`;
    setElements((previous) => [...previous, {
      kind: 'line',
      id,
      tool,
      points: [position.x, position.y],
      color,
      width: tool === 'pen' ? penSize : eraserSize,
    }]);
  };

  const handleMouseMove = (event: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const position = event.target.getStage()?.getPointerPosition();
    if (!position) return;
    if (tool === 'eraser') setEraserPosition(position);
    if (!isDrawing.current) return;

    setElements((previous) => {
      const lastElement = previous[previous.length - 1];
      if (!lastElement) return previous;

      const next = [...previous];
      if (lastElement.kind === 'shape' && drawStart.current) {
        next[next.length - 1] = {
          ...lastElement,
          x: Math.min(drawStart.current.x, position.x),
          y: Math.min(drawStart.current.y, position.y),
          width: Math.abs(position.x - drawStart.current.x),
          height: Math.abs(position.y - drawStart.current.y),
        };
        return next;
      }

      if (lastElement.kind !== 'line') return previous;
      next[next.length - 1] = {
        ...lastElement,
        points: [...lastElement.points, position.x, position.y],
      };
      return next;
    });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    drawStart.current = null;
  };

  const handleMouseLeave = () => {
    handleMouseUp();
    setEraserPosition(null);
  };

  const updateShape = (id: string, geometry: { x: number; y: number; width: number; height: number }) => {
    setElements((previous) => {
      const shape = previous.find((element) => element.kind === 'shape' && element.id === id);
      if (!shape || shape.kind !== 'shape') return previous;
      const updatedShape = { ...shape, ...geometry };
      return [...previous.filter((element) => element !== shape), updatedShape];
    });
  };

  const updateStroke = (id: string, points: number[]) => {
    setElements((previous) => previous.map((element) => (
      element.kind === 'line' && element.id === id ? { ...element, points } : element
    )));
  };

  const deleteSelectedElement = React.useCallback(() => {
    if (!selectedElementId) return;
    setElements((previous) => previous.filter((element) => element.id !== selectedElementId));
    setSelectedElementId(null);
  }, [selectedElementId]);

  return {
    elements,
    eraserPosition,
    selectedElementId,
    setSelectedElementId,
    updateShape,
    updateStroke,
    deleteSelectedElement,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
}
