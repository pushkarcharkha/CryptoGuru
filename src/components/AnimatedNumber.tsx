import { useEffect, useState, useRef } from 'react';

const animateNumber = (from: number, to: number, duration: number, setter: (val: number) => void) => {
  const start = Date.now();
  const update = () => {
    const progress = Math.min((Date.now() - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
    setter(from + (to - from) * eased);
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };
  requestAnimationFrame(update);
};

export const AnimatedNumber = ({ 
  value, 
  format,
  className = ''
}: { 
  value: number; 
  format: (n: number) => string;
  className?: string;
}) => {
  // If value is null/undefined, safe fallback
  const safeValue = value || 0;
  const [displayValue, setDisplayValue] = useState(safeValue);
  const prevValueRef = useRef(safeValue);

  useEffect(() => {
    if (prevValueRef.current !== safeValue) {
      animateNumber(prevValueRef.current, safeValue, 800, setDisplayValue);
      prevValueRef.current = safeValue;
    }
  }, [safeValue]);

  return <span className={`mono ${className}`}>{format(displayValue)}</span>;
};
