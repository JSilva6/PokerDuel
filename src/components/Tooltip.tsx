import React from 'react';
import '../styles/game.css';

interface TooltipProps {
  lines: string[];
  x: number;
  y: number;
  bottom?: boolean;
}

/** Tooltip flutuante que segue o mouse */
const Tooltip: React.FC<TooltipProps> = ({ lines, x, y, bottom = false }) => (
  <div
    className={`tooltip ${bottom ? 'tooltip-bottom' : ''}`}
    style={
      bottom
        ? { left: x, bottom: window.innerHeight - y }
        : { top: y, left: x }
    }
  >
    {lines.map((line, idx) => (
      <React.Fragment key={idx}>
        <div>{line}</div>
        {idx === 0 && lines.length > 1 && <div className="tooltip-divider" />}
      </React.Fragment>
    ))}
  </div>
);

export default Tooltip;
