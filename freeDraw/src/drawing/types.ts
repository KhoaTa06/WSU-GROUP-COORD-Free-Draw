export type DrawingTool = 'pointer' | 'pen' | 'eraser' | 'shape';
export type ShapeType = 'rectangle' | 'ellipse' | 'triangle' | 'star';

export type DrawingLine = {
  kind: 'line';
  id: string;
  tool: 'pen' | 'eraser';
  points: number[];
  color: string;
  width: number;
};

export type DrawingShape = {
  kind: 'shape';
  id: string;
  shape: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export type DrawingElement = DrawingLine | DrawingShape;

export const shapeOptions: { type: ShapeType; label: string }[] = [
  { type: 'rectangle', label: 'Rectangle' },
  { type: 'ellipse', label: 'Ellipse' },
  { type: 'triangle', label: 'Triangle' },
  { type: 'star', label: 'Star' },
];
