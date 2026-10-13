import React from 'react';
import { Stage, Layer, Line, Text } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';

type DrawingTool = 'pen' | 'eraser';

type DrawingLine = {
  tool: DrawingTool;
  points: number[];
};

const Canvas = () => {
  const [tool, setTool] = React.useState<DrawingTool>('pen');
  const [lines, setLines] = React.useState<DrawingLine[]>([]);
  const isDrawing = React.useRef(false);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    isDrawing.current = true;
    const pos = e.target.getStage()?.getPointerPosition();

    if (!pos) {
      return;
    }

    setLines((prevLines) => [...prevLines, { tool, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isDrawing.current) {
      return;
    }

    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();

    if (!point) {
      return;
    }

    setLines((prevLines) => {
      const lastLine = prevLines[prevLines.length - 1];

      if (!lastLine) {
        return prevLines;
      }

      const updatedLines = [...prevLines];
      updatedLines[updatedLines.length - 1] = {
        ...lastLine,
        points: [...lastLine.points, point.x, point.y],
      };

      return updatedLines;
    });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  return (
    <div>
      <select
        value={tool}
        onChange={(e) => {
          setTool(e.target.value as DrawingTool);
        }}
      >
        <option value="pen">Pen</option>
        <option value="eraser">Eraser</option>
      </select>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          <Text text="Just start drawing" x={5} y={30} />
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="#df4b26"
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;