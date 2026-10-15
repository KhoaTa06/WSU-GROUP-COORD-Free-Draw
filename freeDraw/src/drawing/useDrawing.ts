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

type History = {
  past: DrawingElement[][];
  present: DrawingElement[];
  future: DrawingElement[][];
};

const initialHistory: History = { past: [], present: [], future: [] };

function commit(history: History, next: DrawingElement[]): History {
  if (next === history.present) return history;
  return { past: [...history.past, history.present], present: next, future: [] };
}

export function useDrawing({ tool, color, penSize, eraserSize, selectedShape }: DrawingSettings) {
  const [history, setHistory] = React.useState<History>(initialHistory);
  const elements = history.present;
  const [eraserPosition, setEraserPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [selectedElementId, setSelectedElementId] = React.useState<string | null>(null);
  const nextElementId = React.useRef(1);
  const isDrawing = React.useRef(false);
  const drawStart = React.useRef<{ x: number; y: number } | null>(null);
  const drawingSnapshot = React.useRef<DrawingElement[] | null>(null);

  const undo = React.useCallback(() => {
    isDrawing.current = false;
    drawingSnapshot.current = null;
    setHistory((current) => {
      if (!current.past.length) return current;
      return {
        past: current.past.slice(0, -1),
        present: current.past[current.past.length - 1],
        future: [current.present, ...current.future],
      };
    });
    setSelectedElementId(null);
  }, []);

  const redo = React.useCallback(() => {
    isDrawing.current = false;
    drawingSnapshot.current = null;
    setHistory((current) => {
      if (!current.future.length) return current;
      return {
        past: [...current.past, current.present],
        present: current.future[0],
        future: current.future.slice(1),
      };
    });
    setSelectedElementId(null);
  }, []);

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
    drawingSnapshot.current = elements;
    if (tool === 'shape') {
      drawStart.current = position;
      const id = `drawing-${nextElementId.current++}`;
      setSelectedElementId(id);
      setHistory((current) => ({ ...current, present: [...current.present, {
        kind: 'shape',
        id,
        shape: selectedShape,
        x: position.x,
        y: position.y,
        width: 0,
        height: 0,
        color,
      }] }));
      return;
    }

    const id = `drawing-${nextElementId.current++}`;
    setHistory((current) => ({ ...current, present: [...current.present, {
      kind: 'line',
      id,
      tool,
      points: [position.x, position.y],
      color,
      width: tool === 'pen' ? penSize : eraserSize,
    }] }));
  };

  const handleMouseMove = (event: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const position = event.target.getStage()?.getPointerPosition();
    if (!position) return;
    if (tool === 'eraser') setEraserPosition(position);
    if (!isDrawing.current) return;

    setHistory((current) => {
      const previous = current.present;
      const lastElement = previous[previous.length - 1];
      if (!lastElement) return current;

      const next = [...previous];
      if (lastElement.kind === 'shape' && drawStart.current) {
        next[next.length - 1] = {
          ...lastElement,
          x: Math.min(drawStart.current.x, position.x),
          y: Math.min(drawStart.current.y, position.y),
          width: Math.abs(position.x - drawStart.current.x),
          height: Math.abs(position.y - drawStart.current.y),
        };
        return { ...current, present: next };
      }

      if (lastElement.kind !== 'line') return current;
      next[next.length - 1] = {
        ...lastElement,
        points: [...lastElement.points, position.x, position.y],
      };
      return { ...current, present: next };
    });
  };

  const handleMouseUp = () => {
    if (isDrawing.current && drawingSnapshot.current) {
      const snapshot = drawingSnapshot.current;
      setHistory((current) => ({ past: [...current.past, snapshot], present: current.present, future: [] }));
    }
    isDrawing.current = false;
    drawStart.current = null;
    drawingSnapshot.current = null;
  };

  const handleMouseLeave = () => {
    handleMouseUp();
    setEraserPosition(null);
  };

  const updateShape = (id: string, geometry: { x: number; y: number; width: number; height: number }) => {
    setHistory((current) => {
      const previous = current.present;
      const shape = previous.find((element) => element.kind === 'shape' && element.id === id);
      if (!shape || shape.kind !== 'shape') return current;
      const updatedShape = { ...shape, ...geometry };
      if (shape.x === updatedShape.x && shape.y === updatedShape.y && shape.width === updatedShape.width && shape.height === updatedShape.height) return current;
      return commit(current, previous.map((element) => element === shape ? updatedShape : element));
    });
  };

  const updateStroke = (id: string, points: number[]) => {
    setHistory((current) => {
      const stroke = current.present.find((element) => element.kind === 'line' && element.id === id);
      if (!stroke || stroke.kind !== 'line' || stroke.points.every((point, index) => point === points[index]) && stroke.points.length === points.length) return current;
      return commit(current, current.present.map((element) => element === stroke ? { ...stroke, points } : element));
    });
  };

  const deleteSelectedElement = React.useCallback(() => {
    if (!selectedElementId) return;
    setHistory((current) => commit(current, current.present.some((element) => element.id === selectedElementId)
      ? current.present.filter((element) => element.id !== selectedElementId)
      : current.present));
    setSelectedElementId(null);
  }, [selectedElementId]);

  return {
    elements,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    undo,
    redo,
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
