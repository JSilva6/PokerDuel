import React, { useRef, useState, useLayoutEffect } from 'react';
import '../styles/game.css';

/**
 * Container que ajusta automaticamente o espaçamento ou sobreposição
 * de acordo com a largura disponível.
 */
export const OverlapContainer: React.FC<{
  count: number;
  children: React.ReactNode;
}> = ({ count, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [gap, setGap] = useState(4);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const avail = el.clientWidth;
    const cardW = 56;
    const needed = count * cardW;
    if (needed <= avail) {
      setGap(4);
    } else {
      const overlap = Math.ceil((needed - avail) / (count - 1));
      setGap(-Math.min(overlap, cardW - 8));
    }
  }, [count]);

  return (
    <div ref={ref} className="overlap-container">
      {React.Children.map(children, (child, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : `${gap}px` }}>
          {child}
        </div>
      ))}
    </div>
  );
};

