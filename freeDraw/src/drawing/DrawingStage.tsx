import React from 'react';
import { Circle, Ellipse, Layer, Line, Rect, RegularPolygon, Stage, Star, Transformer } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Node as KonvaNode } from 'konva/lib/Node';
import type { DrawingElement, DrawingShape, DrawingTool } from './types';

type ShapeGeometry = Pick<DrawingShape, 'x' | 'y' | 'width' | 'height'>;

type DrawingStageProps = {
  elements: DrawingElement[];
  tool: DrawingTool;
  eraserSize: number;
  eraserPosition: { x: number; y: number } | null;
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  onShapeGeometryChange: (id: string, geometry: ShapeGeometry) => void;
  onStrokePointsChange: (id: string, points: number[]) => void;
  onMouseDown: (event: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onMouseMove: (event: KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
};

type SelectableStrokeProps = {
  id: string;
  points: number[];
  tool: 'pen' | 'eraser';
  color: string;
  width: number;
  selected: boolean;
  selectable: boolean;
  registerNode: (id: string, node: KonvaNode | null) => void;
  onSelect: (id: string) => void;
  onPointsChange: (id: string, points: number[]) => void;
};

function SelectableStroke({ id, points, tool, color, width, selected, selectable, registerNode, onSelect, onPointsChange }: SelectableStrokeProps) {
  const transformPoints = (node: KonvaNode) => {
    const transform = node.getTransform();
    const transformedPoints: number[] = [];
    for (let i = 0; i < points.length; i += 2) {
      const point = transform.point({ x: points[i], y: points[i + 1] });
      transformedPoints.push(point.x, point.y);
    }
    node.position({ x: 0, y: 0 });
    node.scale({ x: 1, y: 1 });
    return transformedPoints;
  };

  return (
    <Line
      ref={(node) => registerNode(id, node)}
      points={points}
      stroke={color}
      strokeWidth={width}
      tension={0.5}
      lineCap="round"
      lineJoin="round"
      globalCompositeOperation={tool === 'eraser' ? 'destination-out' : 'source-over'}
      listening={selectable}
      hitStrokeWidth={12}
      draggable={selected && selectable}
      onClick={(event) => {
        if (!selectable) return;
        event.cancelBubble = true;
        onSelect(id);
      }}
      onTap={(event) => {
        if (!selectable) return;
        event.cancelBubble = true;
        onSelect(id);
      }}
      onDragStart={() => onSelect(id)}
      onDragEnd={(event) => {
        const node = event.target;
        const { x, y } = node.position();
        node.position({ x: 0, y: 0 });
        onPointsChange(id, points.map((coordinate, index) => coordinate + (index % 2 === 0 ? x : y)));
      }}
      onTransformEnd={(event) => onPointsChange(id, transformPoints(event.target))}
    />
  );
}

type SelectableShapeProps = {
  shape: DrawingShape;
  selected: boolean;
  selectable: boolean;
  registerNode: (id: string, node: KonvaNode | null) => void;
  onSelect: (id: string) => void;
  onGeometryChange: (id: string, geometry: ShapeGeometry) => void;
};

function SelectableShape({ shape, selected, selectable, registerNode, onSelect, onGeometryChange }: SelectableShapeProps) {
  const common = {
    fill: shape.color,
    listening: selectable,
    draggable: selected && selectable,
    onClick: (event: KonvaEventObject<Event>) => {
      if (!selectable) return;
      event.cancelBubble = true;
      onSelect(shape.id);
    },
    onTap: (event: KonvaEventObject<Event>) => {
      if (!selectable) return;
      event.cancelBubble = true;
      onSelect(shape.id);
    },
    onDragStart: () => onSelect(shape.id),
    onDragEnd: (event: KonvaEventObject<Event>) => {
      const { x, y } = event.target.position();
      const isRect = shape.shape === 'rectangle';
      onGeometryChange(shape.id, {
        x: isRect ? x : x - shape.width / 2,
        y: isRect ? y : y - shape.height / 2,
        width: shape.width,
        height: shape.height,
      });
    },
    onTransformEnd: (event: KonvaEventObject<Event>) => {
      const node = event.target;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const width = Math.max(8, shape.width * scaleX);
      const height = Math.max(8, shape.height * scaleY);
      const { x, y } = node.position();
      node.scale({ x: 1, y: 1 });
      const isRect = shape.shape === 'rectangle';
      onGeometryChange(shape.id, {
        x: isRect ? x : x - width / 2,
        y: isRect ? y : y - height / 2,
        width,
        height,
      });
    },
  };

  if (shape.shape === 'rectangle') {
    return <Rect ref={(node) => registerNode(shape.id, node)} {...common} x={shape.x} y={shape.y} width={shape.width} height={shape.height} />;
  }
  if (shape.shape === 'ellipse') {
    return <Ellipse ref={(node) => registerNode(shape.id, node)} {...common} x={shape.x + shape.width / 2} y={shape.y + shape.height / 2} radiusX={shape.width / 2} radiusY={shape.height / 2} />;
  }

  const radius = Math.min(shape.width, shape.height) / 2;
  const position = { x: shape.x + shape.width / 2, y: shape.y + shape.height / 2 };
  if (shape.shape === 'triangle') {
    return <RegularPolygon ref={(node) => registerNode(shape.id, node)} {...common} {...position} sides={3} radius={radius} />;
  }
  return <Star ref={(node) => registerNode(shape.id, node)} {...common} {...position} numPoints={5} innerRadius={radius / 2} outerRadius={radius} />;
}

export function DrawingStage({
  elements,
  tool,
  eraserSize,
  eraserPosition,
  selectedElementId,
  onSelectElement,
  onShapeGeometryChange,
  onStrokePointsChange,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
}: DrawingStageProps) {
  const surfaceRef = React.useRef<HTMLDivElement>(null);
  const transformerRef = React.useRef<import('konva/lib/shapes/Transformer').Transformer>(null);
  const shapeNodes = React.useRef(new Map<string, KonvaNode>());
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setSize({
        width: Math.floor(entry.contentRect.width),
        height: Math.floor(entry.contentRect.height),
      });
    });
    observer.observe(surface);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const transformer = transformerRef.current;
    const selectedNode = selectedElementId ? shapeNodes.current.get(selectedElementId) : undefined;
    transformer?.nodes(tool === 'pointer' && selectedNode ? [selectedNode] : []);
    transformer?.getLayer()?.batchDraw();
  }, [tool, selectedElementId]);

  const registerNode = (id: string, node: KonvaNode | null) => {
    if (node) shapeNodes.current.set(id, node);
    else shapeNodes.current.delete(id);
  };

  return (
    <div
      ref={surfaceRef}
      className={`relative min-h-[420px] flex-1 touch-none overflow-hidden bg-white [background-image:radial-gradient(#e8e7ed_0.8px,transparent_0.8px)] [background-position:12px_12px] [background-size:24px_24px] max-sm:min-h-[360px] ${tool === 'eraser' ? 'cursor-none' : ''}`}
    >
      {size.width > 0 && size.height > 0 && (
        <Stage
          width={size.width}
          height={size.height}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onMouseDown}
          onTouchMove={onMouseMove}
          onTouchEnd={onMouseLeave}
        >
          <Layer>
            {elements.map((element) => element.kind === 'line' ? (
              <SelectableStroke
                key={element.id}
                id={element.id}
                points={element.points}
                tool={element.tool}
                color={element.color}
                width={element.width}
                selected={selectedElementId === element.id}
                selectable={tool === 'pointer' && element.tool === 'pen'}
                registerNode={registerNode}
                onSelect={onSelectElement}
                onPointsChange={onStrokePointsChange}
              />
            ) : null)}
          </Layer>
          <Layer>
            {elements.map((element) => element.kind === 'shape' ? (
              <SelectableShape
                key={element.id}
                shape={element}
                selected={selectedElementId === element.id}
                selectable={tool === 'pointer'}
                registerNode={registerNode}
                onSelect={onSelectElement}
                onGeometryChange={onShapeGeometryChange}
              />
            ) : null)}
            <Transformer
              ref={transformerRef}
              listening={tool === 'pointer'}
              rotateEnabled={false}
              keepRatio={false}
              flipEnabled={false}
              enabledAnchors={['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']}
              borderStroke="#7158df"
              anchorStroke="#7158df"
              anchorFill="#ffffff"
              anchorSize={8}
            />
          </Layer>
          {tool === 'eraser' && eraserPosition && (
            <Layer listening={false}>
              <Circle
                x={eraserPosition.x}
                y={eraserPosition.y}
                radius={eraserSize / 2}
                fill="rgba(113, 88, 223, 0.08)"
                stroke="#7158df"
                strokeWidth={1.5}
                dash={[4, 3]}
              />
            </Layer>
          )}
        </Stage>
      )}
      {elements.length === 0 && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-[13px] text-[#c0bec8]">
          Start drawing anywhere on the canvas
        </div>
      )}
    </div>
  );
}
