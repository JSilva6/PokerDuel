import React, { useState, useRef, useEffect } from 'react';

type FloatingWindowProps = {
  width: number;
  height: number;
  initialX: number;
  initialY: number;
  children: React.ReactNode;
  title?: string;
};

const FloatingWindow: React.FC<FloatingWindowProps> = ({
  width,
  height,
  initialX,
  initialY,
  children,
  title = 'Janela',
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const windowRef = useRef<HTMLDivElement>(null);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const onMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={windowRef}
      style={{
        position: 'absolute',
        top: position.y,
        left: position.x,
        width,
        height,
        border: '1px solid #ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        zIndex: 1000,
      }}
    >
      <div
        onMouseDown={onMouseDown}
        style={{
          height: 30,
          backgroundColor: '#007acc',
          color: '#fff',
          padding: '4px 10px',
          cursor: 'move',
          display: 'flex',
          alignItems: 'center',
          fontWeight: 'bold',
        }}
      >
        {title}
      </div>
      <div style={{ padding: 10, height: height - 30, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
};

export default FloatingWindow;

